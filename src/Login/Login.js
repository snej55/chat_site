import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Login.css';
export function Login({setUserName}) {
    const [name, setName] = useState();

    const handleSubmit = e => {
        e.preventDefault();
        setUserName(name);
    }

    return (


        <div className="login-wrapper">
            
            <h1 id="h1">Welcome To The Jens Fan Club</h1>
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