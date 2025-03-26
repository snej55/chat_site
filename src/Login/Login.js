import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Login.css';

const invalid_characters = ["$", "{", "}", " ", ".", "*", "%"];
const max_username_length = 30;
const min_username_length = 2;

export function Login({setUserName}) {
    const [name, setName] = useState('');

    const handleSubmit = e => {
        e.preventDefault(); // this prevents the page from reloading
        if (checkUsername(name)) {
            setUserName(name); // call set username hook
        }
    }

    // check if usernames are valid
    function checkUsername(username) {
        // check if username is too short or long
        if (username.length < min_username_length) {
            alert(`Sorry, your username must be less than ${max_username_length} characters long, and more than ${min_username_length}. Please try again!`);
            return false;
        } else if (username.length > max_username_length) {
            alert(`Sorry, your username must be less than ${max_username_length} characters long, and more than ${min_username_length}. Please try again!`)
            return false;
        }

        // check if username contains illegal characters
        for (var i = 0; i < invalid_characters.length; ++i) {
            if (username.includes(invalid_characters[i])) {
                alert("Sorry, your username cannot contain any of the following characters: $, {, }, ., *, % or any spaces");
                return false;
            }
        }

        if (username.toLowerCase() === "admin") {
            alert("Sorry, this username has been taken!");
            return false;
        }

        return true;
    }

    return (
        // simple form for username input
        <div className="login-wrapper">
            
            <h1 id="h1">Welcome To CIMS</h1>
            
            {/* <h2>Please Enter Your Username</h2> */}
     
            <form onSubmit={handleSubmit}>
                
                <label>
                    {/* <p>Input Username</p> */}
                    <input id="input" type="text" onChange={e => setName(e.target.value)} placeholder='Username' />
                </label>
                <p></p>{/* Don't remove, everything breaks without this, IDK why but it does */}
                <label>
                    {/* <p>Input Passkey</p> */}
                    {/* <input type="password" onChange={e => setName(e.target.value)} placeholder='Password'/> */}
                </label>
                <div>
                    <button id="button" type="submit">Continue</button>
                </div>
            </form>
        </div>

    )
}

Login.propTypes = {
    setUserName: PropTypes.func.isRequired
};