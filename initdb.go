package main

import "fmt"
import "io/ioutil"
import "gopkg.in/mgo.v2"
import "gopkg.in/mgo.v2/bson"
import "strings"
import "strconv"
import "github.com/xiam/exif"


type Photo struct{
    Location string;
    Name string;
    Size string;
    Width int;
    Height int;
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
        fmt.Println(l+file.Name())
        if strings.Contains(strings.ToLower(file.Name()), "jpg"){
            
            data, _ := exif.Read(l + file.Name())

            width, _ := strconv.Atoi(data.Tags["Pixel X Dimension"])
            height, _ := strconv.Atoi(data.Tags["Pixel Y Dimension"])
            orientation := data.Tags["Orientation"]
            fmt.Printf("%s\n", orientation)

            if orientation == "Left-bottom" || orientation =="Right-top"{
                temp := width
                width = height
                height = temp
                fmt.Println("rotate");
            }


            err = photos.Insert(&Photo{GalleryId: i,
                                        Width: width,
                                        Height: height,
                                        Location: l,
                                        Name: file.Name()})
            if err != nil {
                panic(err)
            }
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
