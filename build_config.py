import os
import json
import sys

cur_path = sys.path[0]
def createDir(d):
    if not os.path.exists(d):
        os.makedirs(d)

def write(filename, content, append=False):
    type='w'
    if append:
        type = 'a'
    fileObj = open(filename, type, -1)
    fileObj.write(content)
    fileObj.close()

createDir(cur_path + '/build')

execfile(cur_path + '/config.py')
write(cur_path + '/build/docker_config', json.dumps(config['docker']))
write(cur_path + '/build/mongo_config', config['mongo']['command'])
write(cur_path + '/build/redis_config', json.dumps(config['redis']))
write(cur_path + '/build/sources.list', config['apt_sources'])
