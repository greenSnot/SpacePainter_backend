docker rm $(docker ps -q -f status=exited)
docker stop www
docker rm www
