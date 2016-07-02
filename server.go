package main

import "github.com/kataras/iris"
import "gopkg.in/mgo.v2"
import "gopkg.in/mgo.v2/bson"


type Photo struct{
    Location string;
    Size string;
    Comment string;
    GalleryId bson.ObjectId;
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

    iris.Get("/galleries", func(c *iris.Context) {
        galleries := []Gallery{}
        db.C("galleries").Find(nil).All(&galleries)
        c.JSON(iris.StatusOK, galleries)
    })

    iris.Get("/gallery/:gallery/photos", func(c *iris.Context) {
        photos := []Photo{}
        galleryId := c.Param("gallery")
        db.C("photos").Find(bson.M{"galleryid":bson.ObjectIdHex(galleryId)}).All(&photos)
        c.JSON(iris.StatusOK, photos)
    })

    iris.Get("/photo/:photo", func(c *iris.Context) {
        photo := Photo{}
        photoId := c.Param("photo")
        db.C("photos").Find(bson.M{"_id":bson.ObjectIdHex(photoId)}).One(&photo)

        err := c.ServeFile(photo.Location, false)
        if err != nil {
            println("error: " + err.Error())
        }
    })

    iris.Listen(":8080")
}
