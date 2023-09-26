"use client"
import Link from 'next/link'
import Image from 'next/image'
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    //setDoc,
    // updateDoc,
    // doc,
    // serverTimestamp,
    // where,
    // getDoc
  } from 'firebase/firestore';
import {
    // getStorage,
    // ref,
    // uploadBytesResumable,
    // getDownloadURL,
  } from 'firebase/storage';
  import { useEffect, useState} from 'react'

export default function Page({ params, searchParams }) {
  const [posts, setPosts] = useState(null)
  useEffect( () =>{
    const q = query(collection(getFirestore(), "blogPosts"),  orderBy('timestamp', 'asc'));
      onSnapshot(q, function(snapshot) {
          setPosts(snapshot.docs.map((doc) => { return doc.data(); }));
      });
  },[])
    
    // const [loading, setLoading] = useState(true)
    // const [error, setError] = useState(null)
    if (posts){
      let data = posts[params.id-1]
      let text = data.text.split('<br>')
      text = text.map((e,i)=>{
        return (<p key = {i}>{e}<br/><br/></p>)
      })
      
      return  (
        <div className = "">
          <div className ="text-center">
            <h1 className = "font-bold text-6xl mt-9">{data.title}</h1>
            <p className = "text-gray-500 text-lg mt-3">{data.summary}</p>
            <p className = "mt-3">{data.date}</p>
            <div className = "mt-6  m-auto w-8/12 text-lg">{text}</div>
            <div className = "flex m-auto w-fit"> -  {data.name} 
              <Image alt = "This image failed to laoad" className = " ml-3 mr-3 rounded-full " src = {data.profilePicUrl} width = {33} height = {33}></Image> 
            </div>
          </div>
        </div>)
    }
    return  (
    <div>
      <h1>This page does not exist</h1>
    </div>)
}