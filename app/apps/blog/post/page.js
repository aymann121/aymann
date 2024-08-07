"use client"
import { setRevalidateHeaders } from 'next/dist/server/send-payload';
import React from 'react'
import { useState, useEffect} from 'react'
import { useRouter } from 'next/navigation'
import Router from 'next/router'
import { getCountFromServer } from 'firebase/firestore';
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
  } from 'firebase/firestore';
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
  } from 'firebase/storage';

  import {UserAuth} from '../../../context/AuthContext'

export default function Form() {
    
  const router = useRouter()
    const {user} = UserAuth()
    const [title, setTitle] = useState("");
    const [date,setDate] = useState("");
    const [message, setMessage] = useState("")
    const [titleImage, setTitleImage] = useState(null);
    const [blogImages, setBlogImages] = useState([]);
    const [summary, setSummary] = useState("");
    const [disableSubmit, setDisableSubmit] = useState(false);



    async function saveMessage(e) {
        e.preventDefault(); 
        setDisableSubmit(true);

        let postNumber;
        const snapshot = await getCountFromServer(collection(getFirestore(), "blogPosts"));
        postNumber = snapshot.data().count + 1;

        try {
          const blogRef = await addDoc(collection(getFirestore(), 'blogPosts'), {
            name: user.displayName,
            text: message,
            profilePicUrl: user.photoURL,
            timestamp: serverTimestamp(),
            date: date,
            title: title,
            uid: user.uid,
            summary: summary,
            postNumber: postNumber,
            blogImages: blogImages,
          });

          // const blogRef = await setDoc(doc(getFirestore(), 'blogPosts',  "Post "+postNumber), {
          //   name: user.displayName,
          //   text: message,
          //   profilePicUrl: user.photoURL,
          //   timestamp: serverTimestamp(),
          //   date: date,
          //   title: title,
          //   uid: user.uid,
          //   summary: summary,
          //   postNumber: postNumber,
          // });



          await saveImage(titleImage,"Title",blogRef)
          for (let i = 0; i < blogImages.length; i++) {
            await saveImage(blogImages[i],i+1,blogRef)
          }


        }
        catch(error) {
          console.error('Error writing new message to Firebase Database', error);
        }
        router.push('/blog')
        setTitle('');
        setDate('');
        setMessage('');
        setTitleImage(null);
        setBlogImages([]);
        setBlogImageForms([]);
        setSummary('');
      }

    //functin to go to '/blog'
    const goToBlog = () => {
        router.push('/blog')
    }
          
    
    

    async function saveImage(file,key,blogRef) {
      try {
        // 1 - We add a message with a loading icon that will get updated with the shared image.
        
        // 2 - Upload the image to Cloud Storage.
        const filePath = `${user.uid}/${blogRef.id}/${file.name}`;
        const newImageRef = ref(getStorage(), filePath);
        const fileSnapshot = await uploadBytesResumable(newImageRef, file);
        
        // 3 - Generate a public URL for the file.
        const publicImageUrl = await getDownloadURL(newImageRef);
    
        // 4 - Update the chat message placeholder with the image's URL.
        let imageUrl = "imageUrl" + key
        let storageUri = "storageUri" + key
        let imageUrls = {}
        imageUrls[imageUrl] = publicImageUrl
        imageUrls[storageUri] = fileSnapshot.metadata.fullPath
            // 4 - Update the chat message placeholder with the image's URL.
        await updateDoc(blogRef,imageUrls);
      } catch (error) {
        console.error('There was an error uploading a file to Cloud Storage:', error);
      }
  }
    let [blogImageForms,setBlogImageForms] = useState([<input key = {0} className = "w-56 max-w-4xl border mb-4 h-9 m-auto" onChange={(e)=>{setBlogImages(blogImages.concat(e.target.files[0]))}} type = "file" placeholder = "Title Image" />])
    let addBlogImage = () => {
      console.log(blogImageForms)
      setBlogImageForms(blogImageForms.concat(<input key = {blogImageForms.length} className = "w-56 max-w-4xl border mb-4  h-9 m-auto" onChange={(e)=>{setBlogImages(blogImages.concat(e.target.files[0]))}} type = "file" placeholder = "Title Image" />))
    }
    // see if the current user is authorized
    /*
    *** AUTHORIZING USERS IS CURRENTLY DISABLED (FOR Showing off purposes)*** 

    let [authorized, setAuthorized] = useState(false);
    useEffect( () =>{
      const authorizedUserQuery = query(collection(getFirestore(), 'blogPostUsers'));
      onSnapshot(authorizedUserQuery, function(snapshot) {
          snapshot.docs.map((doc) => { 
              let authorizedUsers = doc.data(); 
              //if the current user is one of the authorized users set authorized to true
              authorizedUsers.uuid.map((e)=>{if(user && e == user.uid){setAuthorized(true)}})
          });
      });
    },[])
    if (!authorized){
      return <div className = "text-center mt-20"> You are not authorized to make blog posts.</div>
    }
    */
      
      if (!user){
        return <div className = "text-center mt-20"> You need to be signed in to make a post.</div>
      }
    return (
        <div className="text-center mt-5 ">
            <h1>Form:</h1>
            <form className = "m-auto flex flex-col space-y-4" onSubmit={saveMessage}>
                {/* take in an image file */}
                <div className = "mt-5">
                  <span className = "mr-3">Title Image:</span>
                  <input className = "w-56 max-w-4xl border h-9 m-auto"  onChange={(e)=>{setTitleImage(e.target.files[0])}} type = "file" placeholder = "Title Image"></input>
                </div>
                {/* <div className = "flex m-auto">
                  <span className = " h-10 mt-5 w-24">Blog Images:</span>
                  <div className = "mt-5 m-auto w-60  mb-4 rounded-lg" >
                    
                    
                    {blogImageForms}
                    <div onClick = {addBlogImage} className = "cursor-pointer text-blue-600  hover:text-red-400" > Add another Blog Image:</div>
                  </div>
                </div> */}
                
                
                <input className = " w-64 border-2 border-gray-500 rounded-lg  h-9 m-auto pl-2" onChange={(e)=>{setTitle(e.currentTarget.value)}} value = {title} type = "text" placeholder = "Title"></input>
                <input className = "w-64 border-2 border-gray-500 rounded-lg h-9 m-auto pl-2" onChange={(e)=>{setDate(e.currentTarget.value)}} value = {date} type = "text" placeholder = "Date"></input>
                <input className = "w-64 border-2 border-gray-500 rounded-lg h-9 m-auto pl-2" onChange={(e)=>{setSummary(e.currentTarget.value)}} value = {summary} type = "text" placeholder = "Summary (Short)"></input>
                <textarea className = "w-8/12 m-auto p-3 max-w-4xl border-2 border-black rounded-lg h-24" onChange={(e)=>{setMessage(e.currentTarget.value)}} value = {message} type = "text" placeholder = "Blog Post"></textarea>
                <input className = "m-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer" type = 'submit' disabled = {!title|| !date || !message || disableSubmit} value = "Submit" />
            </form>
            <div className = "border-2 border-black rounded-md m-auto mt-3 w-fit p-4 flex flex-col space-y-3">
              <div className = "underline">Tags to use:</div>
              <div>{'<br/><br/> for 2 line breaks'}</div>
              <div>{'<a href = {"link"}></a> for links'}</div>
              <div>{'<u></u> for underlining'}</div>
              <div>{'<strong></strong> for making stuff bold'}</div>
              {/* <div>{'/img/ for inserting a blog image'}</div> */}
            </div>
        </div>
    )
}
