import { Component, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { AES, enc } from 'crypto-js';

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

    setSecret({ secret }) {
        this.state.secret = secret;
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

    render() {
        // nothing
        return <div></div>;
    }
}