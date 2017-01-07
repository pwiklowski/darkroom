#!/bin/sh


export FIREBASE_CONFIG=/cred.json
export PHOTOS_LOCATION=/hdd/temp/darkroom_prod
export DATABASE_LOCATION=/home/pawwik/dev/darkroom_go/mydatabase

./build.sh
docker-compose up -d
