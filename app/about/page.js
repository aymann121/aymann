import React from 'react';
import Image from 'next/image'
import ayman from './ayman.jpg'

function Person(props){
    //take in name, description, and image
    return (
        <div className = "text-center mb-3 mt-5 border-solid border-2 rounded-lg w-fit m-auto pb-3 border-black">
            <h1 className = "text-2xl mb-4">{props.name}</h1>
            <Image className = "m-auto" src = {props.image} width = {200}></Image>
            <p className = "pl-3 pr-3 mt-3 text-md">{props.description}</p>
        </div>
    )
}
export default function About(props){
    return (
        <div className = "text-center mt-9">
            <Person name = "Ayman Noreldaim" description = "(Photo from Cross Country media day at MIT)" image = {ayman}></Person>
            <p className = "text-xl"> Hi! I'm Ayman. </p> 
            <br/>
            <p> I'm currently a computer science student at MIT and this is a website I built to learn more about programming in JavaScript.
                 I used Next.js and TailwindCSS to develop the front end and used Firebase and Node.js when making the backend. I've built a few small games, a chat app, an authentication system, a server to keep track of leaderboards, a working blog that I can post to from the website, and a bell schedule app that I used when I was in high school.
            </p>
            <br />
            <p> </p>
        </div>
    )
}