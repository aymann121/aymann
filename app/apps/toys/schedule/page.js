"use client"
import data from './schedules.json';
//import state hook
import { useEffect, useState } from 'react';


export default function Schedule() {
    const [dropDown, setDropDown] = useState("hidden");
    const getScheduleDay = () =>{
        //if the day is 2/3/2023 then return 2H Delay
        const date = new Date()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const year = date.getFullYear()
        // console.log(month, day, year)
        if(month === 2 && day === 3 && year === 2023){
            return "2H Delay"
        }
        else if(month === 3 && day === 31 && year === 2023){
            return "2H Early Dismissal"
        }
        const weekDay = date.getDay()
        //if weekday is thursday then return Thursday else return normal
        if(weekDay === 4){
            return "Thursday"
        }else{
            return "Normal"
        }
    } 
    const [scheduleDay, setDay] = useState(getScheduleDay())
    const [time , setTime] = useState("12:00:00 AM")
    useEffect(() => {

        setInterval(() => {
            setTime(new Date().toLocaleTimeString())
        }, 1000)
        return () => {
            clearInterval()
        }
    }, [])
    let days = ["Normal", "Thursday", "2H Delay", "2H Early Dismissal"]
    const toggleDay = () =>{
        let index = days.indexOf(scheduleDay)
        if(index === days.length - 1){
            index = 0
        }else{
            index++
        }
        setDay(days[index])
    }
    const timeRemaining = (startingTime, endingTime, isConservative) => {
        //find the differenct between time and ending time, use the time in the state and account for the AM and PM
        //if the time is after or equal to the ending time then return "Done"
        //if the time is before the ending time then return the time remaining
        //return the time remaining in minutes, if it's less than 1 minute than return the seconds remaining
        //if the time is before the starting time, then return "Not Started"
        const SECONDS_IN_HOUR = 3600
        let timeArr = time.split(":")
        let endingTimeArr = endingTime.split(":")
        let startingTimeArr = startingTime.split(":")
        if(timeArr[2].includes("PM") && timeArr[0] != 12){
            timeArr[0] = parseInt(timeArr[0]) + 12

        } 
        if(timeArr[2].includes("AM") && timeArr[0] == 12){
            timeArr[0] = 0
        }
        if(endingTimeArr[2].includes("PM") && endingTimeArr[0] != 12){
            endingTimeArr[0] = parseInt(endingTimeArr[0]) + 12
        }
        if(endingTimeArr[2].includes("AM") && endingTimeArr[0] == 12){
            endingTimeArr[0] = 0
        }
        if(startingTimeArr[2].includes("PM") && startingTimeArr[0] != 12){
            startingTimeArr[0] = parseInt(startingTimeArr[0]) + 12
        }
        if(startingTimeArr[2].includes("AM") && startingTimeArr[0] == 12){
            startingTimeArr[0] = 0
        }
        let timeInSeconds = parseInt(timeArr[0])*3600 + parseInt(timeArr[1])*60 + parseInt(timeArr[2])
        let endingTimeInSeconds = parseInt(endingTimeArr[0])*3600 + parseInt(endingTimeArr[1])*60 + parseInt(endingTimeArr[2])
        let startingTimeInSeconds = parseInt(startingTimeArr[0])*3600 + parseInt(startingTimeArr[1])*60 + parseInt(startingTimeArr[2])
        if(timeInSeconds > endingTimeInSeconds){
            return "Done"
        }else if(timeInSeconds < startingTimeInSeconds && isConservative){
            return "Not Started"
        }else{
            let timeLeft = endingTimeInSeconds - timeInSeconds
            if(timeLeft < 60 && timeLeft > 0){
                return timeLeft + " Seconds"
            }else if (Math.abs(timeLeft) > SECONDS_IN_HOUR){
                let minutes = Math.abs(Math.floor((timeLeft%SECONDS_IN_HOUR)/60)) // get the minutes in the form of 2 digits (ex: 5 -> 05) and 0 -> 00
                if(minutes < 10) minutes = "0" + minutes
                return Math.floor(timeLeft/SECONDS_IN_HOUR) + ":" + minutes + " Hours"
            }
            else{
                return Math.floor(timeLeft/60) + " Minutes"
            }
        }

      }
        let periods = []
        let keyNumber = 0
        const createSchedule = (scheduleData, level) =>{
            for (const period in scheduleData) {
                let arr = scheduleData[period]
                let beginningTime = arr[0].split(" ") // split the time and the AM/PM
                let endingTime = arr[1].split(" ") // split the time and the AM/PM
                let timeLeft = timeRemaining(beginningTime[0]+':00 '+beginningTime[1],endingTime[0]+':00 '+endingTime[1], true)
                let totalTimeLeft = timeRemaining(beginningTime[0]+':00 '+beginningTime[1],endingTime[0]+':00 '+endingTime[1], false)
                let eachPeriod;
                const pushPeriod = () => {
                    if(timeLeft === "Done"){periods.push(<div key = {keyNumber++} className = {"pr-5 rounded-md "+ (level == 0 ? "bg-green-300":"bg-green-500")} >{eachPeriod}</div>)}
                    else if(timeLeft === "Not Started" ){periods.push(<div key = {keyNumber++} className = {"rounded-md " + (level == 0 ? "bg-gray-400":"bg-gray-500")} >{eachPeriod}</div>)}
                    else{periods.push(<div key = {keyNumber++} className = {"rounded-md "+ (level == 0 ? "bg-yellow-200":"bg-yellow-500")} >{eachPeriod}</div>)}
                }
                if(!arr[2]){
                    eachPeriod = (
                    <div key = {keyNumber++} className = " flex justify-between mb-2  sm:pl-3 sm:pr-3">
                        <div key = {keyNumber++} className = "">{period}</div>
                        <div key = {keyNumber++} className = "">{arr[0] +" - "+arr[1]}</div>
                        <div key = {keyNumber++} className = "">{totalTimeLeft}</div>
                    </div>)}
                else{
                    const [open, setOpen] = useState(false)
                    eachPeriod = (<div onClick = {()=>{setOpen(!open);}} key = {keyNumber++} className = "group hover: cursor-pointer flex justify-between mb-2  sm:pl-3 sm:pr-3">
                        <div className = "flex">
                            <div key = {keyNumber++} className = "mr-2">{period}</div>
                            <div className = {(open ? "rotate-90":"group-hover:rotate-90") + " hidden sm:block origin-center transition duration-300 ease-in-out "} >▷</div>
                        </div>
                        <div key = {keyNumber++} className = "sm:mr-3">{arr[0] +" - "+arr[1]}</div>
                        <div key = {keyNumber++} className = "">{totalTimeLeft}</div>
                    </div>)
                    pushPeriod()
                    if(open){
                        for(const lunch in arr[2]){
                            createSchedule(arr[2][lunch], level + 1)
                        }
                    }
                    continue;
                }
                pushPeriod()
        }
            // console.log(arr[3]+':00 '+arr[4])
        }
        createSchedule(data[scheduleDay], 0)

    return (
        
        <div >

            <div className = "text-center mt-10"> This is a scheduling app I built to keep track of my schedule when I was in high school. </div>
            <div  className = "bg-gray-200 p-5  rounded-lg max-w-2xl m-auto mt-10 text-xl">
                    <div className = "pt-0 text-center text-2xl mb-4">
                        ICCSD School Schedule
                    </div>
                <div className='flex justify-between'>
                    <div className = "flex justify-center">
                            
                        {scheduleDay}
                        {/* <label className=" ml-3 inline-flex relative items-center mb-4 cursor-pointer">
                            <input  type="checkbox" value="" className="sr-only peer" onChange = {toggleDay} checked = {scheduleDay == 'Thursday'}/>
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label> */}
                        <div className = "ml-0 sm:ml-2 mb-1"> 
                        
                            <button onClick = {()=>{setDropDown(dropDown == "" ? "hidden": "")}} id="dropdownDefaultButton" className=" h-8   dark:text-white  dark:bg-gray-200 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none dark:focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center bg-gray-500 hover:bg-blue-700 focus:ring-blue-800" type="button">Days <svg className="w-4 h-4 ml-2" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></button>

                            <div id="dropdown" className={dropDown+" z-10 absolute bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"}>
                                <ul className="cursor-pointer py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                                
                                {days.map((day) =>{
                                    return <li key = {day}>
                                        <a onClick = {()=>{setDay(day); setDropDown(dropDown == "" ? "hidden": "");}} className="   px-4  hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{day}</a>
                                    </li>})}
                                
                                </ul>
                            </div>
                        </div>
                        {/* <button type="button" onClick = { toggleDay }className="sm:hidden sm:ml-2 w-14 text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 h-8 text-center text-justify-center mb-2"><div className = "relative  bottom-1 right-3" >Toggle</div></button> */}
                    </div>
                    <div className = "sm:mr-12 "> {time} </div>
                    <div>
                        Time Left: 
                    </div>
                </div>
                {periods}
            </div>
        </div>
    );
}