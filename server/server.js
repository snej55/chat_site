// BACKEND SERVER CODE

// helper function for quick way to get time as HH:MM:SS
function getTime() {
  var currentDate = new Date();
  var dateTime = currentDate.getHours() + ':' + (currentDate.getMinutes() < 10 ? '0' : '') + currentDate.getMinutes() + ':' + (currentDate.getSeconds() < 10 ? '0' : '') + currentDate.getSeconds();
  return dateTime;
}

// simple hash generator
function string2Hash(string) {
  let hash = 0;
  if (!string) return hash;

  for (i = 0; i < string.length; i++) {
      char = string.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
  }
  return hash;
}

// --------------- ENCRYPTION ---------------- //

// {socket_id: { encPubKey, encPrivKey, encSecret, encPrime, encGenerator, encIV, socAddress }};
const clientENC = [];

// --------------- INITIALIZATION --------------- //

// initialize express server
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
// const crypto = require('crypto');
const { AES, enc } = require("crypto-js");
const fs = require("fs");
const blockedWords = JSON.parse(fs.readFileSync("blockedWords.json", "utf8")).blockedWords;
const blockedWordsReplacements = JSON.parse(fs.readFileSync("new-blocked-words.json", "utf-8"));
const periodicTableElements = JSON.parse(fs.readFileSync("funnyreplacements.json","utf8")).periodicTableElements
const app = express();
const server = http.createServer(app);
// list to store ip addresses that have connected.
const addresses_connected = [];
const usernames = [];
const max_word_length = 500;
const banned_addresses = [];

// {username: ip}
const banned = {};

// admin password
const admin_token = "beans"; // for testing, actual password is 'IDr1nkT01l£tW@t£R$P££DY!'

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
  if (addresses_connected.includes(socket.handshake.address)) {
    clientENC.forEach((clientData) => {
      if (clientData.socAddress === socket.handshake.address) {
        clientENC[socket.id] = clientData;
        console.log("cloned clientENC data");
      }
    });
  }

  // check if this ip address has been banned
  if (banned_addresses.includes(socket.handshake.address)) {
    console.log(`This ip is banned: ${socket.handshake.address}. Refusing connection: `);
    socket.disconnect();
    console.log(`Socket disconnected!`);
  }

  // send a message to all clients
  function broadcastMessage(mes) {
      let socs_sent_to = []
      io.sockets.sockets.forEach((soc) => {
      try {
        if (clientENC[soc.id] != undefined) {
          if (!(socs_sent_to.includes(soc)) && soc != io.socket) {
            var message_encrypted = JSON.parse(JSON.stringify(mes)); // create a clone
            message_encrypted.content = AES.encrypt(mes.content, clientENC[soc.id].encSecret, {iv: clientENC[soc.id].encIV}).toString();
            soc.emit("message", message_encrypted); // TODO: Change this to message_encrypted
            socs_sent_to.push(soc);
            console.log(soc.id);
          } else {
            if (soc == io.socket) {
              console.log("I just tried to send a message to myself!");
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    });
  }

  function getSocketFromUsername(username) {
    let s;
    usernames.forEach((uname) => {
      if (username.toLowerCase() == uname.username.toLowerCase()) {
        // get the socket id for that user
        let soc_id = uname.socket_id;

        console.log(soc_id);
        
        // find corresponding socket
        io.sockets.sockets.forEach((soc) => {
          console.log(soc.id);
          if (soc.id === soc_id) {
            s = soc;
          }
        });
      }
    });

    return s;
  }

  // function to parse admin commands
  // e.g /kick @billybob would return {command: 'kick', args: 'billybob'}
  function parseCommand(admin_command) {
    let command = '';
    let args = '';
    admin_command.split(' ').forEach(
      (word) => {
        if (word.charAt(0) === '/') {
          command = word.slice(1, word.length);
        } else if (word.charAt(0) === '@') {
          args += word.slice(1, word.length) + ' ';
        }
      }
    );

    console.log(command, args);

    return {command: command, args: args};
  }

  // command
  function executeCommand(com) {
    let command = com.command;
    // convert to an array for convenience
    let args = com.args.split(' ');
    
    console.log(`Executing ${command.toUpperCase()} with ${args}`);

    switch (command) {
      case 'kick':
        // kick each user in args
        args.forEach((uname) => {
          console.log(`Kicking: ${uname}`);
          let soc = getSocketFromUsername(uname);
          if (soc) {
            soc.emit("kicked", true);
            soc.disconnect();
          }
        });
        break;
      case 'ban':
        args.forEach((uname) => {
          console.log(`Banning: ${uname}`);
          let soc = getSocketFromUsername(uname);
          if (soc) {
            banned_addresses.push(soc.handshake.address);
            banned[uname] = soc.handshake.address;
            console.log(`Banned ip address: ${soc.handshake.address}`);
            soc.emit("kicked", true);
            soc.disconnect();
            console.log(banned_addresses)
          }
        });
        break;
        case 'unban':
          args.forEach((uname) => {
            console.log(`Unbanning: ${uname}`);
            let banned_ip = banned[uname];
            if (banned_ip) {
              console.log(`Banned ip: ${banned_ip}`);
              console.log(`Current banned addresses: ${banned_addresses}`);
              banned_addresses.splice(banned_addresses.indexOf(banned_ip), 1); // remove ip
              console.log(`New banned addresses: ${banned_addresses}`);
              banned[uname] = null;
            }
          });
      default:
        return;
    }
  }

  // Listen for incoming messages from clients
  socket.on("message", (cypher_message) => {
    try {
      // Broadcast the message to all connected clients
      console.log(`Encrypted message: ${cypher_message.content}`);
      const bytes = AES.decrypt(cypher_message.content, clientENC[socket.id].encSecret, {iv: clientENC[socket.id].encIV});
      var message = cypher_message;
      message.content = bytes.toString(enc.Utf8);
      console.log(`Decrypted message: ${message.content}`);


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
      let audited_message = '';
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

      if (message.user.toLowerCase() === 'admin') {
        console.log("This was an admin message!");
        // check for commands
        let command = parseCommand(message.content);
        executeCommand(command);
      }

      broadcastMessage(message);
    } catch (err) {
      console.log(err);
    }
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
    broadcastMessage({content: messageData, time: getTime(), user: "ADMIN", uid: 1001});
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
        var messageData = `${uname.username} has left the chatbox!`;
        broadcastMessage({content: messageData, time: getTime(), user: "ADMIN", uid: 1001});
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
    console.log("Exchanging keys...");
    clientENC[socket.id] = {};
    clientENC[socket.id].encPrime = prime;
    socket.emit("prime_agreed", clientENC[socket.id].encPrime);
  });

  socket.on("enc_generator", (generator) => {
    clientENC[socket.id].encGenerator = generator;
    socket.emit("generator_agreed", clientENC[socket.id].encGenerator);
  });

  socket.on("set_generator", (success) => {
    if (success) {
      socket.emit("enc_gp_agreed", {prime: clientENC[socket.id].encPrime, generator: clientENC[socket.id].encGenerator});
    }
  });

  socket.on("enc_pub_key", (pubKey) => {
    // calculate our own public & private keys, then return our private key

    clientENC[socket.id].encPrivKey = parseInt(Math.random() * 8) + 1;
    clientENC[socket.id].encPubKey = (clientENC[socket.id].encGenerator ** clientENC[socket.id].encPrivKey) % clientENC[socket.id].encPrime;

    // then calculate the secret
    clientENC[socket.id].encSecret = (pubKey ** clientENC[socket.id].encPrivKey) % clientENC[socket.id].encPrime;
    clientENC[socket.id].encSecret = string2Hash(String(clientENC[socket.id].encSecret * 7883));

    // give client our public key
    socket.emit("enc_pub_key_calculated", {pubKey: clientENC[socket.id].encPubKey, prime: clientENC[socket.id].encPrime});
  });

  socket.on("verify_secret", (verification) => {
    try {
      // decrypt verification using our secret
      const bytes = AES.decrypt(verification.verification, clientENC[socket.id].encSecret, {iv: verification.iv});
      const decrypted = bytes.toString(enc.Utf8);
      console.log(`Decrypted: ${decrypted}`);
  
      // check if decryption was successful
      if (decrypted === "verify") {
        console.log("Verified - secrets match!");
        // everything is alright
        clientENC[socket.id].encIV = verification.iv;
        clientENC[socket.id].socAddress = socket.handshake.address;
        socket.emit("verified_secret", true);
      } else {
        console.log("Something went wrong!");
        // tell client to try again
        socket.emit("verified_secret", false);
      }
    } catch (err) {
      console.log(err);
    }

    /* // THIS IS THE OTHER WAY
    const encrypted = AES.encrypt("verify", clientENC[socket.id].encSecret, {iv: verification.iv}).toString();
    console.log(`Verifying: ${encrypted}`);

    if (encrypted === verification.verification) {
      console.log("They match!");
    } else {
      console.log("Something went wrong!");
    } */
  });

  socket.on("check_token", (cypher) => {
    try {
      const bytes = AES.decrypt(cypher, clientENC[socket.id].encSecret, {iv: clientENC[socket.id].encIV});
      let token = bytes.toString(enc.Utf8);
      console.log(`Checking admin token: ${token} against ${admin_token}`);
      if (token === admin_token) {
        console.log("Success!");
        socket.emit("checked_token", true);
      } else {
        console.log("Incorrect!");
        socket.emit("checked_token", false);
      }
    } catch (err) {
      console.log(err);
      socket.emit("checked_token", false);
    }
  })
});

// list to PORT
PORT = 5001
server.listen(PORT, () => {
  console.log(`Server is running on port *${PORT}`);
});