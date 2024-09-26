import { useLoaderData } from 'react-router-dom'
import Chat from '../../component/chat/Chat'
import './game.css'
import Sidebar from '../../component/sidebar/Sidebar';
import '../../component/bingoGrid/BingoGrid'
import BingoGrid from '../../component/bingoGrid/BingoGrid';

export function gameLoader({request}){
 const url = new URL(request.url)
 const selectedRoom = url.searchParams.get('selectedRoom');
 const username = url.searchParams.get('username');
 const roomId = url.searchParams.get('roomId');
 if(username !==null){
    sessionStorage.setItem('selectedRoom', selectedRoom);
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('roomId', roomId);
 }
 return null

}
export default function Game(){
    const selectedRoom = sessionStorage.getItem('selectedRoom')
    const username = sessionStorage.getItem('username')
    const roomId = sessionStorage.getItem('roomId')
    console.log(selectedRoom,username,roomId)
    return(
        <>
            <div className='bingo__game-layout'>
                <Sidebar />
                <BingoGrid />
                <Chat gameRoom={{selectedRoom:selectedRoom, username:username,roomId:roomId}}/>
            </div>
            
        </>
    )
}