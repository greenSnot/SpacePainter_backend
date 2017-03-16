import os
import hashlib
import json
import sys

cur_path = sys.path[0]
def createDir(d):
    if not os.path.exists(d):
        os.makedirs(d)

def read_if_exist(f):
    try:
        content = open(f).read()
    except Exception as err:
        return False
    return content

def sha1(a):
    m2 = hashlib.sha1()
    m2.update(a)
    return m2.hexdigest()

def compare(content1, content2):
    if content1:
        hash1 = sha1(content1)
        hash2 = sha1(content2)
        return hash1 == hash2
    return False

def write(filename, content, append=False):
    content1 = read_if_exist(filename)
    if compare(content1, content):
        print filename + ' is not changed'
        return
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
write(cur_path + '/build/host_config.json', json.dumps(config['host']))
write(cur_path + '/build/wechat_config.json', json.dumps(config['wechat']))
write(cur_path + '/build/cdn_config.json', json.dumps(config['cdn']))
write(cur_path + '/build/mongo_client.json', json.dumps(config['mongo']['client']))
write(cur_path + '/build/redis_client.json', json.dumps(config['redis']['client']))
write(cur_path + '/build/sources.list', config['apt_sources'])
