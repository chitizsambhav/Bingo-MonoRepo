import socket from "../../utils/socket";
import './chat.css'
import React, {useEffect, useRef, useState} from "react";
import data from '@emoji-mart/data'
const Spline = React.lazy(() => import("@splinetool/react-spline"));
import Picker from '@emoji-mart/react'
import Loaders from "../Loader/Loaders";
import { Suspense } from "react";
import { MdEmojiEmotions } from "react-icons/md";
import { IoMdSend } from "react-icons/io";
import { Form, useNavigation } from "react-router-dom";
import { format } from "date-fns";


export default function Chat(gameRoomProp){
   const navigation = useNavigation()
   const inputRef = useRef(null)
   const chatScreenRef = useRef(null);
   const lastMessageRef = useRef(null);
   const [messages , setMessages] = useState([])
   const [input, setInput] = useState('')
   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { gameRoom } = gameRoomProp
    let {selectedRoom, username, roomId} = gameRoom
    const closeEmojiWindow = useRef(null)

    console.log(messages)
    if (selectedRoom === 'default'){
        selectedRoom = roomId
    }

    const closeOpenEmojiWindow = (e) =>{
        if( showEmojiPicker && !closeEmojiWindow.current?.contains(e.target)){
            setShowEmojiPicker(false)
        }
    }
    console.log(showEmojiPicker)
    useEffect(() => {
        document.addEventListener('click', closeOpenEmojiWindow);
        return () => {
            document.removeEventListener('click', closeOpenEmojiWindow);
        };
    }, [showEmojiPicker]);

    useEffect(()=>{
        socket.connect();
        socket.emit('join', {username:username, room:selectedRoom}, (error)=>{
            if (error){
                alert(error)
                location.href='/'
            }
        })
        socket.on('message', (message)=>{
            setMessages((prevMessages) => [...prevMessages, message]);
            console.log(format(message.createdAt,'hh:mm'))
        } )

        socket.on
        return ()=> socket.disconnect()
    },[])

    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleEmojiSelect = (emoji) => {
        setInput(input + emoji.native);
      };

    const handleInputChange = (event) => {
        setInput(event.target.value);
      };

    const handleSendMessage = () =>{
       const message = input.trim()
       if(message !== ''){
            socket.emit('sendMessage', message, (message)=>{
                inputRef.current.focus()
                setInput('')
                console.log("message Delivered")
            })
       }
       else {
        console.log("Empty message. Not sending.")
    }}

    return(<>
            <Suspense fallback={<Loaders />}>
                    <div className="bingo__chat-container">
                        <div className="bingo__chat-screen" ref={chatScreenRef}>
                        {messages.map((message, index) => (
                            <div key={index} className="bingo__chat-bubble-block">
                                    <div className="bingo__chat-bubble" key={index} ref={index === messages.length - 1 ? lastMessageRef : null}>
                                    <p className="bingo__chat-screen-sender">{message.username}</p>
                                    <p className="bingo__chat-screen-message">{message.text}</p>
                                    <p className="bingo__chat-screen-time">{format(new Date(message.createdAt), 'hh:mm')}</p>
                                </div>
                            </div>
                                
                            ))}
                    </div>
                    <div className="bingo__chat-form">
                        <Form onSubmit={handleSendMessage}>
                            <div className="bingo__chat-form-elements">
                                <input 
                                id="messageInputForm" 
                                type="text" 
                                placeholder="Type your message....." 
                                value={input}
                                ref={inputRef} 
                                onChange={handleInputChange}
                                autoComplete="off"/>
                                <div ref={closeEmojiWindow} className="bingo__container-emoji">
                                    <button type="button" id="emoji-button" onClick={()=> setShowEmojiPicker(!showEmojiPicker)}><MdEmojiEmotions /></button>
                                    <div id="emoji-picker">
                                        {showEmojiPicker &&
                                            <Picker  data={data} onEmojiSelect={handleEmojiSelect} />}
                                    </div>
                                
                                </div>
                                <button type="submit" id="send-button" disabled={navigation.state === 'submitting'}><IoMdSend /></button>
                            </div>
                        
                        </Form>
                    </div>
                </div>
            </Suspense>
    </>)
}