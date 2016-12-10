package main

import (
	"fmt"
	"image"
	_ "image/jpeg"
	"io"
	"os"
	"os/exec"

	"github.com/kataras/iris"
	"github.com/kataras/iris/config"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"

	firebase "github.com/wuman/firebase-server-sdk-go"
)

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
}

type Gallery struct {
	Id         bson.ObjectId `_id`
	Name       string
	Comment    string
	CoverPhoto bson.ObjectId `bson:",omitempty"`
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

func (p Photo) convertPhoto() {

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

	api := iris.New(config.Iris{MaxRequestBodySize: 32 << 20})

	api.Get("/galleries", func(c *iris.Context) {
		if !verifyAccess(auth, c) {
			c.JSON(iris.StatusForbidden, nil)
			return
		}

		galleries := []Gallery{}
		db.C("galleries").Find(nil).All(&galleries)
		c.JSON(iris.StatusOK, galleries)
	})

	api.Get("/gallery/:galleryId", func(c *iris.Context) {
		if !verifyAccess(auth, c) {
			c.JSON(iris.StatusForbidden, nil)
			return
		}
		gallery := Gallery{}
		galleryId := c.Param("galleryId")
		fmt.Println(galleryId)
		err := db.C("galleries").Find(bson.M{"_id": bson.ObjectIdHex(galleryId)}).One(&gallery)
		if err != nil {
			println("error: " + err.Error())
		}
		c.JSON(iris.StatusOK, gallery)
	})
	api.Get("/gallery/:galleryId/cover", func(c *iris.Context) {
		if !verifyAccess(auth, c) {
			c.JSON(iris.StatusForbidden, nil)
			return
		}
		photo := Photo{}
		galleryId := c.Param("galleryId")
		db.C("photos").Find(bson.M{"galleryid": bson.ObjectIdHex(galleryId)}).One(&photo)
		fmt.Println(photo)

		size := "1920"

		location := photo.getLocationScalled(size)
		fmt.Println(location)

		err := c.ServeFile(location, false)
		if err != nil {
			println("error: " + err.Error())
		}

	})

	api.Get("/gallery/:galleryId/photos", func(c *iris.Context) {
		if !verifyAccess(auth, c) {
			c.JSON(iris.StatusForbidden, nil)
			return
		}
		photos := []Photo{}
		galleryId := c.Param("galleryId")
		db.C("photos").Find(bson.M{"galleryid": bson.ObjectIdHex(galleryId)}).All(&photos)
		c.JSON(iris.StatusOK, photos)
	})

	api.Get("/photo/:photo/:size", func(c *iris.Context) {
		if !verifyAccess(auth, c) {
			c.JSON(iris.StatusForbidden, nil)
			return
		}
		photo := Photo{}
		photoId := c.Param("photo")
		size := c.Param("size")
		db.C("photos").Find(bson.M{"_id": bson.ObjectIdHex(photoId)}).One(&photo)
		fmt.Println(photo)

		if size == "info" {
			c.JSON(iris.StatusOK, photo)
		} else {
			err := c.ServeFile(photo.Location+size+"_"+photo.Name, false)
			if err != nil {
				println("error: " + err.Error())
			}
		}
	})

	api.Post("/gallery/:galleryId/upload", func(c *iris.Context) {
		if !verifyAccess(auth, c) {
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
	api.Post("/createGallery", func(c *iris.Context) {
		if !verifyAccess(auth, c) {
			c.JSON(iris.StatusForbidden, nil)
			return
		}
		fmt.Println("new gallery")
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
