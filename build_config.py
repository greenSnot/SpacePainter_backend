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
write(cur_path + '/Dockerfile', config['docker_file'])
write(cur_path + '/build/docker_config', json.dumps(config['docker']))
write(cur_path + '/build/mongo_command', config['mongo']['server']['command'])
write(cur_path + '/build/http_config.json', json.dumps(config['http']))
write(cur_path + '/build/wechat_config.json', json.dumps(config['wechat']))
write(cur_path + '/build/cdn_config.json', json.dumps(config['cdn']))
write(cur_path + '/build/mongo_client.json', json.dumps(config['mongo']['client']))
write(cur_path + '/build/redis_client.json', json.dumps(config['redis']['client']))
write(cur_path + '/build/sources.list', config['apt_sources'])
