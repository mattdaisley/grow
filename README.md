## Windows setup

Use nvm to install the latest lts of node and npm https://github.com/coreybutler/nvm-windows

Install Cygwin https://cygwin.com/install.html

Add the rsync package under the Net category

Save .pem file to connect to aws host in %USERPROFILE%/.ssh

## Docker

### Locally

```
docker build -t grow.client .
```

Then used visual studio Docker extension to push to Docker Hub

### On AWS EC2 instance

```
docker login
docker pull mattdaisley/grow.client:latest
docker run -p 8080:8080 -d mattdaisley/grow.client:latest
```

---------------------

# Old notes


## redis

### Installation on Raspberry Pi

Instructions from https://linuxhint.com/install-redis-raspberry-pi/

1. Install using apt get

```
sudo apt install redis-server -y
```

2. Start the service

```
sudo systemctl start redis.service
```

3. Check to make sure it's running

```
sudo systemctl status redis.service
```

## Install on AWS EC2 instance

```
wget -O /tmp/epel.rpm –nv https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
```

```
sudo yum install -y /tmp/epel.rpm
```

```
sudo yum update -y
```

```
sudo yum install redis -y
```

```
sudo systemctl start redis
```

```
sudo systemctl enable redis
```

```
redis-cli config get dir
```

- remove the existing service so a new one can be created that uses a redis.conf file
  ```
  sudo rm /etc/systemd/system/redis.service
  ```
  ```
  sudo rm /usr/lib/systemd/system/redis.service
  ```
  ```
  sudo systemctl daemon-reload
  ```
  ```
  sudo systemctl reset-failed
  ```
  ```
  sudo nano /etc/systemd/system/redis.service
  ```

```
[Unit]
Description=Redis
After=syslog.target

[Service]
ExecStart=/usr/bin/redis-server /var/lib/redis/redis.conf
RestartSec=5s
Restart=on-success

[Install]
WantedBy=multi-user.target
```

```
sudo nano /var/lib/redis/redis.conf
```

```
bind 0.0.0.0
protected-mode no
daemonize no
supervised systemd
```

```
sudo systemctl enable /etc/systemd/system/redis.service
```

```
sudo systemctl start redis.service
```

```
sudo systemctl status redis.service
```

### Testing

1. Start the redis cli

```cmd
redis-cli
```

2. Send ping command

```cmd
127.0.0.1:6379> ping
PONG
127.0.0.1:6379>
```

3. Set and receive a "Test Message"

```cmd
127.0.0.1:6379> set testmessage "Redis is Running"
OK
127.0.0.1:6379> get testmessage
"Redis is Running"
```

## pm2

```
sudo yum install nodejs npm --enablerepo=epel
```

## mysql

### Installation on Raspberry PI

Instructions from https://pimylifeup.com/raspberry-pi-mysql/

```
sudo apt install mariadb-server
```

```
sudo mysql_secure_installation
```

```
sudo mysql -u root -p
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 43
Server version: 10.3.36-MariaDB-0+deb10u2 Raspbian 10

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> CREATE DATABASE grow;
Query OK, 1 row affected (0.002 sec)

MariaDB [(none)]> CREATE USER 'growapi'@'localhost' IDENTIFIED BY 'pimylifeup';
Query OK, 0 rows affected (0.007 sec)

MariaDB [(none)]> GRANT ALL PRIVILEGES ON grow.* TO 'growapi'@'localhost';
Query OK, 0 rows affected (0.001 sec)
```
