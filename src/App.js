import React, { useState, useEffect } from 'react';
import './App.css';
import io from "socket.io-client";
import CryptoJS, { AES, enc } from 'crypto-js';

import { MessageBox } from './Components/Messages';
import { InfoPanel } from './Components/Info.js';
import { Login } from './Components/Login';
import { LoadingPage } from './Components/Loading.js';

import { string2Hash } from "./utils.js";
// import { setupKeys } from './encryption.js';

// ip addresses (old):

// jan (mint): http://10.24.76.198:5001
// nathan (new): http://10.24.78.182:5001
// jens: http://10.24.79.53:5001 at *a* port

// !! PLEASE USE localhost:PORT for testing to avoid issues with serverside code
const socket = io("http://localhost:5001");

export default function App() {
  const [username, setUserName] = useState();
  const [exchangedKeys, setExchangedKeys] = useState(false);

  const [encPubKey, setPubKey] = useState();
  const [encPrivateKey, setPrivateKey] = useState();
  const [encSecret, setSecret] = useState();
  const [encPrime, setENCPrime] = useState();
  const [encGenerator, setENCGenerator] = useState();
  // initialization vector
  const [encIV, setENCIV] = useState(CryptoJS.lib.WordArray.random(16));
  const [verifiedSecret, setVerifiedSecret] = useState(false);

  useEffect(() => {
    socket.on("prime_agreed", (prime) => {
      setENCPrime(prime);
      socket.emit("enc_generator", parseInt(Math.random() * 8) + 1);
    });

    return () => {
      socket.off("prime_agreed");
    }
  });

  useEffect(() => {
    socket.on("generator_agreed", (generator) => {
      setENCGenerator(generator);
      socket.emit("set_generator", true);
    });

    return () => {
      socket.off("generator_agreed");
    }
  });

  useEffect(() => {
    socket.on("enc_gp_agreed", (response) => {
      var prime = response.prime;
      var generator = response.generator;

      // randomly generate private key
      var priv = parseInt(Math.random() * 8) + 1;
      // calculate public key
      var pub = (generator ** priv) % prime;

      setPrivateKey(priv);
      setPubKey(pub);

      socket.emit("enc_pub_key", pub);
    });

    return () => {
      socket.off("enc_gp_agreed");
    }
  });

  useEffect(() => {
    socket.on("enc_pub_key_calculated", (response) => {
      // calculate shared secret
      var secret = (response.pubKey ** encPrivateKey) % response.prime;
      secret = string2Hash(String(secret * 7883));
      setSecret(secret);
      
      const verification = AES.encrypt("verify", secret, {iv: encIV}).toString();
      console.log(`Verifying...`);
      socket.emit("verify_secret", {verification: verification, iv: encIV});
    });

    return () => {
      socket.off("enc_pub_key_calculated");
    }
  });

  useEffect(() => {
    socket.on("verified_secret", (success) => {
      if (success) {
        console.log("Verified!");
        setVerifiedSecret(true);
      } else { // try again
        console.log("Exchanging keys...");
        const primes = [179, 181, 191, 193, 283, 29, 127, 239, 199];
        socket.emit("enc_prime", primes[Math.floor(Math.random() * primes.length)]);
      }
    });

    return () => {
      socket.off("verified_secret");
    }
  });

  // if username is undefined,
  // banish them to the login page.
  if (!username) {
    return <Login setUserName={setUserName} socket={socket} />
  }
  
  if (!exchangedKeys) {
    console.log("Exchanging keys...");
    const primes = [179, 181, 191, 193, 283, 29, 127, 239, 199];
    socket.emit("enc_prime", primes[Math.floor(Math.random() * primes.length)]);
    // socket.emit("enc_prime", 13);
    setExchangedKeys(true);
  }

  // we don't want them to be able to use it without encryption
  if (!verifiedSecret) {
    return <LoadingPage />
  }

  const getUserName = () => {
    return username;
  }

  function encryptMessage(message) {
    return AES.encrypt(message, encSecret, {iv: encIV}).toString();
  }

  function decryptMessage(message) {
    const bytes =  AES.decrypt(message, encSecret, {iv: encIV});
    return bytes.toString(enc.Utf8);
  }

  // return actual message box
  return (
    <div className="container">
      <InfoPanel getUserName={getUserName} socket={socket} />
      <MessageBox getUserName={getUserName} socket={socket} encryptMessage={encryptMessage} decryptMessage={decryptMessage}/>
    </div>
  );
}