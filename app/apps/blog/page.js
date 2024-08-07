"use client"
import Link from 'next/link'
import Image from 'next/image'
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
  //  setDoc,
    updateDoc,
    doc,
    serverTimestamp,
    getDoc
  } from 'firebase/firestore';
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
  } from 'firebase/storage';
  import {UserAuth} from '../../context/AuthContext'
  import { useEffect, useState} from 'react'

export default function Blog(){
    const {user} = UserAuth()
    let [posts, setPosts] = useState([]);
    let [authorizedIds, setAuthorizedIds] = useState();

    useEffect( () =>{
        const recentMessagesQuery = query(collection(getFirestore(), 'blogPosts'), orderBy('timestamp', 'desc'));
        onSnapshot(recentMessagesQuery, function(snapshot) {
            setPosts(snapshot.docs.map((doc) => { 
                let post = doc.data(); 
                return <BlogCard postNumber = {post.postNumber} title = {post.title} date={post.date} summary = {doc.summary} titleImage = {post.imageUrlTitle} key = {doc.id} timestamp = {post.timestamp} name = {post.name} profilePicUrl = {post.profilePicUrl} /> 
            }));
        });

        const authorizedUserQuery = query(collection(getFirestore(), 'blogPostUsers'));
        onSnapshot(authorizedUserQuery, function(snapshot) {
            snapshot.docs.map((doc) => { 
                let authorizedUser = doc.data(); 
                setAuthorizedIds(authorizedUser.uuid)
            });
        });
    },[])

    return (
        <div className = "w-full  h-full ">
            <div className = "text-center mt-10">
                Welcome to my blog! 
                <br/> 
                Here I'll post about different things that interest me. 
                <br/>(I'll try not to go too long without posting)
                <br></br>
                <br/>
             </div>
            <div className = "flex justify-center mt-4 space-x-2 space-y-2 flex-wrap">

                {posts.map((post,i) => {
                    return <span key = {i} className=''>{post}</span>
                })
                }
            </div> 
            
            {/* 
            AUTHORIZING USERS IS CURRENTLY DISABLED
            {user  && authorizedIds && authorizedIds.includes(user.uid) ?
            <Link href = "/blog/post">
                <button className="w-16 h-16 rounded-full absolute bottom-10 right-10 bg-blue-500 hover:bg-blue-700 text-white">
                +
                </button>      
            </Link>
            : <></>} */}
            
            <Link href = "./blog/post">
                <button className="w-16 h-16 rounded-full absolute bottom-10 right-10 bg-blue-500 hover:bg-blue-700 text-white">
                +
                </button>      
            </Link>
        </div>
    )
}

function BlogCard (props){
    let blogUrl = "./blog/"+props.postNumber
    return (
        <div className="items-start max-w-xs w-80 dark:bg-white border dark:border-gray-200 rounded-lg shadow bg-gray-800 border-gray-700">
            <a href={blogUrl}>
                {/* <Image className=" w-60 rounded-t-lg" src={props.titleImage} alt="" /> */}
                {props.titleImage ? (<picture className='rounded-t-lg'>
                      <img src = {props.titleImage} className = 'w-80 rounded-t-lg max-h-60'  alt = 'This failed'/>
                </picture>) : <></>}
            </a>
            <div className="p-5">
                <a href={blogUrl}>
                    <h5 className="mb-2 text-2xl font-bold tracking-tight dark:text-gray-900 text-white">{props.title}</h5>
                </a>
                <p className="mb-3 font-normal dark:text-gray-700 text-gray-400">{props.summary}</p>
                
                <Link href={"./blog/"+props.postNumber} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    Read more
                    <svg aria-hidden="true" className="w-4 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </Link>
                <div className = "flex justify-between ">
                    <div className = "flex">
                        <Image alt = "this failed to load" src = {props.profilePicUrl } className = "mt-2 w-8 h-8 rounded-full" width = {60} height = {60}/>
                        <div className = "dark:text-gray-800 text-gray-300 m-auto ml-2" >{props.name}</div> 
                    </div>
                    <span className='text-white  text-center h-7 mt-2'>{props.date}</span>  
                </div>
            </div>
        </div>
    )
}