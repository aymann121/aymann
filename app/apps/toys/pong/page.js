"use client"
import React, { useEffect, useRef } from "react";
//import 'game.js';


const style = {
    canvas :{
        display: 'flex' ,
        border: '3px solid black',
        marginTop: '5px',
        marginRight: 'auto',
        marginLeft: 'auto'
    },
    message :{
        fontSize: 'x-large',
        textAlign: 'center'
    },
    div :{
        textAlign: 'center'
    },
    button :{
        backgroundColor: 'blue',
        color: 'white',
        "&:hover" :{
            backgroundColor: 'red',
            color: 'white',
            cursor: 'pointer',
            transition: "0.5s ",
        }
    }
}

const gameState = {
    player : {
        pos : {x : 10, y : 250},
        vel : {x : 0, y : 0},
        score : 0,
    }
}

export default function Pong(props){
    let c4 = useRef();
    
    useEffect(()=>{
        let settings = {
            width : props.width || 630,
            height : props.height || 540,
        }
        const canvas = c4.current;
        canvas.width = settings.width
        canvas.height = settings.height;
        let context = canvas.getContext('2d');
        // new Game(context, settings);
    })
    

    return (
           <div style = {style.div}>
               <canvas ref={c4} style = {style.canvas}/>
               How to play:
           </div>
       )
}
