python ./build_config.py
docker build -t ubuntu:init .
docker run -t -p 29017:29017 -p 6002:6002 -p 80:80 --name www -d ubuntu:init
