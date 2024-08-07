"use client"
import ayman from "./ayman.jpg"
import Image from 'next/image'
import Link from "next/link"
import Blog from './apps/blog/page.js'
import "./homestyles.css"
import { useRef, useState, useEffect } from 'react'
import AnimatedComponent from "./components/SlideIn"
import SlideIn from "./components/SlideIn"
import node from '../public/node.png'
import firebase from '../public/firebase.png'
import react from '../public/react.png'
import tailwind from '../public/tailwind.svg'
import matplotlib from '../public/matplotlib.png'
import numpy from '../public/numpy.png'
import cern from '../public/cern.png'
import jupyter from '../public/jupyter.png'
import python from '../public/python.webp'
import git from '../public/git.png'
import jira from '../public/jira.png'
import angular from '../public/angular.png'
import mongodb from '../public/mongodb.svg'
import java from '../public/java.webp'
import spotify from '../public/spotify.png'
import junit from '../public/junit.png'
// import github from './Icons/github.png'
import github from './layout/Icons/github.png'


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

function SlideCard(props){
  return (<div className = {props.className}><SlideIn direction = {props.direction}>
    {/* <div> */}
      <div className = " w-[calc(100%)] border-t-2 border-gray-500 " />
      <div className = "mt-1 flex mb-2">
        <div className = {(props?.direction == "left" ? "mr-3":"ml-3") + "  font-bold"}>{props.title} </div>
        {props.link ? <Link className = {(props?.direction == "left" ? "mr-3":"") + "   my-auto ml-auto  rounded hover:bg-gray-400" }href = {""} >
          <Image src={github} alt={props.link} width={23}  />
        </Link>:<></>}
      </div>
      <div className = {props?.direction == "left" ? "mr-3":" ml-3"}>
        {props.children}
      </div>
      <div className = "flex mx-3 mt-2 justify-around lg:justify-center lg:space-x-8">
        {/* <Image src = {matplotlib}  height = {50}/>
        <Image src = {numpy}  height = {50}/>
        <Image src = {cern}  height = {50}/>
        <Image src = {python}  height = {50}/>
        <Image src = {jupyter}  height = {50}/> */}
        {props.images.map(ele => <Image src = {ele}  height = {50}/>)}
      </div>
    {/* </div> */}
  </SlideIn></div>)
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-16">
      
      <div className = "w-full">
        <div className = "flex w-fit m-auto">
          <div className = "font-bold  text-7xl sm:text-9xl  mt-auto mb-auto mr-10 sm:mr-20">Hi,</div> 
          <Image className = "m-auto rounded-2xl w-[15rem] sm:w-[19rem]" src = {ayman} width = {300}></Image>
        </div>
        <div className = "font-bold text-6xl sm:text-8xl md:text-9xl m-auto text-center mt-7">I'm Ayman.</div> 
      </div>

      <div className='fade mt-14'>
        I'm a Computer Science student at MIT and this is my website.
      </div>
      <div className=" fade mx-3 my-5 h-12 border-r-2 border-gray-500 " />
      <div className = "fade ">
        I'm looking for an opportunity to apply my software development skills to increase the efficiency and quality of various product and services, especially in the fields of Machine Learning, Data Science, and Software Construction.
      </div>
      <div className=" fade mx-3 my-5 h-5 border-r-2 border-gray-500 " />

      <div className = "fade  relative w-full">
        <div className = "bold text-4xl text-center mb-5 ">Experience</div>
        <div className = " m-auto w-0 h-[40rem] lg:h-[30rem] border-l-2 border-gray-500 " />

        <SlideCard direction = "left" className = "absolute w-1/2 left-[calc(0%)] bottom-40" images = {[matplotlib, numpy, cern, python, jupyter]} title = "FCC Analysis, Undergraduate Researcher"> 
          Used Collider Monte Carlo Simulation Samples to reconstruct the mass of the W Boson. One method includes measuring the effective cross sections of quarks the W boson decays into by finding which energy levels return maximal values. Presented at the Annual FCC Conference at MIT (April 2024).
        Research included working with tools like Jupyter Notebook, SSH, Python, and CERN virtual environment.
        </SlideCard>

        <SlideCard direction = "right" className = "absolute w-1/2 right-[calc(0%)] bottom-24" images = {[git, jira, angular, mongodb]} title = "Birth By Us, Software Engineering Intern"> 
        MIT PKG Social impact internship with the purpose of developing an app to help black mothers through the pregnancy and postpartum process. Worked on projects helping develop the backend and use mongoose APIs to pull data to the client side using angular. Also used external front-end libraries like pdfmake and chart.js to develop informational features.
        </SlideCard>

      </div>

      <div className = "fade  relative w-full">
        <div className = "bold text-4xl text-center my-4">Projects</div>
        <div className = " m-auto w-0 h-[48rem] lg:h-[43rem] border-l-2 border-gray-500 " />
        
        <SlideCard link = "https://github.com/aymann121/aymann" direction = "left" className = " absolute w-1/2 left-[calc(0%)] bottom-60" images = {[]} title = "This Website ✦"> 
        <div>
          <ul className="list-disc ml-2 space-y-2 mb-2">
            <li>I built it to learn more about web development and have a plact to display my experience.</li>
            <li>I used Next.js and TailwindCSS to develop the front end and used Firebase and Node.js when making the backend.</li> 
            <li>Small projects include a few games, a chat app, an authentication system, a server to keep track of leaderboards, a working blog that I can post to from the website, and a bell schedule app that I used when I was in high school .</li>
          </ul>
        </div>
          <div className = " flex justify-center">
            <div>
              <div className = "text-center">Frontend</div>
              <div className = 'flex space-x-5 '>
                <div className = "text-center">
                  <Image src = {react}  height = {50}/>
                  React
                </div>
                <div className = "text-center ">
                  <Image src = {tailwind}  height = {50}/>
                  Tailwind
                </div>
              </div>
            </div>
            <div className="mx-3 mb-auto mt-3 flex-grow min-w-[1rem] max-w-[10rem] border-b-2 border-green-500 border-dashed" />
            <div>
              <div className = "text-center">Backend</div>
              <div className = 'flex space-x-5'>
                <div className = "text-center ">
                  <Image src = {firebase}  height = {50}/>
                  Firebase
                </div>
                <div className = "text-center">
                  <Image src = {node}  height = {50}/>
                  Node
                </div>
              </div>
            </div>
          </div>

          {/* <div className = "rounded w-90% bg-red-50">
            <div>Github</div>
            <div>Ayman's Portfolio Website</div>
          </div> */}
        </SlideCard>

        <SlideCard link = "https://github.com/aymann121/WARP" direction = "right" className = "absolute w-1/2 right-[calc(0%)] bottom-40" images = {[java, junit, git]} title = "WARP Project "> 
            Project Completed at the University of Iowa (during highschool). Code forked from Steve Goddard's base. The WARP sensor network research project. 
            Much of the class was focused on developing skill in Java, Git Collaboration, JUnit Testing, Code Refactoring, UML Diagrams, and the software construction life Cycle (Sprint Model).
            Also developed greater understanding of WARP module relationships and interactions.
        </SlideCard>

        <SlideCard direction = "left" className = "absolute w-1/2 left-[calc(0%)] bottom-10" images = {[git, python, spotify]} title = "Spotify Web Scraper (⚠️ In Progress) "> 
        Using Spotify api to scrape playlists and make equivalents on youtube music. (For downloadability and becuase you can use YT Music for free.) 
        </SlideCard>

      </div>



      
        
      
      
    </main>
  )
}

