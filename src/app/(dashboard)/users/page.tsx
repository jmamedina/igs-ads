'use client'

import React, { useState } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

// Ensure you import the userPool from your context or define it again here
const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
};

const userPool = new CognitoUserPool(poolData);

function UsersPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const attributeList = [
      {
        Name: 'email', 
        Value: email,
      },
    ];

    userPool.signUp(username, password, attributeList, null, (err, data) => {
      if (err) {
        console.error(err);
        setError(err.message || JSON.stringify(err));
        return;
      }
      console.log('User registration successful:', data);
      setSuccess('User registration successful. Please check email to confirm.');
    });
  };

  return (
    <div>
      <h1>UsersPage</h1>
      <form onSubmit={handleSignUp}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}

export default UsersPage;
