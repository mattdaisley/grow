# Setup

## node

```sh
$ sudo apt update
$ sudo apt upgrade
```

install nvm using instructions at https://github.com/nvm-sh/nvm/blob/master/README.md

```sh
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

The script clones the nvm repository to ~/.nvm and adds the source line to your profile (~/.bash_profile, ~/.zshrc, ~/.profile, or ~/.bashrc).

```
$ export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

Now check if the nvm is installed by typing:

```
$ command -v nvm
```

The above command should return "nvm"

Now install the latest stable version of node.js by typing:

```
$ nvm install stable
```

Now type the following to see the version you have just installed:

```
$ node -v
```

Finally, install the PM2 package

```
$ npm install -g pm2
$ pm2 startup systemd -u <username>
$ sudo env PATH=$PATH:/usr/local/bin pm2 startup systemd -u pi --hp /home/pi
```

```
$ pm2 install pm2-logrotate
$ pm2 set pm2-logrotate:max_size 1K
```

# Install

On raspberry pi:

```
$ mkdir grow
$ cd grow
$ mkdir grow.serial.instance
```

On build machine assuming a build is already made:

```
$ npm run push:all
```

Update configuration to set correct WEBSOCKET_HOST (e.g. ws://localhost:3001/dynamic should set to deployed api)
On raspberry pi:

```
$ cd ~/grow/grow.serial.instance/
$ npm install
$ nano .env
```

```
$ pm2 start npm --name "grow.serial.instance" -- start
$ pm2 save
```

#
