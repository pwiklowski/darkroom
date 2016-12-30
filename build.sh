#!/bin/sh

#webui
cd frontend
npm run build:prod

cd ../backend
#gobackend
go build server.go
cd ..

docker-compose build
