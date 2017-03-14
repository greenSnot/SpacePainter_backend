cp config.py.example config.py
// change config.py

// run container
python ./build_config.py
docker build -t ubuntu:init .
docker run -t -p 29017:29017 -p 6002:6002 -p 8081:80 --name www -d ubuntu:init

// go into container
docker exec -it www /bin/bash

// stop container
docker stop www
docker rm www
