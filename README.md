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