import './bingoGrid.css'
import React, { useEffect, useState } from 'react'
import socket from '../../utils/socket'
import {checkForWin} from '../../utils/winCheck'
import { triggerPoofOnCondition } from '../../utils/confetti';

export default function BingoGrid(){
    const  [grid, setGrid] = useState([])
    const [players, setPlayers] = useState({})
    const [currentTurn, setCurrentTurn] = useState()
    const [completedLines, setCompletedLines] = useState({})
    const [completed, setCompleted] = useState(false)
    const [startButton, setStartButton] = useState(true)
    const [numbersSelected, setNumbersSelected] = useState([])
    const [winnerName, setWinnerName] = useState([])
    const [gameCount, setGameCount] = useState(0)
    const [disableGrid, setDisableGrid] = useState(false)
    const [confettiVisible, setConfettiVisible] = useState(false)
    const [colorCodeMap, setColorCodeMap] = useState({})
    const [numberPlayerMap, setNumberPlayerMap] = useState({})

    function handleNumberSelect(number){
        socket.emit('numberSelected', number, currentTurn)
    }

    function handleStart(){
        socket.emit('startClicked')
    }

    useEffect(()=>{
        if(numbersSelected.length!==0){
            handleWinCheck()
        }
    },[numbersSelected])

    useEffect(()=>{
            if (winnerName.length!==0){
                setConfettiVisible(true)
            }
            console.log(confettiVisible)
            triggerPoofOnCondition(confettiVisible)
    },[winnerName, confettiVisible])

    function handleWinCheck() {
        console.log(grid, numbersSelected) 
        const { completed, completedLines } = checkForWin(grid, numbersSelected, gameCount);
    
        console.log("Completed: ", completed);
        console.log("Completed Lines: ", completedLines);

        if (completed) {
            setCompleted(true);
            setCompletedLines(completedLines);
        }
    }
    
    useEffect(() => {
        if (completed) {
            console.log(players[socket.id]);
            socket.emit('winnerFound', players[socket.id]);
        }
    }, [completed]);

    function handleRestart(){
        socket.emit('restartGame')
        
    }

    useEffect(()=>{
        socket.connect()

        socket.on('connect', () => {
            console.log("Connected to server with id:", socket.id);
        });
        socket.on('updateGrid', (number)=>{
            setNumbersSelected(prevNumbersSelected => [...prevNumbersSelected, number]);
        })

        socket.on('removeStart',()=>{
            setStartButton(false)
        })

        socket.on('colorCode', (colorCodePlayerID)=>{
            console.log(colorCodePlayerID)
            setColorCodeMap(colorCodePlayerID)
        })

        socket.on('usernameMap', (usernameMap)=>{
            setPlayers(usernameMap)
        })

        socket.on('updateNumberPlayerMap', (updatedMap) => {
            setNumberPlayerMap(updatedMap);
        });

        socket.on('init', (init)=>{
            console.log(init.grid, init.currentTurn)
            setGrid(init.grid)
            setCurrentTurn(init.currentTurn)
            socket.emit('removeInterval')
        })
        socket.on('updateTurn', (CurrentTurnIO)=>{
            setCurrentTurn(CurrentTurnIO)
        })
        

        socket.on('winnerName', (name)=>{
            setWinnerName((prevName)=> [...prevName, name])
            console.log(name)
            setDisableGrid(true)
        })

        socket.on('restartedGame',({grid, currentTurn})=>{
            console.log(grid)
            setGrid(grid)
            setWinnerName([])
            setNumberPlayerMap({})
            setCurrentTurn(currentTurn)
            setNumbersSelected([])
            setCompleted(false)
            setCompletedLines({})
            setDisableGrid(false)
            setConfettiVisible(false)
            setGameCount((prevCount)=>prevCount+1)
            console.log(gameCount)
            setConfettiVisible(false)
            
        })
        
        return () => socket.disconnect()
    },[])
    return(
        <>
        <div className='bingo__grid-container'>
                {grid.length>0?(
                    <div className='bingo__grid-wrapper'>
                        <div className='bingo__grid-start'>
                            {startButton?<button onClick={()=> handleStart()}>Start Game</button>:null}
                            {disableGrid && (
                                <div className='bingo__grid-winner-h3'>
                                    {winnerName.length > 1 ? (
                                        <>
                                            <h3>Game Tied between {winnerName.join(' || ')}</h3>
                                        </>
                                    ) : (
                                        <>
                                            <h3>{winnerName} has won the game. Congrats {winnerName} 🏆!!!</h3>
                                        </>
                                    )}
                                    <button onClick={handleRestart}>Restart Game</button>
                                </div>
                            )}
                        </div>
                        <div className='bingo__grid'>
                           
                            {grid.flat().map((number, index)=>(
                                
                            <button key={index} onClick={()=>handleNumberSelect(number)} disabled={numbersSelected.includes(number) || startButton || disableGrid}
                                style={{
                                    backgroundColor: numberPlayerMap[number] && colorCodeMap[numberPlayerMap[number]] 
                                        ? colorCodeMap[numberPlayerMap[number]] 
                                        : '#F4EEFF'
                                }}>
                                {number}
                                {console.log(colorCodeMap[numberPlayerMap[number]])}
                            </button>))}
                        </div>
                    </div>  
                )
            :(
                <div className='bingo__grid-loader'>
                    <p>Loading....</p>
                </div>
                
            )}
            <div className='bingo__currentTurn'>
                {grid.length>0?<p>Player Turn: {players[currentTurn]}</p>:null}
                
            </div>
        </div>
        </>
    )
}