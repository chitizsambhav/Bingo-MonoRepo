import React, { useState, useEffect, Suspense } from "react";
import { Form, useActionData, useNavigate } from "react-router-dom";
const Spline = React.lazy(() => import("@splinetool/react-spline"));
import Loaders from "../../component/Loader/Loaders";
import socket from '../../utils/socket'
import './join.css'


export async function loginAction({request}){
    const formData = await request.formData()
    const selectedRoom = formData.get('selectedRoom')
    const username = formData.get('username')
    const roomId = formData.get('roomId')
    return {
        selectedRoom:selectedRoom,
        username:username,
        roomId:roomId
    }
}

export default function Join() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('default');
    const formData = useActionData()
    useEffect(() => {
        socket.on('availableRooms', (availableRooms)=>{
            let uniqueArray = [...new Set(availableRooms)]
            setAvailableRooms(uniqueArray)
        })
        return () => {
            socket.off('availableRooms');
        }
    }, [])
   
    
    useEffect(() => {
      setIsLoaded(false);
    }, []);
  
    const handleLoad = () => {
        const timer = setTimeout(()=>setIsLoaded(true), 50)
    }

    const roomSelection = (e)=>{
        setSelectedRoom(e.target.value);
    }

    return(
        <>
            <div className="bingo__join-animation">
                <Suspense fallback={<Loaders />}>
                    {!isLoaded && <Loaders />}

                    { isLoaded ? <Spline id="bingo-animation"
                    scene="https://prod.spline.design/KXqqm-Hxc9QkH-cV/scene.splinecode"
                    onLoad={handleLoad}
                    />: <Spline id="bingo-animation-fail"
                    scene="https://prod.spline.design/KXqqm-Hxc9QkH-cV/scene.splinecode"
                    onLoad={handleLoad}
                    />}

                    {isLoaded && (
                        <div className="bingo__join-form">
                            <h3>Join Game Room</h3>
                            <Form method="get" className="join-form" action="/games">
                                <label htmlFor="selectedRoom" id="label">Available Game Rooms:</label>
                                <select name="selectedRoom" id="room-title" onChange={roomSelection}>
                                    <option value="default" id="default-option">Select Game Rooms</option>
                                    {availableRooms.length > 0 && availableRooms.map((room, index) => (
                                        <option key={index} value={room}>{room}</option>
                                    ))}
                                </select>
                                <label htmlFor="username" id="label">Enter your Display Name:</label>
                                <input type="text" name="username" placeholder="Display Name" />
                                {selectedRoom === 'default' && (
                                        <>
                                        <label htmlFor="roomId" id="label">Enter the Game room code:</label>
                                        <input type="text" name="roomId" id="roomIdInput" placeholder="Game Room Code" />
                                        </>
                                    )}
                                <button>Enter</button>
                            </Form>
                        </div>  
                    )}
                </Suspense>
                </div>
        </>
    )
}