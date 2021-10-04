## Compressio API &middot; [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

```
1. Compressio API is a Open Source production grade Image Compression API.
2. It's an easy to use API with no database and minimal configuration.
3. It compresses JPG, PNG, GIF & SVG images in both Lossy and Lossless formats.
4. Compressio API Open Source Frontend (React.js) is coming soon.
5. It can run on Linux, Unix (MacOS) and Windows with Node.js
6. We are working hard to include more features. 
```

## How to use   

#### POST Request, No GET
```
It receives all parameters in a POST request at https://example.com/compress.     
You can choose maximum 10 images at a time.
Total image size can't be larger than 50MB.
Send image with 'inImgs' key through POST request.
```

#### Compression Type
```
By Default image compression type is lossy.   
You can choose lossless compression with 'isLossy' key and value 'false' through POST request.
```

#### Compression Quality
```
Note : Compression Quality (imgQuality) won't work if isLossy is set to false.  
You can choose between 1-100 with 'imgQuality' key and value through POST request. 

Default JPG, PNG, SVG Image Compression Quality = 85.
Default GIF Image Compression Quality = 50.   
You can choose between 1-100 with 'imgQuality' key and value through POST request.
For GIF, do not choose any value lower than 50, quality loss will be significant.
```

#### Strip Meta
```
By Default image metadata will be stripped.   
You can choose not to strip meta with 'stripMeta' key and value 'false' through POST request.
```

![alt text](https://github.com/twoabd/CompressioAPI/blob/main/docs/default.png?raw=true)  

![alt text](https://github.com/twoabd/CompressioAPI/blob/main/docs/lossy.png?raw=true)  
 
![alt text](https://github.com/twoabd/CompressioAPI/blob/main/docs/lossless.png?raw=true)  

## Installation Documentation (Ubuntu 20.04 LTS)   

#### Install Nginx (Currently v1.18.0) and NodeJs LTS (Currently v14.17.6) on Ubuntu 20.04
```
sudo apt update
sudo apt install nginx -y

curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
cat /etc/apt/sources.list.d/nodesource.list
sudo apt  install nodejs -y
node  -v
```

#### Install PNGQuant, JPEGOptim, Gifsicle, Scour

```
sudo apt install jpegoptim
sudo apt install pngquant -y
sudo apt install optipng
sudo apt install gifsicle
sudo apt install scour -y
```

#### Updating Nginx conf in etc/nginx/nginx.conf
```
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
	worker_connections 768;
	multi_accept on;
}

http {

	# Basic Settings
	sendfile on;
	tcp_nopush on;
	tcp_nodelay on;
	keepalive_timeout 65;
	types_hash_max_size 2048;
        client_max_body_size 20M;

	include /etc/nginx/mime.types;
	default_type application/octet-stream;


	# SSL Settings
	ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
	ssl_prefer_server_ciphers on;


	# Logging Settings
	access_log /var/log/nginx/access.log;
	error_log /var/log/nginx/error.log;


	# Gzip Settings
	gzip on; 
	gzip_disable "msie6";
	gzip_vary on;
	gzip_proxied any;
	gzip_comp_level 6;
	gzip_buffers 16 8k;
	gzip_http_version 1.1;
        gzip_types application/json;


	include /etc/nginx/conf.d/*.conf;
	include /etc/nginx/sites-enabled/*;
}
```

#### Creating API Directory

```
sudo mkdir -p /var/www/example.com/api
sudo mkdir -p /var/www/example.com/client

sudo chown -R www-data:www-data /var/www/example.com
sudo chmod -R 755 /var/www/example.com/ap
```

#### Creating Virtual Host
```
sudo nano /etc/nginx/sites-available/example.com
server {
    server_name example.com;

    #  Web Root
    root /var/www/example.com;
    index index.html index.htm;
   
    # API Folder
    location ^~ /api/compress {
	    proxy_pass http://localhost:3001/compress;
	    proxy_http_version 1.1;
	    proxy_set_header Upgrade $http_upgrade;
	    proxy_set_header Connection 'upgrade';
	    proxy_set_header Host $host;
	    proxy_cache_bypass $http_upgrade;
	    proxy_read_timeout 30s;
    }
    
    # Input Folder
    location ^~ /api/input {
        alias /var/www/example.com/api/input;
    }

	# Output Folder
    location ^~ /api/output {
        alias /var/www/example.com/api/output;
    }

    # Client Folder
    location ^~ / {
        root /var/www/example.com/client;
    }

}
sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
sudo unlink /etc/nginx/sites-enabled/default
sudo rm -rf /var/www/html
sudo systemctl restart nginx
```

#### Installing SSL
```
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d example.com
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
sudo systemctl restart nginx
```

#### Copy Repo Files to /var/www/example.com & Install Dependencies
```
cd /var/www/example.com/api
npm install
npm install nodemon -g
```

#### Run Api Server
```
cd /var/www/example.com/api
nodemon app.js
```
