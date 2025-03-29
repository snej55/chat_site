import React, { useState, useEffect } from 'react';
import './App.css';
import io from "socket.io-client";

import { MessageBox } from './Components/Messages';
import { InfoPanel } from './Components/Info.js';
import { Login } from './Components/Login';
import { LoadingPage } from './Components/Loading.js';
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
  console.log(exchangedKeys);

  const [encPubKey, setPubKey] = useState();
  const [encPrivateKey, setPrivateKey] = useState();
  const [encSecret, setSecret] = useState();
  const [encPrime, setENCPrime] = useState();
  const [encGenerator, setENCGenerator] = useState();

  useEffect(() => {
    socket.once("prime_agreed", (prime) => {
      setENCPrime(prime);
      socket.emit("enc_generator", parseInt(Math.random() * 10) + 1);
    });

    return () => {
      socket.off("prime_agreed");
    }
  });

  useEffect(() => {
    socket.once("generator_agreed", (generator) => {
      setENCGenerator(generator);
      socket.emit("set_generator", true);
    });

    return () => {
      socket.off("generator_agreed");
    }
  });

  useEffect(() => {
    socket.once("enc_gp_agreed", (response) => {
      var prime = response.prime;
      var generator = response.generator;

      // randomly generate private key
      var priv = parseInt(Math.random() * 10) + 1;
      // calculate public key
      var pub = (generator ** priv) % prime;

      console.log('prime', prime, 'generator',generator, 'priv',priv, 'pub',pub);

      setPrivateKey(priv);
      setPubKey(pub);

      socket.emit("enc_pub_key", pub);
    });

    return () => {
      socket.off("enc_gp_agreed");
    }
  });

  useEffect(() => {
    socket.once("enc_pub_key_calculated", (response) => {
      // calculate shared secret
      var secret = (response.pubKey ** encPrivateKey) % response.prime;
      setSecret(secret);
      console.log(response.pubKey, encPrivateKey, secret);
    });

    return () => {
      socket.off("enc_pub_key_calculated");
    }
  })

  // if username is undefined,
  // banish them to the login page.
  if (!username) {
    return <Login setUserName={setUserName} socket={socket} />
  }
  
  if (!exchangedKeys) {
    console.log("exchanging keys...");
    const primes = [179, 181, 191, 193, 283, 29, 127, 239, 199];
    socket.emit("enc_prime", primes[Math.floor(Math.random() * primes.length)]);
    // socket.emit("enc_prime", 13);
    setExchangedKeys(true);
  }

  // we don't want them to be able to use it without encryption
  if (!encSecret) {
    return <LoadingPage />
  }

  const getUserName = () => {
    return username;
  }

  // return actual message box
  return (
    <div className="container">
      <InfoPanel getUserName={getUserName} socket={socket} />
      <MessageBox getUserName={getUserName} socket={socket} />
    </div>
  );
}