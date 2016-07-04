package main

import "fmt"
import "io/ioutil"
import "gopkg.in/mgo.v2"
import "gopkg.in/mgo.v2/bson"


type Photo struct{
    Location string;
    Name string;
    Size string;
    Comment string;
    GalleryId bson.ObjectId;
}

type Gallery struct{
    Id bson.ObjectId `bson: "_id"`
    Name string;
    Comment string;
    Key string;
}

func createGallery(name string, l string, db *mgo.Database){
    galleries := db.C("galleries")
    photos := db.C("photos")

    i := bson.NewObjectId()
    fmt.Println(i)

    err := galleries.Insert(&Gallery{Id: i, Name: name})
    if err != nil {
        panic(err)
    }

    files, _ := ioutil.ReadDir(l)

    for _, file  := range files {
        err := photos.Insert(&Photo{GalleryId: i, Location: l, Name: file.Name()})
        if err != nil {
            panic(err)
        }
    }
}



func test(db *mgo.Database) {
    //createGallery("testowa", "/hdd/temp/darkroom/", db)
    createGallery("Testowa galeria", "/hdd/temp/test2/", db)
}

func main(){
    session, err := mgo.Dial("127.0.0.1")
    if err != nil {
        panic(err)
    }
    defer session.Close()

    db := session.DB("test1");

    test(db)
}
