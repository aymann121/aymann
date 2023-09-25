"use client"
import React, { useState, useEffect } from 'react';

export default function Visitors() {
    const [visitors, setVisitors] = useState('loading...');

    useEffect(() => {
            fetch("https://server.icybroom.repl.co/visitors")
            .then(x => x.json())
            .then(x => {
                //  console.log(x);
                 setVisitors(x.visitors);
            });
        }, []);

    return (
        <div className="text-center mt-5 ">
            <h1>Visits:</h1>
            <div className = "text font-bold">{visitors}</div>
            <h6 className = "text-gray-600">(everytime you come back to the home page it goes up one)</h6>
            other website (ICCSD): <a className = "underline" href="https://iccsd.vercel.app/">iccsd.vercel.app</a>
        </div>
    )
}