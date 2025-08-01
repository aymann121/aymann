import c4Icon from "./appIcons/connect4.png"
import golIcon from "./appIcons/GameOfLife.png"
import ticTacToe from "./appIcons/TicTacToe.png"
import snakeIcon from "./appIcons/Snake.png"
import chatIcon from "./appIcons/chat.png"
import calendarIcon from "./appIcons/calendar.png"
import dad from "./appIcons/dad.webp"
import Image from 'next/image'
import Link from 'next/link';
import blog from "./appIcons/blog.webp"
import login from "./appIcons/login.png"
import markovIcon from "./appIcons/Markov.png"

let games = [
    // {
    //     image: blog,
    //     title: "Blog",
    //     link: '/apps/blog'
    // },
    // {
    //     image: login,
    //     title: "Login / Profile",
    //     link: '/apps/login'
    // },
    {
        image: c4Icon,
        title: "Connect 4",
        link: './toys/connect4'
    },{
        image: snakeIcon,
        title: "Snake",
        link: './toys/snake'
    },
    // {
    //     image: golIcon,
    //     title: "Conway's Game of Life",
    //     link: '/games/gameOfLife'
    // },
    {
        image: ticTacToe,
        title: "Tic Tac Toe",
        link: './toys/tictactoe'
    },
    // {
    //     image: chatIcon,
    //     title: "Chat",
    //     link: '/apps/superchat'
    // },
    {
        image: calendarIcon,
        title: "Schedule",
        link: './toys/schedule'
    },
    {
        image: dad,
        title: "Dad Jokes",
        link: './toys/dadJokes'
    }
]
const Game = (props) => {
    let width = 180
    return (
        <div className = " mr-10 mb-2 mt-30px rounded-lg bg-color-black hover:bg-gray-500 transition duration-500 ease-in-out">
            <Link className = "gameIcon" href = {props.href} >
                <Image className = "mb-2" src = {props.image} alt = "This image couldnt load ¯\_(ツ)_/¯" width = {width} height = "auto" />
                <h6 className = "rounded-xl bg-blue-400 text-center" >{props.title}</h6>
            </Link>
        </div> 
    );
}
export default function Games () {
    let e = games.map((g,i) =>{
        return <Game href = {g.link} image = {g.image} title = {g.title} key = {i} />
    })
    return (
        <div className = "flex justify-center mt-20 flex-wrap">
            {e}
         </div> 
    )

}