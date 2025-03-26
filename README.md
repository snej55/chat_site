# Messaging app

This is a basic messaging client, that sends and recieves messages via socket.io

## How to set up:

_Requirements: npm installed and added to path_

First, clone the repo and cd into it:

```
git clone https://github.com/snej55/chat_site.git
cd chat_site
```

#### Client set up:

Next, install the required packages for the client side:

```
# read package.json and install packages
npm install
```

You can run the client with `$ npm run start`.

#### Server set up:

First, cd into the server directory (feel free to move this where you like), and install the required packages:

```
cd server
npm install
```

To start the server, run `$ npm run start`.

## TODO: 
 * Better login
 * No login impersonation
 * User list
 * Replying
 * Filtering
 * Encryption