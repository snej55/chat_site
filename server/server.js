// BACKEND SERVER CODE

// helper function for quick way to get time as HH:MM:SS
function getTime() {
  var currentDate = new Date();
  var dateTime = currentDate.getHours() + ':' + (currentDate.getMinutes() < 10 ? '0' : '') + currentDate.getMinutes() + ':' + (currentDate.getSeconds() < 10 ? '0' : '') + currentDate.getSeconds();
  return dateTime;
}

// --------------- ENCRYPTION ---------------- //

class Encryptor {
  constructor() {
      this.state = {
          message: '',
          secret: '',
          cipher: '',
          decrypted: ''
      };
  }

  encrypt() {
      const cipherText = AES.encrypt(this.state.message, this.state.secret);
      this.setState({ cipher: cipherText.toString(), message: '' });
  }

  decrypt() {
      let bytes;

      try {
          bytes = AES.decrypt(this.state.cipher, this.state.secret);
          const decrypted = bytes.toString(enc.Utf8);
          this.setState({ decrypted: decrypted });
      } catch (err) {
          console.log(`UNABLE TO DECRYPT ${err}`);
      }
  }
}

const encryptor = new Encryptor();
let encPubKey;
let encPrivKey;
let encSecret;
let encPrime;
let encGenerator;

// --------------- INITIALIZATION --------------- //

// initialize express server
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { AES, enc } = require("crypto-js");
const fs = require("fs");
const blockedWords = JSON.parse(fs.readFileSync("blockedWords.json", "utf8")).blockedWords;
const blockedWordsReplacements = JSON.parse(fs.readFileSync("new-blocked-words.json", "utf-8"));
const periodicTableElements = JSON.parse(fs.readFileSync("funnyreplacements.json","utf8")).periodicTableElements
const app = express();
const server = http.createServer(app);
// list to store ip addresses that have connected.
addresses_connected = []
const usernames = []
const max_word_length = 500;


// initialize socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});


// ---------------- Handle socket.io signals ---------------- //

// Handle WebSocket connections here
io.on("connection", (socket) => {
  console.log("A new user has connected", socket.id);
  console.log("At ip address: ", socket.handshake.address);
  addresses_connected.push(socket.handshake.address);
  console.log(addresses_connected.includes(socket.handshake.address) ? "this ip is already here" : "new user");

  // Listen for incoming messages from clients
  socket.on("message", (message) => {
    // Broadcast the message to all connected clients
    console.log(message);

    blockedWords.forEach((word) => {
      const regex = new RegExp(word.toLowerCase(), "gi"); // Change the blocked word(Whole, No UPPER, lower)
      if (message.content.toLowerCase().includes(word)) {
        // Select a random element
        const randomElement = periodicTableElements[Math.floor(Math.random() * periodicTableElements.length)];
        const replacement = blockedWordsReplacements[word];
        console.log(replacement);
        message.content = message.content.replace(regex, replacement === 'PE' ? randomElement : replacement); // replace it
        console.log("Filtered Content:", message.content);
      }
    });

    // quick script to cap length of words to less than max_word_length
    audited_message = '';
    message.content.split(' ').forEach((word) => {
      if (word.length > max_word_length) {
        audited_message = audited_message + word.slice(0, max_word_length) + ' ';
      } else {
        audited_message = audited_message + word + ' ';
      }
    })

    audited_message = audited_message.trim();
    message.content = audited_message;

    console.log(`Audited message: ${message.content}`);

    io.emit("message", message);
  });

  // listen for new user
  socket.on("new_user", (username) => {
    console.log(username + " has joined!");
    var messageData = username + " has joined the chatbox!"
    usernames.push({'username': username, 'socket_id': socket.id});
    console.log(usernames);

    // update username lists on client side
    io.emit("update_users", usernames);

    // send admin message to rest of users
    io.emit("message", {content: messageData, time: getTime(), user: "ADMIN", uid: 1001});
  })

  socket.on("check_user", (username) => {
    console.log(`checking username: ${username}`);

    // check if there is already a user with this name
    var already_had = false;
    usernames.forEach((uname) => {
      if (uname.username.toLowerCase() === username.toLowerCase()) {
        already_had = true;
      }
    });

    // check if person isn't trying to impersonate admin (*cough* *cough* JAN)
    let admin_usernames = ["admin", "admln", "Aodmin", "aodmln"];
    admin_usernames.forEach((admin_name) => {
      if (username.toLowerCase() === admin_name.toLowerCase()) {
        already_had = true;
      }
    });

    if (already_had) {
      console.log("telling off: username taken");
      socket.emit("checked_username", {"valid": false, "reason": "Sorry, this username has already been taken."});
    } else {

      contains_bad_word = false;
      blockedWords.forEach((word) => {
        if (username.toLowerCase().includes(word.toLowerCase())) {
          contains_bad_word = true;
        }
      })

      console.log("checked");
      socket.emit("checked_username", contains_bad_word ? {"valid": false, "reason": "That's a very naughty word."} : {"valid": true, "reason": null});
    }
  })

  // Handle disconnections
  socket.on("disconnect", () => {
    usernames.forEach((uname) => {
      if (uname.socket_id === socket.id) {
        console.log(uname.username + ' has disconnected');
        
        // send message to everyone
        var messageData = `${uname.username} has left the chatbox!`
        io.emit("message", {content: messageData, time: getTime(), user: "ADMIN", uid: 1001});
        usernames.splice(usernames.indexOf(uname), 1);
      }
    })

    // update users for clients
    io.emit("update_users", usernames);

    console.log(usernames);
    console.log(socket.id, " disconnected");
  });
  

  // encryption stuff
  socket.on("enc_prime", (prime) => {
    console.log("Recieved prime: ", prime);
    encPrime = prime;
    socket.emit("prime_agreed", encPrime);
  });

  socket.on("enc_generator", (generator) => {
    encGenerator = generator;
    console.log("Recieved generator: ", generator);
    socket.emit("generator_agreed", encGenerator);
  });

  socket.on("set_generator", (success) => {
    if (success) {
      console.log(`Agreed on prime and generator:  P: ${encPrime}, G: ${encGenerator}`);
      socket.emit("enc_gp_agreed", {prime: encPrime, generator: encGenerator});
    }
  });

  socket.on("enc_pub_key", (pubKey) => {
    // calculate our own public & private keys, then return our private key

    encPrivKey = parseInt(Math.random() * 10) + 1;
    encPubKey = (encGenerator ** encPrivKey) % encPrime;

    // then calculate the secret
    encSecret = (pubKey ** encPrivKey) % encPrime;

    console.log('recieved pub: ', pubKey);
    console.log('pub: ', encPubKey, 'priv: ', encPrivKey);

    console.log("calculated secret: ", encSecret);

    // give client our public key
    socket.emit("enc_pub_key_calculated", {pubKey: encPubKey, prime: encPrime});
  })
});

// list to PORT
PORT = 5001
server.listen(PORT, () => {
  console.log(`Server is running on port *${PORT}`);
});