"use client"
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
  // for the future
  // import { getMessaging, getToken, onMessage } from 'firebase/messaging';
   import { getPerformance } from 'firebase/performance';
  import {UserAuth} from '../../../context/AuthContext'
  import './scrollbar.css'
  import { useEffect, useState, useRef } from 'react';
  import { getAuth, onAuthStateChanged } from "firebase/auth";

  import Image from 'next/image'
  
   
  export default function App(){
      const {user} = UserAuth()
      return  (
          <>
              {user ? <ChatRoom user = {user} /> : 
              <div align = 'center' mt = {30} > You are not signed In.</div>}
          </>
      )
  }
  const ChatMessage = (props) =>{
      const styles = {
          global:{
              maxWidth: '300px',
              marginBottom: '.5vh',
              lineHeight: '2vh',
              padding: '10px 20px',
              borderRadius: '20px',
              position: 'relative',
              color: 'white',
              textAlign: 'center'
          },
          sent : {
              backgroundColor : 'blue',
              alignSelf: 'flex-end',
          },
          recieved : {
              backgroundColor : 'red',
          },
          img: {
              maxWidth : '110px',
              marginLeft: '1vh',
              marginRight: '1vh'
          }
      }
      if(props.sent){
          return(
                <div>
                  <div className = " ml-auto flex rounded-lg bg-blue-400 flex-row justify-end max-w-[17rem] mb-[.1rem] ">

                  {props.imageurl ? 
                  <picture>
                      <img style = {styles.img} src = {props.imageurl} alt = 'This failed'/>
                  </picture>
                  :
                  <div className = "max-w-md mb-2 rounded-md relative text-center self-end bg-blue" >{props.text}</div>}
                    <Image className = "h-8 w-8"src = {props.profilepicurl} alt = 'This failed' style = {{ borderRadius : 50}} width = '35' height = '35' />                
                    </div>
                </div>
          )
      }
      return(
          <div className = "flex flex-row rounded-lg bg-red-400 justify-start max-w-[17rem] mb-[.1rem]"  >
              <div>
                  <Image className = "h-8 w-8" src = {props.profilepicurl} alt = 'This failed' style = {{marginRight: '1vh', borderRadius : 50}} width = '35' height = '35' />
              </div>
              {props.imageurl ? 
                  <picture>
                      <img alt = 'This failed'  src = {props.imageurl} style = {styles.img}/>
                  </picture>
                  :
                  <div className = "max-w-md mb-2 rounded-md relative text-center self-start">{props.text}</div>}
          </div>
      )
  } 
  
  function ChatRoom(props){
      let user = useRef(props.user)
      const [formValue, setFormValue] = useState('');
      const [messages, setMessages] = useState([])
      const dummy = useRef()
      
      const scrollToBottom = () =>{
        dummy.current?.scrollIntoView({ behavior: "smooth" })
      }
    useEffect( () =>{
        const recentMessagesQuery = query(collection(getFirestore(), 'messages'), orderBy('timestamp', 'desc'), limit(100));
        onSnapshot(recentMessagesQuery, function(snapshot) {
            setMessages(snapshot.docs.map((doc) => { 
                let message = doc.data(); 
                return <ChatMessage key = {doc.id} timestamp = {message.timestamp} name = {message.name} text = {message.text} profilepicurl = {message.profilePicUrl} imageurl = {message.imageUrl} sent = {user.current.uid === message.uid }/> 
            }));
            scrollToBottom()
        });
        
    },[])
    useEffect( () =>{
        scrollToBottom()
    },[messages])
          
          
      async function saveMessage(e) {
          e.preventDefault(); 
          console.log(user)
          console.log(JSON.stringify(user.current) === JSON.stringify({})); // true

          // Add a new message entry to the Firebase database.
          try {
            await addDoc(collection(getFirestore(), 'messages'), {
              name: user.current.displayName,
              text: formValue,
              profilePicUrl: user.current.photoURL,
              timestamp: serverTimestamp(),
              uid: user.current.uid
            });
          }
          catch(error) {
            console.error('Error writing new message to Firebase Database', error);
          }
          setFormValue('');
          
        }
      async function saveImageMessage(file) {
          try {
            // 1 - We add a message with a loading icon that will get updated with the shared image.
            const messageRef = await addDoc(collection(getFirestore(), 'messages'), {
              name: user.current.displayName,
              imageUrl: 'https://www.google.com/images/spin-32.gif?a', //loading image url
              profilePicUrl: user.current.photoURL,
              timestamp: serverTimestamp(),
              uid : user.current.uid
            });
        
            // 2 - Upload the image to Cloud Storage.
            const filePath = `${user.current.uid}/${messageRef.id}/${file.name}`;
            const newImageRef = ref(getStorage(), filePath);
            const fileSnapshot = await uploadBytesResumable(newImageRef, file);
            
            // 3 - Generate a public URL for the file.
            const publicImageUrl = await getDownloadURL(newImageRef);
        
            // 4 - Update the chat message placeholder with the image's URL.
            await updateDoc(messageRef,{
              imageUrl: publicImageUrl,
              storageUri: fileSnapshot.metadata.fullPath
            });
          } catch (error) {
            console.error('There was an error uploading a file to Cloud Storage:', error);
          }
      }
  
  
      //getPerformance();
      return(
          <div className = "text-center mt-9 ">
              This is a chat with no regulations accessible to anyone, be nice.
          
              <main className = "m-auto mt-8 w-96 border-2 border-black h-96 overflow-y-scroll flex flex-col">
  
                  {messages.slice().reverse()}
                  <div ref = {dummy} > </div>
              </main>
              <form className = "border-2 border-black w-96 m-auto pb-2"onSubmit = {saveMessage}>
                  <div className = "mt-2 flex justify-center align-middle mr-1 " style = {{width : '100%'}}>
                      <input className = "border-2 border-black ml-12 mr-1 rounded-md" type = "text" value = {formValue} onChange = {(e) => {setFormValue(e.target.value)}} />
                            <input className = "rounded-lg pl-3 bg-gray-200 pr-3 mr-3 ml-3 hover:bg-gray-400" type = 'submit' disabled = {!formValue} value = "Submit" />
                      <label className = "" htmlFor="icon-button-file">
                          <input style = {{display:'none'}}accept="image/*" id="icon-button-file" type="file" onChange = {(e) => {saveImageMessage(e.target.files[0])}} />
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> 
                      </label>
                  </div>
              </form>
              
          </div>
      )
  }