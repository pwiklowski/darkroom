package main

import "github.com/kataras/iris"
import "github.com/kataras/iris/config"
import "gopkg.in/mgo.v2"
import "gopkg.in/mgo.v2/bson"
import "fmt"
import "os"
import "strconv"
import "io"
import "github.com/xiam/exif"

type Photo struct {
	Id        bson.ObjectId `bson:"_id"`
	Location  string
	Width     int
	Height    int
	Size      string
	Comment   string
	GalleryId bson.ObjectId
	Name      string
}

type Gallery struct {
	Id      bson.ObjectId `bson:"_id"`
	Name    string
	Comment string
}

func main() {
	session, err := mgo.Dial("127.0.0.1")
	if err != nil {
		panic(err)
	}
	defer session.Close()

	photoLocation := "/hdd/temp/dark_temp"

	db := session.DB("test1")

	api := iris.New(config.Iris{MaxRequestBodySize: 32 << 20})
	api.Static("/static", "static/", 1)
	api.Static("/js", "js/dist/", 1)

	api.Get("/", func(c *iris.Context) {
		c.ServeFile("static/index.html", false)
	})

	api.Get("/galleries", func(c *iris.Context) {
		galleries := []Gallery{}
		db.C("galleries").Find(nil).All(&galleries)
		c.JSON(iris.StatusOK, galleries)
	})

	api.Get("/gallery/:galleryId", func(c *iris.Context) {
		gallery := Gallery{}
		galleryId := c.Param("galleryId")
		fmt.Println(galleryId)
		err := db.C("galleries").Find(bson.M{"_id": bson.ObjectIdHex(galleryId)}).One(&gallery)
		if err != nil {
			println("error: " + err.Error())
		}
		c.JSON(iris.StatusOK, gallery)
	})

	api.Get("/gallery/:galleryId/photos", func(c *iris.Context) {
		photos := []Photo{}
		galleryId := c.Param("galleryId")
		db.C("photos").Find(bson.M{"galleryid": bson.ObjectIdHex(galleryId)}).All(&photos)
		c.JSON(iris.StatusOK, photos)
	})

	api.Get("/photo/:photo/:size", func(c *iris.Context) {
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
		fmt.Println("new photo")
		galleryId := c.Param("galleryId")
		p := Photo{Id: bson.NewObjectId()}

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

		p.Location = photoLocation + "/" + galleryId + "/" + p.Id.Hex()

		os.MkdirAll(photoLocation+"/"+galleryId, 0777)

		out, err := os.OpenFile(p.Location, os.O_WRONLY|os.O_CREATE, 0666)
		if err != nil {
			fmt.Println(err)
			return
		}
		defer out.Close()

		io.Copy(out, file)

		data, _ := exif.Read(p.Location)

		width, _ := strconv.Atoi(data.Tags["Pixel X Dimension"])
		height, _ := strconv.Atoi(data.Tags["Pixel Y Dimension"])
		orientation := data.Tags["Orientation"]

		if orientation == "Left-bottom" || orientation == "Right-top" {
			temp := width
			width = height
			height = temp
		}

		p.Width = width
		p.Height = height

		c.JSON(iris.StatusOK, p)
	})
	api.Post("/createGallery", func(c *iris.Context) {
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

	api.Listen(":8080")
}
