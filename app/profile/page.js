"use client"
import React, { useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation'
// import Router from 'next/router';
// import { useRouter } from 'next/router'


export default function Profile(){
  const { user, logOut } = UserAuth();
  
  const router = useRouter();

  useEffect(()=>{
    if(!user) router.push('/login')
  },[])
  const handleLogOut = () => {
    logOut()
    router.push('/')
  };

  return (
    <div className = "m-auto text-center mt-40 border-4 w-80" >
      <h1>Profile:</h1>
      <h2>{user && user.email}</h2>
      <button onClick = {handleLogOut} className = "mt-2 mb-3 ml-3 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Sign Out</button>
    </div>
  );
};
