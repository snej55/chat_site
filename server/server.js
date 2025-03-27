// BACKEND SERVER CODE

// initialize express server
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const blockedWords = JSON.parse(fs.readFileSync("blockedWords.json", "utf8")).blockedWords;
const periodicTableElements = JSON.parse(fs.readFileSync("funnyreplacements.json","utf8")).periodicTableElements
const app = express();
const server = http.createServer(app);
// initialize socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// helper function for quick way to get time as HH:MM:SS
function getTime() {
  var currentDate = new Date();
  var dateTime = currentDate.getHours() + ':' + (currentDate.getMinutes() < 10 ? '0' : '') + currentDate.getMinutes() + ':' + (currentDate.getSeconds() < 10 ? '0' : '') + currentDate.getSeconds();
  return dateTime;
}

// list to store ip addresses that have connected.
addresses_connected = []
const usernames = []
const max_word_length = 50;

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
        message.content = message.content.replace(regex, randomElement); // replace it
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
    usernames.push(username);
    console.log(usernames);

    // send admin message to rest of users
    io.emit("message", {content: messageData, time: getTime(), user: "ADMIN", uid: 1001});
  })

  socket.on("check_user", (username) => {
    console.log(`checking username: ${username}`);

    // check if there is already a user with this name
    var already_had = false;
    usernames.forEach((uname) => {
      if (uname.toLowerCase() === username.toLowerCase()) {
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
      socket.emit("checked_username", {"valid": false, "reason": "Sorry, this username has already been taken."});
    } else {
      socket.emit("checked_username", {"valid": true, "reason": null});
    }
  })

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log(socket.id, " disconnected");
  });
});

// list to PORT
PORT = 5001
server.listen(PORT, () => {
  console.log(`Server is running on port *${PORT}`);
});