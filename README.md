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

## MongoDB

### Installation on Raspberry PI

Instructions from https://linuxhint.com/install-mongodb-raspberry-pi/