const users = []
console.log(users)
const addUser = ({id, username, room})=>{

    console.log(username)
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate that room and username is non-empty
    if(!room || !username){
        return{
            error:'username and room is mandatory to join the chat room!'
        }
    }

    //validate that same users is not present in the users array
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    if(existingUser){
        return{
            error:'Username already exist'
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return {user}

}

const userMap = ({id}) => {
    
}


const removeUser = ({id})=>{
    const index = users.findIndex((user)=> user.id ===id)
    if(index !== -1){
        const removedUser = users.splice(index,1)[0]
        return removedUser
    }
    
}

const getUser = ({id})=>{
    const user = users.find((user)=> user.id === id)
    if(!user){
        return undefined
    }
    return user
}   

const getUserInRoom = ({room})=>{
    const usersInARoom = users.filter((user)=>{
        return user.room === room
    })
    return usersInARoom
}

const getRooms = () =>{
    const roomsAvailable = users.map((user => user.room))
    return roomsAvailable
}


module.exports ={
    getUser,
    getUserInRoom,
    removeUser,
    addUser,
    getRooms
}