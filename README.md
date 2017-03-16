cp config.py.example config.py
// change config.py

// install modules
cd www && npm install

// run container
python ./build_config.py
docker build -t ubuntu:init .
docker run -t -p 29017:29017 -p 6002:6002 -p 8081:80 --name www -d ubuntu:init

// go into container
docker exec -it www /bin/bash

// stop container
docker stop www
docker rm www

1) static page1.html
2) (page1.html)request user info
2.5) if need login 2.6), else 3)
2.6) (page1.html)request backend for redirect code
2.6) (page1.html)redirect wechat auth & confirm
2.7) (backend) receive get /wechat_code_callback ... login
2.8) redirect page1.html
2.9) back to 2)
3) update user info
