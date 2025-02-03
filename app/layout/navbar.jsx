"use client"
import Image from 'next/image'
// import icybroom from './icybroom.png'
import Link from 'next/link'
import {UserAuth} from '../context/AuthContext'
import { useState } from 'react'



const pages = [
    // {
    //     text: 'Home',
    //     path: '/'
    // },
    {
        text: "Resume",
        path: '/Resume.pdf',
        target: '_blank'
    },
    {
        text: 'Contact',
        path: 'mailto:noreldaim.ayman@gmail.com'
    },
    {
        text: 'Old Apps',
        path: '/apps'
    },
    
    // {
    //     text: 'Superchat',
    //     path: '/superchat'
    // },
    // {
    //     text: 'Blog',
    //     path: '/blog'
    // },
    // {
    //     text: 'About',
    //     path: '/about'
    // },
    // {
    //     text: 'Schedule',
    //     path: '/schedule'
    // }

]

export default function Navbar() {

    // const [drawerOpen, setDrawerOpen] = React.useState(false);
    // const router = useRouter()
    const {user, logOut} = UserAuth()
    const handleSignOut = async () =>{
        try{
            await logOut();
    } catch(err){
            console.log(err)
        }
    }
    
    // let [visible,setVisible] = useState(false);
    let styles = ""
    // if(visible) {styles = ""}
    // else { styles = "hidden"}
    return (
        <nav className=" rounded-xl  border-gray-200 px-2 sm:px-4 py-5  dark:bg-gray-900">
            <div className="container flex flex-wrap items-center justify-between mx-auto">
            <Link href="/" className="flex items-center">
                {/* <Image priority = {true} src={icybroom} className="h-12 w-12 mr-3 " alt="Flowbite Logo" /> */}
                <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white ml-3 md:ml-6">  Ayman Noreldaim</span>
            </Link>
            {/* <button onClick = {()=>{setVisible(!visible)}} data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
                <span className="sr-only">Open main menu</span>
                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
            </button> */}
                <div className= {styles +" "}  id="navbar-default">
                    <ul className="flex  h-auto w-auto flex-row space-x-8 mr-5 text-sm font-medium border-0  dark:bg-gray-900 dark:border-gray-700">
                        {pages.map((page, index) => {
                            return (
                                <li key = {index}>
                                    <Link href={page.path} target = {page?.target}className=" text-gray-700 rounded hover:bg-gray-100 hover:bg-transparent border-0 hover:text-blue-700 md:p-0   dark:hover:bg-gray-700 dark:hover:text-white dark:hover:bg-transparent">{page.text}</Link>
                                </li>
                            )
                        })}
                    </ul>
                    {/* <Link href = {user ? "/profile" : "/login"}>
                        {(user && user.photoURL) ? 
                        <Image alt = "this failed to load" src = {user.photoURL } className = "mt-2 w-8 h-8 rounded-full" width = {60} height = {60}/>
                        :<svg className="text-white w-8 h-8 mt-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path></svg>
                        }
                    </Link> */}
                </div>
            </div>
        </nav>
    )
}