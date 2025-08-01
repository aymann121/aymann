"use client"
//import state hook
import { useEffect, useState } from 'react';


export default function Jokes() {
    //state for jokes
    let [jokes, setJokes] = useState([])
    //fetch dad jokes from icanhazdadjoke api
    useEffect(()=>{
        fetch('https://icanhazdadjoke.com/slack')
        .then(response => response.json())
        .then(data => {
            setJokes(data.attachments)
        })
    },[])
    //display jokes
    let jokeList = jokes.map((joke,i)=>{
        return <div key = {i} className = "bg-gray-200 p-2 m-2 rounded-lg">{joke.text}</div>
    })
    
    let generateJoke = () => {
        fetch('https://icanhazdadjoke.com/slack')
        .then(response => response.json())
        .then(data => {
            setJokes([...jokes, data.attachments[0]])
        })
    }
    return (
        <div className = "flex flex-col items-center">
            <h1 className = "mt-20 mb-4 text-4xl font-bold">Dad Jokes</h1>
            <button className = "bg-blue-400 p-2 m-2 rounded-lg" onClick = {generateJoke}>Generate Joke</button>
            <div className = "flex flex-col items-center">
                {jokeList}
            </div>
            
        </div>
    )
    
}