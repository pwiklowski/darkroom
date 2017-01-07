export DOCKER_HOST=tcp://192.168.0.11:5000

export FIREBASE_CONFIG=/cred.json
export PHOTOS_LOCATION=/home/pwiklowski/darkroom/data
export DATABASE_LOCATION=/home/pwiklowski/darkroom/db

sh build.sh
docker-compose up -d
