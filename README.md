# What is it ?

Darkroom is self hosted, web application for sharing photos. It uses Go + MongoDb as backednd and Angular2+HTML5 as frontend.  


# How to run it in docker containers ?

Docker compose was used to handle deployment process but before you type docker-compose up you have to create your own credentials.json file in Firebase console and put them into backend/cred.json location. 

Configuration in app.module.ts must be also updated with your own data:

```
var config = {
    apiKey: "AIzaSyCpISaYT7x11mYNQJSsTOoYUrUfiIOLIwI",
    authDomain: "darkroom-6977b.firebaseapp.com",
    databaseURL: "https://darkroom-6977b.firebaseio.com",
    storageBucket: "darkroom-6977b.appspot.com",
    messagingSenderId: "411805980860"
}
```

To run it you have to provide few additional environment variables. To simplify this process you can use this example deploy script. It calls build.sh script which is responsible for building both backed and frontend application.


```
#!/bin/sh

export PHOTOS_LOCATION=/photos
export DATABASE_LOCATION=/db
export ADMIN_UID=UID

./build.sh
docker-compose up -d
```

**PHOTOS_LOCATION** - is used to inform container where to store encoded photos (outside of container)
**DATABASE_LOCATION** - is used to inform container where to keep database files
**ADMIN_UID** - put here your user id from firebase console to make sure that you will always have superuser powers (it is needed to be able to grant superuser powers to other accounts) 



# To do
- improve this README :)
- add selecting optimal size of photos (they are encoded to smaller resolutions but now only 1920px version is used)
- add async photo encoding
- run some serious tests
- replace firebase with similar self-hosted application



#License
Apache 2