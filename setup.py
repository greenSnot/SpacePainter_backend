import json
import sys

if sys.platform.find('linux') < 0:
    sys.exit()

def run_script(script, stdin=None):
    """Returns (stdout, stderr), raises error on non-zero return code"""
    import subprocess
    # Note: by using a list here (['bash', ...]) you avoid quoting issues, as the
    # arguments are passed in exactly this order (spaces, quotes, and newlines won't
    # cause problems):
    proc = subprocess.Popen(['bash', '-c', script],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        stdin=subprocess.PIPE)
    stdout, stderr = proc.communicate()
    stdout = stdout.decode('utf-8', 'ignore')

    if proc.returncode:
        print stderr
    return stdout, stderr

with open(sys.path[0] + '/config.ini') as json_data:
    config = json.load(json_data)

def split(t,pattern):
    s=t[:]
    pattern_len=len(pattern)
    res=[]
    while s.find(pattern)>=0:
        res.append(s[:s.find(pattern)])
        s=s[pattern_len+s.find(pattern):]
    res.append(s)
    return res

def run_scripts(scripts):
    scripts = split(scripts, '\n')
    res = ''
    for i in scripts:
        if len(i) == 0:
            continue
        res += i + ' && '
    res = res[:-3]
    print res
    run_script(res)

# install packages
for i in config['packages']:
    command = 'sudo apt-get install -y ' + i
    print command
    try:
        res, err = run_script(command)
    except:
        print 'error occur:' + command
        sys.exit()

# install pip packages
for i in config['pip-packages']:
    command = 'pip install ' + i
    print command
    try:
        res, err = run_script(command)
    except:
        print 'error occur:' + command
        sys.exit()

# install nodejs & npm
print('install nodejs & npm')
run_script('curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -')
run_script('sudo apt-get install -y nodejs')

run_scripts(config['command'])
