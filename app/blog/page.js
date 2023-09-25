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
  import {UserAuth} from '../context/AuthContext'
  import { useEffect, useState} from 'react'

export default function Blog(){
    const {user} = UserAuth()
    let [posts, setPosts] = useState([]);
    let [authorized, setAuthorized] = useState(false);

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
                //if the current user is one of the authorized users set authorized to true
                authorizedUser.uuid.map((e)=>{if(user && e == user.uid){setAuthorized(true)}})
            });
        });
    },[])

    return (
        <div className = "w-full  h-full ">
            <div className = "text-center mt-10">
                Welcome to my blog! 
                <br/> 
                Here I'll post about different things that interest me.
                <br/>
             </div>
            <div className = "flex justify-center mt-4 space-x-2  flex-wrap">
            {/* style this div to be a masonry list */}
            {/* <div className='columns-1 sm:columns-2 bg-blue-400 max-w-fit lg:columns-3 gap-4 mt-3 space-y-2 m-auto'> */}
                
                {posts.map((post,i) => {
                    return <span key = {i} className=''>{post}</span>
                })
                }
            </div> 
            
            {authorized ? 
            <Link href = "/blog/post">
                <button className="w-16 h-16 rounded-full absolute bottom-10 right-10 bg-blue-500 hover:bg-blue-700 text-white">
                +
                </button>      
            </Link>
            : <></>}
        </div>
    )
}

function BlogCard (props){
    let blogUrl = "/blog/"+props.postNumber
    return (
        <div className="items-start max-w-xs w-80  bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <a href={blogUrl}>
                {/* <Image className=" w-60 rounded-t-lg" src={props.titleImage} alt="" /> */}
                {props.titleImage ? (<picture className='rounded-t-lg'>
                      <img src = {props.titleImage} className = 'w-80 rounded-t-lg max-h-60'  alt = 'This failed'/>
                </picture>) : <></>}
            </a>
            <div className="p-5">
                <a href={blogUrl}>
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{props.title}</h5>
                </a>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{props.summary}</p>
                
                <Link href={"/blog/"+props.postNumber} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    Read more
                    <svg aria-hidden="true" className="w-4 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </Link>
                <div className = "flex justify-between ">
                    <div className = "flex">
                        <Image alt = "this failed to load" src = {props.profilePicUrl } className = "mt-2 w-8 h-8 rounded-full" width = {60} height = {60}/>
                        <div className = "text-gray-800 dark:text-gray-300 m-auto ml-2" >{props.name}</div> 
                    </div>
                    <span className='text-white  text-center h-7 mt-2'>{props.date}</span>  
                </div>
            </div>
        </div>
    )
}