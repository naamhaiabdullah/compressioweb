## CompressioWeb &middot; [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

```
1. CompressioWeb is an Open Source Production Grade Image Compression API and Web Application.
2. Privacy friendly, no database, no analytics, no logs, no cookies and auto image deletion in an hour after upload.
3. It compresses JPG, PNG, GIF & SVG images in both Lossy and Lossless formats.
4. CompressioWeb is built with Node.js, Express.js and React.js.
5. Libraries used are JPEGOptim, PNGQuant, OptiPNG, GIFSicle, Scour.
6. CompressioWeb is fully maintained and will be available in future with all the updates.
7. Installation docs for DigitalOcean Ubuntu 20.04 is given below.
```

## Built With

* [Node.js](https://nodejs.org) - Backend
* [Express.js](https://expressjs.com) - Backend Framework
* [React.js](https://reactjs.org/) - Frontend Library
* [PNGQuant](https://pngquant.org/) - PNG Compression Library
* [OptiPNG](http://optipng.sourceforge.net/) - PNG Compression Library
* [JPEGOptim](https://www.mankier.com/1/jpegoptim) - JPEG Compression Library
* [GIFSicle](https://www.lcdf.org/gifsicle/) - GIF Compression Library
* [Scour](https://www.codedread.com/scour/) - SVG Compression Library

## Authors

* **Choudhary Abdullah** - API and Frontend - [LinkedIn](https://www.linkedin.com/in/abdullahchoudhary/)
* **Fahad Ahmad** - Frontend - [LinkedIn](https://www.linkedin.com/in/fahad-ahmad-b042a7112/)   

## Screenshots

![alt text](https://github.com/twoabd/CompressioAPI/blob/main/api/docs/website/first.png?raw=true)   

![alt text](https://github.com/twoabd/CompressioAPI/blob/main/api/docs/api/default.png?raw=true)  

![alt text](https://github.com/twoabd/CompressioAPI/blob/main/api/docs/api/lossy.png?raw=true)  
 
![alt text](https://github.com/twoabd/CompressioAPI/blob/main/api/docs/api/lossless.png?raw=true) 


## How to Use API

#### POST Request, No GET
```
It receives all parameters in a POST request at https://compressio.app/compress.     
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

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/twoabd/CompressioWeb/tags). 


## Deployment, API & Web

#### Change compressio.app to Your Domain At
```
/api/app.js
/api/src/routes/compress.js
/client/src/Components/AfterUpload.js
```

#### Remove Navbar Links From
```
/client/src/Components/Navbar.js
```

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
        gzip_types 
	application/javascript application/rss+xml application/vnd.ms-fontobject application/x-font 
	application/x-font-opentype application/x-font-otf application/x-font-truetype application/x-font-ttf 
	application/x-javascript application/xhtml+xml application/xml font/opentype font/otf font/ttf 
	image/svg+xml image/x-icon text/css text/html text/javascript text/plain text/xml;

	include /etc/nginx/conf.d/*.conf;
	include /etc/nginx/sites-enabled/*;
}
```

#### Creating API Directory

```
sudo mkdir -p /var/www/compressio.app/api
sudo mkdir -p /var/www/compressio.app/client

sudo chown -R www-data:www-data /var/www/compressio.app
sudo chmod -R 755 /var/www/compressio.app
```

#### Creating 404 Page

```
sudo nano /var/www/compressio.app/client/404.html
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page Not Found</title><link rel="shortcut icon" href="/favicon.png" type="image/png"><link rel="dns-prefetch" href="//fonts.gstatic.com"><link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet"><style>body,html{background-color:#fff;color:#636b6f;font-family:Nunito,sans-serif;font-weight:100;height:100vh;margin:0}.full-height{height:100vh}.flex-center{align-items:center;display:flex;justify-content:center}.position-ref{position:relative}.code{border-right:2px solid;font-size:26px;padding:0 15px 0 15px;text-align:center}.message{font-size:18px;text-align:center}</style></head><body><div class="flex-center position-ref full-height"><div class="code">404</div><div class="message" style="padding:10px">Not Found</div></div></body></html>
```

#### Creating Virtual Host
```
sudo nano /etc/nginx/sites-available/compressio.app
server {

    server_name compressio.app;
    index index.html;
   
    # API Folder
    location /api/compress {
        proxy_pass http://localhost:3001/compress;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 30s;
    }
    
    # Input Folder
    location /api/input {
        root /var/www/compressio.app;
    }

	# Output Folder
    location /api/output {
        root /var/www/compressio.app;
    }

    # Client Folder
    location / {
        expires 1d;
        error_page 404 /404.html;
        root /var/www/compressio.app/client;
    }

}
sudo ln -s /etc/nginx/sites-available/compressio.app /etc/nginx/sites-enabled/
sudo unlink /etc/nginx/sites-enabled/default
sudo rm -rf /var/www/html
sudo systemctl restart nginx
```

#### Installing SSL
```
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d compressio.app
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
sudo systemctl restart nginx
```

#### Copy Repo Files to /var/www/compressio.app
```
cd /var/www/compressio.app/api
npm install

cd /var/www/compressio.app/client
npm install
npm run build 
  
Delete everything else inside /var/www/compressio.app/client/ except 404.html and build folder
Move all files inside /var/www/compressio.app/client/build/ to /var/www/compressio.app/client/ 
```

#### Run Api Server
```
cd /var/www/compressio.app/api
npm install -g pm2
pm2 start app.js -n CompressioAPI
pm2 startup
pm2 save
```

## Acknowledgments

* Frontend is inspired from [Caesium Image Compressor](https://caesium.app)
* Learnt about all the five compression libraries from [Compressor.io](https://compressor.io/) when it was free.
