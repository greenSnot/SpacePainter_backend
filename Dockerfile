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
