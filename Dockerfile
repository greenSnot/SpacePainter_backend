FROM ubuntu:14.04
MAINTAINER Patrick
ADD ./sources.list /etc/apt/
RUN apt-get update
ADD ./config.ini /root/
RUN apt-get install -y git
RUN apt-get install -y python
RUN apt-get install -y wget
ADD ./setup.py /root/
RUN python -u /root/setup.py
# install ohmyzsh
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true

# install mongo3.4
RUN sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
RUN echo "deb [ arch=amd64 ] http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
RUN sudo apt-get update
RUN sudo apt-get install -y mongodb-org
RUN sudo mkdir /data
RUN sudo mkdir /data/db
RUN sudo chmod 777 -R /data

ADD ./mongo.password /root/
RUN sudo mongod --port 29017 --fork --logpath /root/mongodb.log --logappend && sleep 5 && mongo --port 29017 admin "/root/mongo.password"
ENTRYPOINT sudo mongod --port 29017 --auth --logpath /root/mongodb.log --logappend
