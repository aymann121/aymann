"use client"
import React, { useEffect, useRef } from "react";

const settings = {
    width : 400,
    height : 400,
    columns: 21,
    rows: 21,
    speed: 10
}


export default function GameOfLife(props){
    let canva = useRef();
    
    useEffect(()=>{
        let settings = {
            width : props.width || 1000,
            height : props.height || 500,
            columns: props.columns || 100,
            rows: props.rows || 50,
            speed: props.speed || 10,
        }
        const canvas = canva.current;
        canvas.width = settings.width
        let extraHeight = 60;
        canvas.height = settings.height + extraHeight;
        let context = canvas.getContext('2d');
        new GOL(settings.rows,settings.columns,settings.width,settings.height,canvas,context, extraHeight)
    })
    

    return (
           <div className = "text-center mt-9">
               <canvas className = "m-auto" ref={canva} />
               How to play:
                <br/>
                1. Click on the cells to make them alive
                <br/>
                2. Click on the start button to start the game
                <br/>
                3. Click on the stop button to stop the game
           </div>
       )
}



class GOL{
    running = false;
    darkmode;
    intervalId;
    
    //Buttons
    startButton;
    darkModeButton;


    constructor(rows, columns,width,height,canvas,context, extraHeight){
        this.rows = rows;
        this.columns = columns;
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.context = context;
        this.extraHeight = extraHeight;
        this.board = this.createBoard();
        this.darkmode = true;
        this.mouse = {x: 0, y: 0};
        this.mouseMove = document.addEventListener("mousemove", e => {
            this.mouse = this.getMousePos(canvas, e);
        });
        this.drawBoard();
        document.onmousemove = (event) =>{
            const isStartButton = context.isPointInPath(this.startButton, event.offsetX, event.offsetY);
            if (isStartButton ){
                document.body.style.cursor = 'pointer';
            }else{
                document.body.style.cursor = 'default';
            }
        }
        document.onclick = (event) => {
            const isStartButton = context.isPointInPath(this.startButton, event.offsetX, event.offsetY);
            if (isStartButton){ this.start(); this.drawBoard()}
            if(this.mousey < this.height){
              this.toggleAlive(this.mouse.x,this.mouse.y)
              this.drawBoard()
            }
        }
        document.onmousedown = (event) => {
            if(this.mouse.y < this.height){
              this.toggleAlive(this.mouse.x,this.mouse.y)
              this.drawBoard()
            }
        }
        document.onkeydown = (e) => {
            e.preventDefault();
            if(e.key == 'r' || e.key == 'R'){this.reset();}
        }
    }
    toggleAlive(x,y){
        if(this.running == true){this.start()}
        let pieceWidth = this.width / this.columns
        let pieceHeight = this.height / this.rows
        let i = Math.floor(x / pieceWidth)
        let j = Math.floor(y / pieceHeight)
        if(i >= 0 && i < this.columns && j >= 0 && j < this.rows){
            if(this.board[j][i] == 1){
                this.board[j][i] = 0
            }else{
                this.board[j][i] = 1
            }
        }
    }
    getMousePos(canvas, evt) {
        let rect = this.canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
    }
    fill(r,g,b) {
        this.context.fillStyle = 'rgb('+r+','+g+','+b+')'
    }
    fillRect(x,y,w,h){
        this.context.fillRect(x,y,w,h)
    }
    fillText(text,x,y,size){
        this.context.font = `${size}px Arial`;
        this.context.fillText(text,x,y);
    }
    fillLine(x1,y1,x2,y2){
        this.context.beginPath();
        this.context.moveTo(x1,y1);
        this.context.lineTo(x2,y2);
        this.context.stroke();
    }
    start(){
    if(this.running == false){
        this.running = true;
        window.clearInterval(this.intervalId)
        this.intervalId = window.setInterval(()=>{
            this.drawBoard()
            this.update()
        },1000/settings.speed)
    }else{
        this.running = false;
        window.clearInterval(this.intervalId)
        // this.drawBoard()
        }
    }
    reset(){
        this.board = this.createBoard();
        this.drawBoard();
        this.start()
    }
    createBoard(){
        let board = []
        for(let i = 0; i < this.rows; i++){
            board[i] = []
            for(let j = 0; j < this.columns; j++){
                board[i][j] = 0
            }
        }
        return board
    }
    drawBoard(){
        let pieceWidth = this.width / this.columns
        let pieceHeight = this.height / this.rows
        
        {
            //empty the board
            if(this.darkmode){this.fill(0,0,0)}
            else{this.fill(255,255,255)}
            this.fillRect(0,0,this.width,this.height + this.extraHeight)
        }

        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < this.columns; j++){
                if(this.board[i][j] == 1){
                    if(this.darkmode){ this.fill(255,255,255) }
                    else{ this.fill(0,0,0) }
                    this.fillRect(j*pieceWidth,i*pieceHeight,pieceWidth,pieceHeight)
                }
            }
        }
        
        //------------------buttons omg so many magic numbers
        if(this.darkmode){
            this.context.strokeStyle = 'rgb(255,255,255)';
        }
        if(this.darkmode) {this.fill(255,255,255)}
        else{this.fill(0,0,0)}
        let textSize = 40;
        this.startButton = new Path2D();
        this.startButton.rect(0, this.height + 10, this.width, 40)
        if (this.running == true){
            this.fillText('Stop', this.width/2 - textSize, this.height +42, textSize)
        }else{
            this.fillText('Start',this.width/2 - textSize, this.height + 42,textSize)
        }
        this.context.stroke(this.startButton);

        // --------------------------------------


        if(this.darkmode){this.context.strokeStyle = 'rgb(75,75,75)'; this.fill(255,255,255)}
        else{this.context.strokeStyle = 'rgb(0,0,0)'; this.fill(0,0,0)}
        
    }
    refreshBoard(){
      //create the next board for conways game of life from the current board
      let newBoard = this.board
      for(let i = 0; i < this.rows; i++){
        for(let j = 0; j < this.columns; j++){
          let neighbors = this.getNeighbors(i,j)
          if(this.board[i][j] == 1){
            if(neighbors < 2 || neighbors > 3){
              newBoard[i][j] = 0
            }
          }else{
            if(neighbors == 3){
              newBoard[i][j] = 1
            }
          }
        }
      }
      this.board = newBoard
    }
    getNeighbors(row,column){
      let neighbors = 0
      for(let i = -1; i < 2; i++){
        for(let j = -1; j < 2; j++){
          if(i == 0 && j == 0){
            continue
          }
          if(row + i < 0 || row + i >= this.rows || column + j < 0 || column + j >= this.columns){
            continue
          }
          if(this.board[row + i][column + j] == 1){
            neighbors++
          }
        }
      }
      return neighbors
    }
    update(){
      this.refreshBoard()
      this.drawBoard()
    }
}