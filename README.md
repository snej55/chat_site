# Messaging app

This is a basic messaging client, that sends and recieves messages via socket.io


# Features 
 * Encryption (AES, with secure key exchange)
 * Moderation (Secure admin login with the ability to kick and ban clients)
 * Filtering words
 * Public Chatting
 * Message replying
 * User List
 * Announcements

![image](https://github.com/snej55/chat_site/blob/main/media/screenshot_2.png)


>[!NOTE]
>Please use `localhost:PORT`(Port Default 5001 and 3000 for interface) for testing instead of your ip address in *App.js*, unless you're testing with other people.


## How to set up:

_Requirements: npm installed and added to path_

#### 1.First, clone the repo and cd into it:

```
git clone https://github.com/snej55/chat_site.git
cd chat_site
```

>[!TIP]
>One Step Installation (Skips steps 2-3)
>```bash
> bash install.sh
>```

#### 2.Client set up:

Next, install the required packages for the client side:

```
# read package.json and install packages
npm install
```


#### 3.Server set up:

First, cd into the server directory (feel free to move this where you like), and install the required packages:

```
cd server
npm install
```


#### 4.Starting:
Start the client and server by doing the following:
```bash
cd ..
npm run start
cd server
npm run start
```
# Encryption:

Encryption is currently a work in progress. Client to server messages are encrypted, but server to client messages are not (yet), the reason being that the server needs to cycle through every socket in `io.sockets`, and match the corresponding secret. Encryption keys for each client are stored in `clientENC`, where each client's secret is `clientENC[socket.id].encSecret`.

Messages can be encrypted using the following:
```
encrypted = AES.encrypt(message, clientENC[socket.id].encSecret, {iv: clientENC[socket.id].encIV}).toString()
```
The `toString()` is important, as it prevents the function from returning a complex object that causes problems with `socket.emit()`.

Similarly, messages can be decrypted using:
```
// AES.decrypt returns a byte value, so we need to convert it to a string
decrypted = AES.decrypt(cypher, clientENC[socket.id].encSecret, {iv: clientENC[socket.id].encIV}).toString(enc.Utf8)
```

For more information on how the secret generation works, look here: [Diffie-Hellman Key Exchange](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange), or look at the encryption section in *server.js*.

> [!CAUTION]
> Restarting the server with clients still running can cause issues (as the server will not have the `clientENC` data for them). Make sure to restart all clients after > restarting the server.

## TODO:
 * ~~Fix input box clearing~~
 * ~~Fix autoscrolling~~
 * ~~Fix announcement hard coded in issue~~
 * ~~Replying~~
 * ~~Add sha256 hash for secret~~
 * ~~Mute command~~
 * ~~Fix unbanning~~
 * ~~IP Banning~~
 * ~~Better login~~
 * ~~No login impersonation~~
 * ~~User list~~
 * ~~Fix user list spacing~~
 * ~~Client side decryption for encrypted messages~~
 * ~~Debug server-side secret matching~~
 * ~~Fix duplicate messages bug~~
 * ~~Filter names~~
 * ~~Fix message bubbles css~~
 * ~~Kicking~~
 * ~~Filtering & Added Funny Replacements for filtered words~~
 * ~~Colored admin messages~~
 * ~~Auto scroll~~
 * ~~Admin token~~
