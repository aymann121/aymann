"use client"
import React, { useEffect, useRef, useState } from "react";

const settings = {
    width: 600,
    height: 600,
    columns: 50,
    rows: 50,
    speed: 10
}

export default function GameOfLife(props) {
    const canvasRef = useRef();
    const [isRunning, setIsRunning] = useState(false);
    const [speed, setSpeed] = useState(10);
    const [brushSize, setBrushSize] = useState(1);
    const [generation, setGeneration] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);
    
    useEffect(() => {
        const settings = {
            width: props.width || 600,
            height: props.height || 600,
            columns: props.columns || 50,
            rows: props.rows || 50,
            speed: props.speed || 10,
        }
        
        const canvas = canvasRef.current;
        canvas.width = settings.width;
        canvas.height = settings.height;
        
        const game = new GameOfLifeEngine(
            settings.rows,
            settings.columns,
            settings.width,
            settings.height,
            canvas,
            setIsRunning,
            setGeneration,
            brushSize
        );
        
        return () => {
            game.cleanup();
        };
    }, [props.width, props.height, props.columns, props.rows, props.speed]);

    const handleSpeedChange = (e) => {
        const newSpeed = parseInt(e.target.value);
        setSpeed(newSpeed);
        if (window.gameInstance) {
            window.gameInstance.setSpeed(newSpeed);
        }
    };

    const handleBrushSizeChange = (e) => {
        const newBrushSize = parseInt(e.target.value);
        setBrushSize(newBrushSize);
        if (window.gameInstance) {
            window.gameInstance.setBrushSize(newBrushSize);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-2 pt-4 mt-20">
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-4xl w-full border border-gray-300">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
                    Conway's Game of Life
                </h1>
                
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Canvas Container */}
                    <div className="flex-1">
                        <div className="relative">
                            <canvas 
                                ref={canvasRef}
                                className="border-2 border-gray-400 rounded-lg cursor-crosshair"
                                style={{ maxWidth: '100%', height: 'auto' }}
                            />
                            <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                                Generation: {generation}
                            </div>
                        </div>
                    </div>
                    
                    {/* Controls Panel */}
                    <div className="lg:w-72 space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Controls</h3>
                            
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        if (window.gameInstance) {
                                            window.gameInstance.toggleRunning();
                                            setIsRunning(!isRunning);
                                        }
                                    }}
                                    className="w-full py-2 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-100 transition-colors"
                                >
                                    {isRunning ? 'Pause' : 'Start'}
                                </button>
                                
                                <button
                                    onClick={() => {
                                        if (window.gameInstance) {
                                            window.gameInstance.reset();
                                            setGeneration(0);
                                            setIsRunning(false);
                                        }
                                    }}
                                    className="w-full py-2 px-4 border border-gray-300 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Settings</h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Speed: {speed} FPS
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="30"
                                        value={speed}
                                        onChange={handleSpeedChange}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Brush Size: {brushSize}
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={brushSize}
                                        onChange={handleBrushSizeChange}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className=" rounded-lg p-3">
                            <h3 className="text-lg font-semibold  mb-2">How to Play</h3>
                            <ul className="text-sm = space-y-1">
                                <li>• Left click or drag to create cells</li>
                                <li>• Right click or drag to delete cells</li>
                                <li>• Adjust brush size for larger patterns</li>
                                <li>• Press Start to begin simulation</li>
                                <li>• Adjust speed with the slider</li>
                                <li>• Use Reset to start over</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

class GameOfLifeEngine {
    constructor(rows, columns, width, height, canvas, setIsRunning, setGeneration, brushSize) {
        this.rows = rows;
        this.columns = columns;
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.setIsRunning = setIsRunning;
        this.setGeneration = setGeneration;
        
        this.board = this.createBoard();
        this.running = false;
        this.intervalId = null;
        this.speed = 10;
        this.generation = 0;
        this.isDrawing = false;
        this.lastDrawnCell = null;
        this.brushSize = brushSize || 1;
        this.isCreating = true; // Track if we're creating or deleting
        
        this.setupEventListeners();
        this.drawBoard();
        
        window.gameInstance = this;
    }
    
    setBrushSize(size) {
        this.brushSize = size;
    }
    
    setupEventListeners() {
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.isDrawing = true;
            const cell = this.getCellFromMouse(e);
            if (cell) {
                // Left click creates, right click deletes
                this.isCreating = e.button === 0; // 0 = left click, 2 = right click
            }
            this.handleMouseEvent(e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing) {
                this.handleMouseEvent(e);
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            this.isDrawing = false;
            this.lastDrawnCell = null;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDrawing = false;
            this.lastDrawnCell = null;
        });
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Touch support for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDrawing = true;
            const cell = this.getCellFromTouch(e);
            if (cell) {
                this.isCreating = this.board[cell.row][cell.col] === 0;
            }
            this.handleTouchEvent(e);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDrawing) {
                this.handleTouchEvent(e);
            }
        });
        
        this.canvas.addEventListener('touchend', () => {
            this.isDrawing = false;
            this.lastDrawnCell = null;
        });
    }
    
    getCellFromMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        return this.getCellFromCoords(x, y);
    }
    
    getCellFromTouch(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
        return this.getCellFromCoords(x, y);
    }
    
    getCellFromCoords(x, y) {
        const cellWidth = this.width / this.columns;
        const cellHeight = this.height / this.rows;
        const col = Math.floor(x / cellWidth);
        const row = Math.floor(y / cellHeight);
        
        if (col >= 0 && col < this.columns && row >= 0 && row < this.rows) {
            return { row, col };
        }
        return null;
    }
    
    handleMouseEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        this.applyBrush(x, y);
    }
    
    handleTouchEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
        this.applyBrush(x, y);
    }
    
    applyBrush(x, y) {
        const cellWidth = this.width / this.columns;
        const cellHeight = this.height / this.rows;
        const centerCol = Math.floor(x / cellWidth);
        const centerRow = Math.floor(y / cellHeight);
        
        // Apply brush in a square pattern around the center
        // For odd brush sizes: centered on the cell
        // For even brush sizes: offset to create proper square
        const offset = this.brushSize % 2 === 0 ? 0.5 : 0;
        const halfBrush = Math.floor(this.brushSize / 2);
        
        for (let i = -halfBrush; i < halfBrush + (this.brushSize % 2); i++) {
            for (let j = -halfBrush; j < halfBrush + (this.brushSize % 2); j++) {
                const row = centerRow + i;
                const col = centerCol + j;
                
                if (row >= 0 && row < this.rows && col >= 0 && col < this.columns) {
                    // Create or delete cells based on mouse button
                    if (this.isCreating) {
                        this.board[row][col] = 1;
                    } else {
                        this.board[row][col] = 0;
                    }
                }
            }
        }
        
        this.drawBoard();
    }
    
    setSpeed(speed) {
        this.speed = speed;
        if (this.running) {
            this.stop();
            this.start();
        }
    }
    
    toggleRunning() {
        if (this.running) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    start() {
        if (!this.running) {
            this.running = true;
            this.intervalId = setInterval(() => {
                this.update();
            }, 1000 / this.speed);
        }
    }
    
    stop() {
        this.running = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    reset() {
        this.stop();
        this.board = this.createBoard();
        this.generation = 0;
        this.setGeneration(0);
        this.drawBoard();
    }
    
    clear() {
        this.stop();
        this.board = this.createBoard();
        this.generation = 0;
        this.setGeneration(0);
        this.drawBoard();
    }
    
    createBoard() {
        const board = [];
        for (let i = 0; i < this.rows; i++) {
            board[i] = [];
            for (let j = 0; j < this.columns; j++) {
                board[i][j] = 0;
            }
        }
        return board;
    }
    
    drawBoard() {
        const cellWidth = this.width / this.columns;
        const cellHeight = this.height / this.rows;
        
        // Clear canvas with white background
        this.context.fillStyle = '#ffffff';
        this.context.fillRect(0, 0, this.width, this.height);
        
        // Draw grid
        this.context.strokeStyle = '#e5e7eb';
        this.context.lineWidth = 0.5;
        
        for (let i = 0; i <= this.columns; i++) {
            this.context.beginPath();
            this.context.moveTo(i * cellWidth, 0);
            this.context.lineTo(i * cellWidth, this.height);
            this.context.stroke();
        }
        
        for (let i = 0; i <= this.rows; i++) {
            this.context.beginPath();
            this.context.moveTo(0, i * cellHeight);
            this.context.lineTo(this.width, i * cellHeight);
            this.context.stroke();
        }
        
        // Draw cells
        this.context.fillStyle = '#1f2937';
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (this.board[i][j] === 1) {
                    this.context.fillRect(
                        j * cellWidth + 1,
                        i * cellHeight + 1,
                        cellWidth - 2,
                        cellHeight - 2
                    );
                }
            }
        }
    }
    
    update() {
        this.refreshBoard();
        this.generation++;
        this.setGeneration(this.generation);
        this.drawBoard();
    }
    
    refreshBoard() {
        const newBoard = this.createBoard();
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                const neighbors = this.getNeighbors(i, j);
                
                if (this.board[i][j] === 1) {
                    if (neighbors === 2 || neighbors === 3) {
                        newBoard[i][j] = 1;
                    }
                } else {
                    if (neighbors === 3) {
                        newBoard[i][j] = 1;
                    }
                }
            }
        }
        
        this.board = newBoard;
    }
    
    getNeighbors(row, col) {
        let neighbors = 0;
        
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const newRow = row + i;
                const newCol = col + j;
                
                if (newRow >= 0 && newRow < this.rows && 
                    newCol >= 0 && newCol < this.columns) {
                    if (this.board[newRow][newCol] === 1) {
                        neighbors++;
                    }
                }
            }
        }
        
        return neighbors;
    }
    
    cleanup() {
        this.stop();
        window.gameInstance = null;
    }
}