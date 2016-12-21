package main

import (
	"fmt"
	"image"
	_ "image/jpeg"
	"io"
	"math/rand"
	"os"
	"os/exec"
	"time"

	"github.com/kataras/iris"
	"github.com/kataras/iris/config"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"

	"errors"

	firebase "github.com/wuman/firebase-server-sdk-go"
)

type Token struct {
	Token   string
	ValidTo int64
	UserID  string
}

type User struct {
	UserID      string
	IsSuperuser bool
}

type Photo struct {
	Id          bson.ObjectId `_id`
	Location    string
	Width       int
	Height      int
	Size        string
	Comment     string
	GalleryId   bson.ObjectId
	Name        string
	Resolutions []string
	UsersIDs    []string
}

type Gallery struct {
	Id         bson.ObjectId `_id`
	Name       string
	Comment    string
	CoverPhoto bson.ObjectId `bson:",omitempty"`
	UsersIDs   []string
}

func (p Photo) getLocation() string {
	return p.Location + p.Name
}
func (p Photo) getLocationScalled(size string) string {
	return p.Location + size + "_" + p.Name
}

func verifyAccess(auth *firebase.Auth, c *iris.Context) bool {
	token := c.RequestHeader("Authorization")

	decodedToken, err := auth.VerifyIDToken(token)
	if err == nil {
		uid, found := decodedToken.UID()
		fmt.Println(uid)
		return found
	}
	return false
}

func getUserID(auth *firebase.Auth, c *iris.Context) string {
	token := c.RequestHeader("Authorization")
	decodedToken, err := auth.VerifyIDToken(token)
	if err == nil {
		uid, found := decodedToken.UID()
		fmt.Println(uid, found)

		return uid
	}
	return ""
}

func isSuperuser(auth *firebase.Auth, c *iris.Context, db *mgo.Database) bool {
	token := c.RequestHeader("Authorization")

	decodedToken, err := auth.VerifyIDToken(token)
	if err == nil {
		uid, found := decodedToken.UID()
		if found {
			return isSuperuserUID(uid, db)
		}
	}
	return false
}

func isSuperuserUID(uid string, db *mgo.Database) bool {
	user := User{}
	err := db.C("users").Find(bson.M{"userid": uid}).One(&user)

	if err == nil {
		return user.IsSuperuser
	}
	return false
}
func (p *Photo) convertPhoto() {

	fmt.Println("convertPhoto " + p.getLocation())

	resolutions := []string{"320", "640", "1280", "1920", "3840"}

	for _, res := range resolutions {
		cmd := exec.Command("convert", p.getLocation(), "-quality", "90", "-resize", res, p.Location+res+"_"+p.Name)
		cmd.Start()
		cmd.Wait()
	}

	p.Resolutions = resolutions
}

func getImageDimension(imagePath string) (int, int) {
	file, err := os.Open(imagePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
	}

	image, _, err := image.DecodeConfig(file)
	if err != nil {
		fmt.Fprintf(os.Stderr, "%s: %v\n", imagePath, err)
	}
	return image.Width, image.Height
}

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

func generateToken(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func getTokenIfValid(t string, collection *mgo.Collection) (Token, error) {
	token := Token{}
	now := time.Now()

	err := collection.Find(bson.M{"token": t}).One(&token)
	fmt.Println(err)
	if err == nil {
		fmt.Printf("%d %d\n", token.ValidTo, now.Unix())
		if token.ValidTo > now.Unix() {
			return token, nil
		} else {
			fmt.Println("Token is expired")
			return token, errors.New("Token is expired")
		}
	}
	fmt.Println("Token not found")
	return token, errors.New("Not found")
}

func main() {
	firebase.InitializeApp(&firebase.Options{
		ServiceAccountPath: "cred.json",
	})

	auth, _ := firebase.GetAuth()
	session, err := mgo.Dial("127.0.0.1")
	if err != nil {
		panic(err)
	}
	defer session.Close()

	photoLocation := "/hdd/temp/dark_temp"

	db := session.DB("test1")
	photosDb := db.C("photos")
	usersDb := db.C("users")
	tokensDb := db.C("tokens")

	api := iris.New(config.Iris{MaxRequestBodySize: 32 << 20})

	api.Get("/token", func(c *iris.Context) {
		uid := getUserID(auth, c)
		if uid == "" {
			c.JSON(iris.StatusForbidden, nil)
			return
		}

		now := time.Now()
		token := Token{}
		token.ValidTo = now.Unix() + 120
		token.Token = generateToken(48)
		token.UserID = uid
		tokensDb.Insert(&token)
		c.JSON(iris.StatusOK, token)
	})

	api.Get("/users", func(c *iris.Context) {
		if !verifyAccess(auth, c) {
			c.JSON(iris.StatusForbidden, nil)
			return
		}

		users := []User{}
		usersDb.Find(nil).All(&users)
		c.JSON(iris.StatusOK, users)
	})

	api.Get("/user/:userID", func(c *iris.Context) {
		if !verifyAccess(auth, c) {
			c.JSON(iris.StatusForbidden, nil)
			return
		}
		userID := c.Param("userID")

		user := User{}
		usersDb.Find(bson.M{"userid": userID}).One(&user)
		c.JSON(iris.StatusOK, user)
	})

	api.Post("/user/:userID", func(c *iris.Context) {
		if !isSuperuser(auth, c, db) {
			c.JSON(iris.StatusForbidden, nil)
			return
		}
		userID := c.Param("userID")

		sentUser := User{}
		c.ReadJSON(&sentUser)

		user := User{}
		err := usersDb.Find(bson.M{"userid": userID}).One(&user)
		if err != nil {
			user.UserID = userID
			usersDb.Insert(user)
		}

		user.IsSuperuser = sentUser.IsSuperuser
		usersDb.Update(bson.M{"userid": userID}, user)
		c.JSON(iris.StatusOK, user)
	})

	api.Get("/galleries", func(c *iris.Context) {
		uid := getUserID(auth, c)

		if uid == "" {
			c.JSON(iris.StatusForbidden, nil)
			return
		}
		galleries := []Gallery{}

		if isSuperuser(auth, c, db) {
			db.C("galleries").Find(nil).All(&galleries)
		} else {
			db.C("galleries").Find(bson.M{"userids": uid}).All(&galleries)
		}

		c.JSON(iris.StatusOK, galleries)
	})

	api.Get("/gallery/:galleryId", func(c *iris.Context) {
		uid := getUserID(auth, c)
		if uid == "" {
			c.JSON(iris.StatusForbidden, nil)
			return
		}

		gallery := Gallery{}
		galleryID := c.Param("galleryId")

		if isSuperuser(auth, c, db) {
			db.C("galleries").Find(bson.M{"_id": bson.ObjectIdHex(galleryID)}).One(&gallery)
		} else {
			db.C("galleries").Find(bson.M{"userids": uid, "_id": bson.ObjectIdHex(galleryID)}).All(&gallery)
		}

		c.JSON(iris.StatusOK, gallery)
	})
	api.Get("/gallery/:galleryId/cover", func(c *iris.Context) {
		photo := Photo{}
		galleryID := c.Param("galleryId")
		tokenID := c.URLParam("token")

		token, err := getTokenIfValid(tokenID, tokensDb)

		if err != nil {
			c.JSON(iris.StatusForbidden, nil)
			return
		}

		if isSuperuserUID(token.UserID, db) {
			db.C("photos").Find(bson.M{"galleryid": bson.ObjectIdHex(galleryID)}).One(&photo)
		} else {
			db.C("photos").Find(bson.M{"userids": token.UserID, "galleryid": bson.ObjectIdHex(galleryID)}).One(&photo)
		}

		size := "1920"
		location := photo.getLocationScalled(size)
		err = c.ServeFile(location, false)
		if err != nil {
			c.JSON(iris.StatusNotFound, nil)
		}

	})

	api.Get("/gallery/:galleryId/photos", func(c *iris.Context) {
		uid := getUserID(auth, c)
		fmt.Println(uid)
		if uid == "" {
			c.JSON(iris.StatusForbidden, nil)
			return
		}
		photos := []Photo{}
		galleryID := c.Param("galleryId")

		if isSuperuser(auth, c, db) {
			db.C("photos").Find(bson.M{"galleryid": bson.ObjectIdHex(galleryID)}).All(&photos)
		} else {
			gallery := Gallery{}
			err := db.C("galleries").Find(bson.M{"userids": uid, "_id": bson.ObjectIdHex(galleryID)}).One(&gallery)
			fmt.Println(gallery)
			if err != nil {
				c.JSON(iris.StatusForbidden, nil)
				return
			}
			db.C("photos").Find(bson.M{"galleryid": bson.ObjectIdHex(galleryID)}).All(&photos)
		}

		c.JSON(iris.StatusOK, photos)
	})

	api.Delete("/photo/:photo", func(c *iris.Context) {
		if !isSuperuser(auth, c, db) {
			c.JSON(iris.StatusForbidden, nil)
			return
		}

		photo := Photo{}
		photoID := c.Param("photo")
		db.C("photos").Find(bson.M{"_id": bson.ObjectIdHex(photoID)}).One(&photo)
		fmt.Println(photo)

		for i := 0; i < len(photo.Resolutions); i++ {
			fmt.Println(photo.Location + photo.Resolutions[i] + "_" + photo.Name)
			os.Remove(photo.Location + photo.Resolutions[i] + "_" + photo.Name)
		}
		db.C("photos").Remove(bson.M{"_id": bson.ObjectIdHex(photoID)})

		c.JSON(iris.StatusOK, nil)
	})
	api.Get("/photo/:photo/:size", func(c *iris.Context) {
		tokenID := c.URLParam("token")

		token, err := getTokenIfValid(tokenID, tokensDb)
		if err != nil {
			c.JSON(iris.StatusForbidden, nil)
			return
		}

		photo := Photo{}
		photoID := c.Param("photo")
		size := c.Param("size")
		fmt.Println(token)

		if isSuperuserUID(token.UserID, db) {
			db.C("photos").Find(bson.M{"_id": bson.ObjectIdHex(photoID)}).One(&photo)
		} else {
			db.C("photos").Find(bson.M{"_id": bson.ObjectIdHex(photoID)}).One(&photo)
			gallery := Gallery{}
			err := db.C("galleries").Find(bson.M{"userids": token.UserID, "_id": photo.GalleryId}).One(&gallery)
			if err != nil {
				c.JSON(iris.StatusForbidden, nil)
				return
			}
		}

		if size == "info" {
			c.JSON(iris.StatusOK, photo)
		} else {
			err := c.ServeFile(photo.Location+size+"_"+photo.Name, false)
			if err != nil {
				println("error: " + err.Error())
				c.JSON(iris.StatusNotFound, nil)
			}
		}
	})

	api.Post("/gallery/:galleryId/upload", func(c *iris.Context) {
		if !isSuperuser(auth, c, db) {
			c.JSON(iris.StatusForbidden, nil)
			return
		}
		fmt.Println("new photo")
		galleryId := c.Param("galleryId")

		id := bson.NewObjectId()

		p := Photo{Id: id, GalleryId: bson.ObjectIdHex(galleryId)}

		// Get the file from the request
		info, err := c.FormFile("file")
		if err != nil {
			fmt.Println(err)
		}
		file, err := info.Open()
		if err != nil {
			fmt.Println(err)
		}
		defer file.Close()

		fname := info.Filename
		fmt.Println(fname)

		p.Location = photoLocation + "/" + galleryId + "/"
		p.Name = p.Id.Hex() + ".jpg"

		os.MkdirAll(p.Location, 0777)

		out, err := os.OpenFile(p.getLocation(), os.O_WRONLY|os.O_CREATE, 0666)
		if err != nil {
			fmt.Println(err)
			return
		}
		defer out.Close()

		io.Copy(out, file)

		p.Width, p.Height = getImageDimension(p.getLocation())

		p.convertPhoto()

		err = photosDb.Insert(p)
		if err != nil {
			fmt.Println(err)
		}

		c.JSON(iris.StatusOK, p)
	})

	api.Delete("/gallery/:galleryId", func(c *iris.Context) {
		if !isSuperuser(auth, c, db) {
			c.JSON(iris.StatusForbidden, nil)
			return
		}

		err := db.C("galleries").Remove(bson.M{"_id": bson.ObjectIdHex(c.Param("galleryId"))})
		if err != nil {
			c.JSON(iris.StatusNotFound, nil)
			return
		}

		photos := []Photo{}
		galleryId := c.Param("galleryId")
		db.C("photos").Find(bson.M{"galleryid": bson.ObjectIdHex(galleryId)}).All(&photos)

		for j := 0; j < len(photos); j++ {
			photo := photos[j]

			for i := 0; i < len(photo.Resolutions); i++ {
				fmt.Println(photo.Location + photo.Resolutions[i] + "_" + photo.Name)
				os.Remove(photo.Location + photo.Resolutions[i] + "_" + photo.Name)
			}
			os.Remove(photo.Location + photo.Name)
			os.Remove(photo.Location)
			db.C("photos").Remove(bson.M{"_id": photo.Id})
		}

		c.JSON(iris.StatusOK, nil)
	})
	api.Post("/gallery/:galleryId", func(c *iris.Context) {
		if !isSuperuser(auth, c, db) {
			c.JSON(iris.StatusForbidden, nil)
			return
		}
		g := Gallery{}
		c.ReadJSON(&g)

		g.Id = bson.ObjectIdHex(c.Param("galleryId"))

		err := db.C("galleries").Update(bson.M{"_id": g.Id}, g)
		if err != nil {
			println("error: " + err.Error())
		}

		c.JSON(iris.StatusOK, g)
	})
	api.Post("/createGallery", func(c *iris.Context) {
		if !isSuperuser(auth, c, db) {
			c.JSON(iris.StatusForbidden, nil)
			return
		}
		galleries := db.C("galleries")

		g := Gallery{}
		c.ReadJSON(&g)

		i := bson.NewObjectId()
		g.Id = i

		fmt.Println(g)
		err := galleries.Insert(g)
		if err != nil {
			panic(err)
		}

		c.JSON(iris.StatusOK, g)

	})

	api.Listen(":11001")
}
