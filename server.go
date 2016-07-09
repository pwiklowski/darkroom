package main

import "github.com/kataras/iris"
import "gopkg.in/mgo.v2"
import "gopkg.in/mgo.v2/bson"
import "fmt"


type Photo struct{
    Id bson.ObjectId `bson:"_id"`
    Location string;
    Width int;
    Height int;
    Size string;
    Comment string;
    GalleryId bson.ObjectId;
    Name string;
}

type Gallery struct{
    Id bson.ObjectId `bson:"_id"`
    Name string;
    Comment string;
}


func main(){
    session, err := mgo.Dial("127.0.0.1")
    if err != nil {
        panic(err)
    }
    defer session.Close()

    db := session.DB("test1");

    iris.Static("/static", "static/", 1)
    iris.Static("/js", "js/dist/", 1)

    iris.Get("/", func(c *iris.Context) {
        c.ServeFile("static/index.html", false)
    })

    iris.Get("/galleries", func(c *iris.Context) {
        galleries := []Gallery{}
        db.C("galleries").Find(nil).All(&galleries)
        c.JSON(iris.StatusOK, galleries)
    })


    iris.Get("/gallery/:galleryId", func(c *iris.Context) {
        gallery := Gallery{}
        galleryId := c.Param("galleryId")
        fmt.Println(galleryId)
        err := db.C("galleries").Find(bson.M{"_id":bson.ObjectIdHex(galleryId)}).One(&gallery)
        if err != nil {
            println("error: " + err.Error())
        }
        c.JSON(iris.StatusOK, gallery)
    })

    iris.Get("/gallery/:galleryId/photos", func(c *iris.Context) {
        photos := []Photo{}
        galleryId := c.Param("galleryId")
        db.C("photos").Find(bson.M{"galleryid":bson.ObjectIdHex(galleryId)}).All(&photos)
        c.JSON(iris.StatusOK, photos)
    })


    iris.Get("/photo/:photo/:size", func(c *iris.Context) {
        photo := Photo{}
        photoId := c.Param("photo")
        size := c.Param("size")
        db.C("photos").Find(bson.M{"_id":bson.ObjectIdHex(photoId)}).One(&photo)
        fmt.Println(photo)

        if size == "info" {
            c.JSON(iris.StatusOK, photo)
        }else{
            err := c.ServeFile(photo.Location + size+"_"+photo.Name, false)
            if err != nil {
                println("error: " + err.Error())
            }
        }
    })


    iris.Listen(":8080")
}
