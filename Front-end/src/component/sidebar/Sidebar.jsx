import './sidebar.css'
import socket from "../../utils/socket";
import React, {useEffect, useState} from "react";


export default function Sidebar(){
    const [users, setUsers] = useState([])
    const [roomID, setRoomID] = useState()

    useEffect(()=>{
        socket.connect();
        socket.on('roomData', ({room, users})=>{
            setRoomID(room)
            setUsers(users)
        })
        return ()=> socket.disconnect()
    },[])

    return(
       <div className='bingo__sidebar-container'>
        <div className='bingo__sidebar-room'>
            <h3>Game Room ID:</h3>
            <h4>{roomID}</h4>
        </div>
        <div className='bingo__sidebar-line'></div>
        <div className='bingo__sidebar-players'>
            <h3>Players Name:</h3>
            <ol>
                {users.map((user, index)=>
                    <li key={index}>{user.username}</li>
                )}
            </ol>     
        </div>
       </div>
    )
}



