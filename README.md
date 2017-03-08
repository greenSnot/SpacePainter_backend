cp config.py.example config.py
// change config.py

python build_config.py
docker build -t ubuntu:init .
docker run -p 29017:29017 -d ubuntu:init
