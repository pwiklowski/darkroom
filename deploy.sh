export DOCKER_HOST=tcp://192.168.0.11:5000

export FIREBASE_CONFIG=cred.json
export PHOTOS_LOCATION=/hdd/temp/darkroom_prod
export DATABASE_LOCATION=/home/pawwik/dev/darkroom_go/mydatabase

sh build.sh
docker-compose up -d
