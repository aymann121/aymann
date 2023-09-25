import React, { useState, useEffect } from 'react';

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
            // const response = await fetch('https://server.icybroom.repl.co/scores', {mode: "no-cors"});
            // const data = await response.json();
            fetch("https://server.icybroom.repl.co/snake/scores",  )
            .then(x => x.json())
            .then(x => {
                 console.log(x);
                 setLeaderboard(x);
                // highScoreOl.innerHTML = "";
                // x.forEach(s => {
                //     let li = document.createElement("li");
                //     li.innerHTML = `${s.name}: ${s.score}`
                //     highScoreOl.appendChild(li);
                // })
                setLoading(false);
            });
        }, []);

    return (
        <div className="leaderboard">
            <h1>Leaderboard</h1>
            {loading ? <h2>Loading...</h2> :
                        leaderboard.map((player, index) => (
                            <div key={index}>
                                {index+1 + '. '+ player.name + " "+ player.score}
                            </div>
                        ))
            }
        </div>
    )
}