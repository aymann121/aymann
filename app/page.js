"use client";
import ayman from "./ayman.jpg";
import Image from "next/image";
import Link from "next/link";
import Blog from "./apps/toys/blog/page.js";
import "./homestyles.css";
import { useRef, useState, useEffect } from "react";
import AnimatedComponent from "./components/SlideIn";
import SlideIn from "./components/SlideIn";
import node from "../public/node.png";
import firebase from "../public/firebase.png";
import react from "../public/react.png";
import tailwind from "../public/tailwind.svg";
import matplotlib from "../public/matplotlib.png";
import numpy from "../public/numpy.png";
import cern from "../public/cern.png";
import google from "../public/google.png";
import bbu from "../public/bbu.jpeg";
import gcloud from "../public/gcloud.png";
import jupyter from "../public/jupyter.png";
import python from "../public/python.webp";
import git from "../public/git.png";
import jira from "../public/jira.png";
import angular from "../public/angular.png";
import mongodb from "../public/mongodb.svg";
import medialab from "../public/medialab.svg";
import spanner from "../public/spanner.png";
import java from "../public/java.webp";
import spotify from "../public/spotify.png";
import junit from "../public/junit.png";
// import github from './Icons/github.png'
import github from "./layout/Icons/github.png";

function SlideCard(props) {

  let iconComp = <Image alt = "icon" src = {props.icon} className = "rounded-sm w-6 h-6 border-zinc-950 mr-2"/>
  return (
    <div className={props.className}>
      <SlideIn direction={props.direction}>
        {/* <div> */}
        <div className=" w-[calc(100%)] border-t-2 border-gray-500 " />
        <div className="mt-1 flex">
          <div
            className={
              (props?.direction == "left" ? "mr-3" : "ml-3") + " flex font-bold"
            }
          >
            {/* <span> */}

            {props?.icon ? props.iconLink ? <Link href={props.iconLink}> {iconComp}</Link> : iconComp : <></>}

            <div className = "m-auto">
              {props.title}{" "}
              </div>
            {/* </span> */}
            
          </div>
          {props.ghlink ? (
            <Link
              target="_blank"
              className={
                (props?.direction == "left" ? "mr-3" : "") +
                "   my-auto ml-auto  rounded hover:bg-gray-400"
              }
              href={props.ghlink}
            >
              <Image src={github} alt={props.ghlink} width={23} />
            </Link>
          ) : (
            <></>
          )}
        </div>
        <div
          className={
            (props?.direction == "left" ? "mr-3" : " ml-3") +
            " text-stone-600 text-sm"
          }
        >
          {props?.subtitle}
        </div>
        <div
          className={(props?.direction == "left" ? "mr-3" : " ml-3") + " mt-2"}
        >
          {props.children}
        </div>
        <div className="flex mx-3 mt-2 justify-around lg:justify-center lg:space-x-8">
          {/* <Image src = {matplotlib}  height = {50}/>
        <Image src = {numpy}  height = {50}/>
        <Image src = {cern}  height = {50}/>
        <Image src = {python}  height = {50}/>
        <Image src = {jupyter}  height = {50}/> */}
          {props?.images?.map((ele, index) => (
            <Image alt = "icon" key = {index} src={ele} height={50} />
          ))}
        </div>
        {/* </div> */}
      </SlideIn>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-16">
      <div className="w-full">
        <div className="flex w-fit m-auto">
          <div className="font-bold  text-7xl sm:text-9xl  mt-auto mb-auto sm:mr-6 mr-10 hidden sm:block">
            Hi,
          </div>
          <Image
            alt="Ayman"
            className="m-auto rounded-2xl w-[15rem] sm:w-[19rem]"
            src={ayman}
            width={300}
          ></Image>
        </div>
        <div className="font-bold text-6xl sm:text-8xl md:text-9xl m-auto text-center mt-7 hidden sm:block">
          I'm Ayman.
        </div>
        <div className="font-bold text-5xl m-auto text-center mt-7 sm:hidden">
          Hi, I'm Ayman.
        </div>
      </div>

      <div className="fade mt-14">
        I'm a Computer Science student at MIT and this is my porfolio website.
      </div>
      <div className=" fade mx-3 my-5 h-12 border-r-2 border-gray-500 " />
      <div className="fade ">
        I'm looking for opportunities to apply my software development skills to
        create or increase the efficiency and quality of various product and
        services, especially in the fields of Machine Learning, Data Science,
        and Software Construction.
      </div>
      <div className=" fade mx-3 my-5 h-5 border-r-2 border-gray-500 " />

      <div className="fade  relative w-full ">
        <div className="bold text-4xl text-center mb-5 ">Experience</div>
        <div className="hidden md:block m-auto w-0 h-[54rem] lg:h-[42rem] border-l-2 border-gray-500 " />

        <SlideCard
          direction="left"
          className="m-auto mb-10 w-full md:absolute md:w-1/2  left-[calc(0%)] top-24"
          images={[matplotlib, numpy, cern, python, jupyter]}
          title="FCC Analysis, Undergraduate Researcher"
          subtitle="Cambridge, Massachusetts (January 2023 - May 2024)"
        >
          Used Collider Monte Carlo Simulation Samples to reconstruct the mass
          of the W Boson. One method includes measuring the effective cross
          sections of quarks the W boson decays into by finding which energy
          levels return maximal values. Presented at the Annual FCC Conference
          at MIT (April 2024). Research included working with tools like Jupyter
          Notebook, SSH, Python, and CERN virtual environment.
        </SlideCard>

        <SlideCard
          direction="right"
          className="m-auto mb-10 w-full md:absolute md:w-1/2  right-[calc(0%)] top-40"
          images={[git, jira, angular, mongodb]}
          title="Birth By Us, Software Engineering Intern"
          subtitle="Sacramento, California (June 2024 - August 2024)"
          icon = {bbu}
          iconLink = "https://www.birthbyus.com/"
        >
          MIT PKG Social impact internship with the purpose of developing an app
          to help black mothers through the pregnancy and postpartum process.
          Worked on projects helping develop the backend and use mongoose APIs
          to pull data to the client side using angular. Also used external
          front-end libraries like pdfmake and chart.js to develop informational
          features.
        </SlideCard>

        <SlideCard
          direction="left"
          className="m-auto mb-10 w-full md:absolute md:w-1/2  left-[calc(0%)] lg:top-[24rem] top-[32rem]"
          images={[matplotlib, numpy, python, jupyter]} // add pytorch, and react native logos
          title="Decentralized AI Research at MIT’s Media Lab"
          subtitle="Cambridge, Massachusetts (August 2024 - May 2025)"
          icon = {medialab}
          iconLink = "https://www.media.mit.edu/"
        >
          <div>
            • Trained machine learning models in a decentralized manner with
            PyTorch. Designed and conducted systematic experiments to evaluate
            performance factors such as communication overhead, model
            convergence rates, and potential privacy leakage.
          </div>
          <div>
            • Analyzed results to identify optimal configurations and balance
            between accuracy, speed, and data protection.
          </div>
          <div>
            • Developed web interface using React allowing users to train models
            and share model data securely within browser.
          </div>
        </SlideCard>

        <SlideCard
          direction="right"
          className="m-auto mb-10 w-full md:absolute md:w-1/2  right-[calc(0%)] lg:top-[28rem] top-[33rem]"
          images={[gcloud, spanner]} // add pytorch, and react native 
          title="Google Step Software Engineering Intern"logos
          subtitle="Seattle, Washington (June 2025 - September 2025) "
          icon = {google}
          iconLink = "https://careers.google.com/students/"
        >
          Project aimed to enhance the reliability of the CI system and improve
          developer experience by proactively preventing the introduction of new
          test flakes in Spanner DB codebase. Leverages Machine Learning (ML) to
          analyze historical data and predict which tests are most likely to be
          affected by code changes. Minimum goal is to determine if an AI based
          approach is an effective way to address the problem at hand.
        </SlideCard>
      </div>

      <div className="fade  relative w-full">
        <div className="bold text-4xl text-center my-4">Projects</div>
        <div className="hidden md:block m-auto w-0 h-[48rem] lg:h-[43rem] border-l-2 border-gray-500 " />

        <SlideCard
          ghlink="https://github.com/aymann121/aymann"
          direction="left"
          className="m-auto mb-10 w-full md:absolute md:w-1/2 left-[calc(0%)] bottom-60"
          images={[]}
          title="This Website ✦"
        >
          <div>
            <ul className="list-disc ml-2 space-y-2 mb-2">
              <li>
                I built it to learn more about web development and have a plact
                to display my experience.
              </li>
              <li>
                I used Next.js and TailwindCSS to develop the front end and used
                Firebase and Node.js when making the backend.
              </li>
              <li>
                Small projects include a few games, a chat app, an
                authentication system, a server to keep track of leaderboards, a
                working blog that I can post to from the website, and a bell
                schedule app that I used when I was in high school .
              </li>
            </ul>
          </div>
          <div className=" flex justify-center">
            <div>
              <div className="text-center">Frontend</div>
              <div className="flex space-x-5 ">
                <div className="text-center">
                  <Image alt = "react" src={react} height={50} />
                  React
                </div>
                <div className="text-center ">
                  <Image alt = "tailwind" src={tailwind} height={50} />
                  Tailwind
                </div>
              </div>
            </div>
            <div className="mx-3 mb-auto mt-3 flex-grow min-w-[1rem] max-w-[10rem] border-b-2 border-green-500 border-dashed" />
            <div>
              <div className="text-center">Backend</div>
              <div className="flex space-x-5">
                <div className="text-center ">
                  <Image alt = "firebase" src={firebase} height={50} />
                  Firebase
                </div>
                <div className="text-center">
                  <Image alt = "node" src={node} height={50} />
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

        <SlideCard
          ghlink="https://github.com/aymann121/WARP"
          direction="right"
          className="m-auto mb-10 w-full md:absolute md:w-1/2  right-[calc(0%)] bottom-40"
          images={[java, junit, git]}
          title="WARP Project "
        >
          Project Completed at the University of Iowa (during highschool). Code
          forked from Steve Goddard's base. The WARP sensor network research
          project. Much of the class was focused on developing skill in Java,
          Git Collaboration, JUnit Testing, Code Refactoring, UML Diagrams, and
          the software construction life Cycle (Sprint Model). Also developed
          greater understanding of WARP module relationships and interactions.
        </SlideCard>

        {/* <SlideCard
          direction="left"
          className="m-auto mb-10 w-full md:absolute md:w-1/2  left-[calc(0%)] bottom-10"
          images={[git, python, spotify]}
          title="Spotify Web Scraper (⚠️ In Progress) "
        >
          Using Spotify api to scrape playlists and make equivalents on youtube
          music. (For downloadability and becuase you can use YT Music for
          free.)
        </SlideCard> */}

        {/* <SlideCard
          direction="left"
          className="m-auto mb-10 w-full md:absolute md:w-1/2  left-[calc(0%)] bottom-10"
          // images={[git, python, spotify]}
          title="Biometrics Aggregation and Analysis Website (⚠️ In Progress) "
        >
          Create website used to aggregate and Analyze health data from
          Biometric devices and Activitiy apps like strava. Hope to be
          compatable with brands like Apple, Garmin, Coros, and Fitbit.
        </SlideCard> */}
      </div>
    </main>
  );
}
