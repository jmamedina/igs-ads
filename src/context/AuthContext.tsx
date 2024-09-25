'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserSession} from 'amazon-cognito-identity-js';

// Cognito credentials
const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
};

const userPool = new CognitoUserPool(poolData);

// Create context
const AuthContext = createContext<{
  user: CognitoUser | null;
  loading: boolean; // Add loading state
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
} | null>(null);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Initialize loading state

  useEffect(() => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.getSession((err, session) => {
        if (err || !session.isValid()) {
          setUser(null);
          localStorage.removeItem('cognitoUser');
          setLoading(false);
          return;
        }
        // Extend the session by refreshing tokens if needed
        currentUser.refreshSession(session.getRefreshToken(), (err, refreshedSession) => {
          if (err) {
            console.error("Error refreshing session:", err);
            setUser(null);
            localStorage.removeItem('cognitoUser');
          } else {
            const userData = {
              username: currentUser.getUsername(),
              accessToken: refreshedSession.getAccessToken().getJwtToken(),
            };
            setUser(currentUser);
            localStorage.setItem('cognitoUser', JSON.stringify(userData));
          }
          setLoading(false);
        });
      });
    } else {
      setLoading(false);
    }
  }, []);
  

  const signIn = async (username: string, password: string): Promise<CognitoUserSession | { newPasswordRequired: boolean; cognitoUser: CognitoUser }> => {
    console.log("signIn called with", username, password); // Add this to check if it's invoked
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      });
  
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      });
  
      console.log("CognitoUser created:", cognitoUser); // Ensure CognitoUser is created properly
  
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          console.log("Authentication successful:", result); // Check if success is reached
          const userData = {
            username: cognitoUser.getUsername(),
            accessToken: result.getAccessToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
            idToken: result.getIdToken().getJwtToken(),
          };
          setUser(cognitoUser);
          localStorage.setItem('cognitoUser', JSON.stringify(userData));
        },
        onFailure: (err) => {
          console.error("Authentication failed:", err); // Check failure reason
          reject(err);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          resolve({ newPasswordRequired: true, cognitoUser });
      }
      });
    });
  };
  

  const signOut = async (): Promise<void> => {
    return new Promise((resolve) => {
      user?.signOut();
      setUser(null);
      localStorage.removeItem('cognitoUser'); // Remove user from localStorage
      resolve();
    });
  };

  const authContextValue = { user, loading, signIn, signOut }; // Provide loading in context

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Complete new password challenge and store session
export const completeNewPasswordChallenge = (cognitoUser: CognitoUser, newPassword: string) => {
  return new Promise((resolve, reject) => {
      cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
          onSuccess: (session) => {
              // Save the session data after the password challenge
              const userData = {
                  accessToken: session.getAccessToken().getJwtToken(),
                  refreshToken: session.getRefreshToken().getToken(),
                  idToken: session.getIdToken().getJwtToken(),
                  username: cognitoUser.getUsername()
              };

              localStorage.setItem('cognitoUser', JSON.stringify(userData));

              resolve(session);
          },
          onFailure: (err) => {
              reject(err);
          },
      });
  });
};
