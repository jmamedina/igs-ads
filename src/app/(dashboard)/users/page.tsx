<<<<<<< HEAD
'use client';

import React, { useState, useEffect } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
  Region: 'ap-northeast-1' || '',
};

const userPool = new CognitoUserPool(poolData);
const provider = new CognitoIdentityServiceProvider({
  region: poolData.Region,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY || '',
  },
});
=======
'use client'

import React, { useState } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

// Ensure you import the userPool from your context or define it again here
const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
};

const userPool = new CognitoUserPool(poolData);
>>>>>>> origin/main

function UsersPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
<<<<<<< HEAD
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState(''); // State for first name
  const [lastName, setLastName] = useState(''); // State for last name
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
=======
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
>>>>>>> origin/main

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const attributeList = [
      {
<<<<<<< HEAD
        Name: 'email',
        Value: email,
      },
      {
        Name: 'given_name', // First name
        Value: firstName,
      },
      {
        Name: 'family_name', // Last name
        Value: lastName,
      },
=======
        Name: 'email', 
        Value: email,
      },
>>>>>>> origin/main
    ];

    userPool.signUp(username, password, attributeList, null, (err, data) => {
      if (err) {
        console.error(err);
        setError(err.message || JSON.stringify(err));
        return;
      }
      console.log('User registration successful:', data);
      setSuccess('User registration successful. Please check email to confirm.');
<<<<<<< HEAD
      listUsers();
      setIsModalOpen(false);
    });
  };

  const listUsers = async () => {
    try {
      const params = {
        UserPoolId: poolData.UserPoolId,
        Limit: 60,
      };
      const data = await provider.listUsers(params).promise();
      setUsers(data.Users);
    } catch (err) {
      console.error('Error listing users:', err);
      setError(err.message || JSON.stringify(err));
    }
  };

  const handleDeleteUser = async (username) => {
    try {
      await provider.adminDeleteUser({
        UserPoolId: poolData.UserPoolId,
        Username: username,
      }).promise();
      setSuccess('User deleted successfully.');
      listUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || JSON.stringify(err));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUsername(user.Username);
    setEmail(user.Attributes.find(attr => attr.Name === 'email')?.Value || '');
    setFirstName(user.Attributes.find(attr => attr.Name === 'given_name')?.Value || ''); // Set first name for editing
    setLastName(user.Attributes.find(attr => attr.Name === 'family_name')?.Value || ''); // Set last name for editing
    setNewPassword('');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const attributeList = [
      {
        Name: 'email',
        Value: email,
      },
      {
        Name: 'given_name', // Update first name
        Value: firstName,
      },
      {
        Name: 'family_name', // Update last name
        Value: lastName,
      },
      {
        Name: 'email_verified',
        Value: 'true',
      },
    ];

    try {
      await provider.adminUpdateUserAttributes({
        UserPoolId: poolData.UserPoolId,
        Username: editingUser.Username,
        UserAttributes: attributeList,
      }).promise();

      // Update user password if a new password is provided
      if (newPassword) {
        await provider.adminSetUserPassword({
          UserPoolId: poolData.UserPoolId,
          Username: editingUser.Username,
          Password: newPassword,
          Permanent: true,
        }).promise();
      }

      setSuccess('User updated successfully.');
      setEditingUser(null);
      listUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message || JSON.stringify(err));
    }
  };

  useEffect(() => {
    listUsers();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-left">スタッフ管理</h1>

      {/* Add User Button */}
      <div className="mb-4 text-left">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition duration-200"
        >
          Add User
        </button>
      </div>

      {/* User Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Register User</h2>
            <form onSubmit={handleSignUp}>
              <div className="mb-4">
                <label className="block mb-1">Username</label>
                <input
                  type="text"
                  className="border rounded-lg w-full p-3 focus:ring focus:ring-blue-300"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Password</label>
                <input
                  type="password"
                  className="border rounded-lg w-full p-3 focus:ring focus:ring-blue-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  className="border rounded-lg w-full p-3 focus:ring focus:ring-blue-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">First Name</label>
                <input
                  type="text"
                  className="border rounded-lg w-full p-3 focus:ring focus:ring-blue-300"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Last Name</label>
                <input
                  type="text"
                  className="border rounded-lg w-full p-3 focus:ring focus:ring-blue-300"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-between">
                <button type="submit" className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition duration-200">
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">{success}</p>}
          </div>
        </div>
      )}

      {/* User Editing Modal */}
      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="mb-4">
                <label className="block mb-1">Username</label>
                <input
                  type="text"
                  className="border rounded-lg w-full p-3 focus:ring focus:ring-blue-300"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  className="border rounded-lg w-full p-3 focus:ring focus:ring-blue-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">First Name</label>
                <input
                  type="text"
                  className="border rounded-lg w-full p-3 focus:ring focus:ring-blue-300"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Last Name</label>
                <input
                  type="text"
                  className="border rounded-lg w-full p-3 focus:ring focus:ring-blue-300"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  className="border rounded-lg w-full p-3 focus:ring focus:ring-blue-300"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-between">
                <button type="submit" className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition duration-200">
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">{success}</p>}
          </div>
        </div>
      )}

      {/* User List Table */}
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">First Name</th>
            <th className="border px-4 py-2">Last Name</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.Username} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{user.Username}</td>
              <td className="border px-4 py-2">{user.Attributes.find(attr => attr.Name === 'email')?.Value}</td>
              <td className="border px-4 py-2">{user.Attributes.find(attr => attr.Name === 'given_name')?.Value}</td>
              <td className="border px-4 py-2">{user.Attributes.find(attr => attr.Name === 'family_name')?.Value}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEditUser(user)}
                  className="bg-yellow-500 text-white rounded px-2 py-1 hover:bg-yellow-600 transition duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user.Username)}
                  className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600 transition duration-200 ml-2"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
=======
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
>>>>>>> origin/main
    </div>
  );
}

export default UsersPage;
