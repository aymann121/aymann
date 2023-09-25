"use client"
import React from 'react'
import { useContext, createContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  browserSessionPersistence,
  setPersistence
} from 'firebase/auth';
import { auth } from '../firebase';

// setPersistence(auth, browserSessionPersistence)
const AuthContext = React.createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState();


  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
    // signInWithRedirect(auth, provider)
  };
  const githubSignIn = () => {
    const provider = new GithubAuthProvider();
    signInWithPopup(auth, provider);
    // signInWithRedirect(auth, provider)
  };
  const facebookSignIn = () => {
    const provider = new FacebookAuthProvider();
    signInWithPopup(auth, provider);
    // signInWithRedirect(auth, provider)
  };
  const twitterSignIn = () => {
    const provider = new TwitterAuthProvider();
    signInWithPopup(auth, provider);
    // signInWithRedirect(auth, provider)
  };
  const appleSignIn = () => {
    const provider = new OAuthProvider('apple.com');
    signInWithPopup(auth, provider);
    // signInWithRedirect(auth, provider)
  };

  const logOut = () => {
      signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ googleSignIn,githubSignIn, facebookSignIn, twitterSignIn, appleSignIn,logOut, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};