import { Component, useEffect } from 'react';
import { AES, enc } from 'crypto-js';

import PropTypes from 'prop-types';

export async function setupKeys({ socket, setPubKey, setPrivateKey, setSecret, setENCPrime, setENCGenerator }) {
    const primes = [7823, 7829, 7841, 7853, 7867, 7873, 7877, 7879, 7883, 7901, 7907, 7919];
    socket.emit("enc_prime", primes[Math.floor(Math.random() * primes.length)]);

    useEffect(() => {
        socket.once("prime_agreed", (prime) => {
            setENCPrime(prime);
            socket.emit("enc_generator", parseInt(Math.random() * 10000 + 1000));
        });

        socket.once("generator_agreed", (generator) => {
            setENCGenerator(generator);
            socket.emit("set_generator", true);
        });
    });
}

setupKeys.propTypes = {
    socket: PropTypes.any.isRequired,
    setPubKey: PropTypes.func.isRequired,
    setPrivateKey: PropTypes.func.isRequired,
    setSecret: PropTypes.func.isRequired,
    setENCPrime: PropTypes.func.isRequired,
    setENCGenerator: PropTypes.func.isRequired
};

export class Encryptor extends Component{
    constructor() {
        super();
        this.state = {
            name: 'Encryptor',
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