"use client"
import Image from 'next/image'
import Blog from './blog/page.js'
import { useRef, useState, useEffect } from 'react'
function RunAwayButton(){
  //button that teleports to a different location not on the users mouse when clicked
  let buttonRef = useRef(null)
  let [buttonX, setButtonX] = useState("50vw")
  let [buttonY, setButtonY] = useState("50vh")
  let [buttonWidth, setButtonWidth] = useState(0)
  let [buttonHeight, setButtonHeight] = useState(0)
  let [buttoncolor, setButtonColor] = useState("blue") // set to random color on click

  useEffect(()=>{
    setButtonWidth(buttonRef.current.offsetWidth)
    setButtonHeight(buttonRef.current.offsetHeight)
  }
  ,[])
  const handleClick = (e) => {
    setButtonColor(`rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`)
    setButtonX(Math.random()*window.innerWidth)
    setButtonY(Math.random()*window.innerHeight)
  }
  return (
    <button onClick={handleClick} className = "text-white font-bold py-2 px-4 rounded" ref = {buttonRef} style = {{position: "absolute", top: buttonY - buttonHeight/2, left: buttonX - buttonWidth/2, background: buttoncolor}}>Run Away!</button>
  )
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <div>Click the button and it'll teleport and change to a random color.</div>
         <RunAwayButton />
      </div>
    </main>
  )
}
