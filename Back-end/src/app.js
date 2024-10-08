
const express = require('express');
const path = require('path');
const indexRouter = require('./router/index');
const cors = require('cors');
const http = require('http')
const {Server} = require('socket.io')
const Filter = require('bad-words')
const {getUser, getUserInRoom, removeUser, addUser, getRooms } = require('./utils/users')
const { generateMessage } = require('./utils/message')
const app = express();
const server = http.createServer(app)

let gameState = {
  players: {},
  crossedNumbers: [],
  currentTurn: null,
  colorCodeUsername: {},
  colorCodePlayerID: {}
};

let playerCount = 0
let usernameMap = {}
let numberPlayerMap = {}

const colorHexCode = ['#FADFA1','#C96868', '#FF6600', '#D2FF72', '#D3EE98', '#95E1D3','#FFB6B9', '#F38BA0', '#62D2A2', '#F7ECDE']

const io = new Server(server, {
    cors: {
      origin: ["http://169.254.87.17:5173", "http://localhost:5173", "http://10.50.240.254:5173", "http://172.20.10.2:5173", "http://3.25.105.209"]
    }
  });

io.on("connection",(socket)=>{
    console.log("New connection with ID:", socket.id);
    const playerId = socket.id;
    gameState.players[playerId] = generateRandomGrid();
    
    
    socket.on('join', ({username, room}, callback )=>{
      const { error, user }= addUser({id: socket.id, username, room})
      usernameMap[socket.id] = username
      if (playerCount>=colorHexCode.length){
        playerCount = playerCount%colorHexCode.length
      }
      const usernameLowerCase = username.toLowerCase()
      gameState.colorCodeUsername[usernameLowerCase] = colorHexCode[playerCount]
      gameState.colorCodePlayerID[playerId] = colorHexCode[playerCount]
      playerCount++

      if(error){
          return callback(error)
      }
      socket.join(user.room)
      socket.emit('message', generateMessage('Welcome', 'Admin'))
      io.emit('usernameMap', usernameMap)
      socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined this live chat!!!`, 'Admin'))

      io.to(user.room).emit('roomData', {
          room:user.room,
          users:getUserInRoom({room:user.room}),
          colorCodeMap: gameState.colorCodeUsername
      })
    })

    if (!gameState.currentTurn) {
        gameState.currentTurn = playerId;
    }
    var refreshIntervalId  = setInterval(()=>{
      socket.emit('init', {
        grid: gameState.players[playerId],
        currentTurn: gameState.currentTurn,
        playerNames:usernameMap
      })
    },1000)
    
    socket.on('removeInterval', ()=>{
      console.log(`Clearing interval for player: ${playerId}`);
      clearInterval(refreshIntervalId)
    })

    socket.on('winnerFound', (winner)=>{
      io.emit('winnerName', winner)
    })

    socket.on('restartGame', ()=>{
      gameState.players={}
      gameState.crossedNumbers=[]
      gameState.currentTurn=null
      numberPlayerMap = {}
      

      const playerIds = Object.keys(usernameMap)
      playerIds.forEach((playerId)=>{
        gameState.players[playerId] = generateRandomGrid()
      })
      if(playerIds.length>0){
        gameState.currentTurn = playerIds[0]
      }

      Object.keys(gameState.players).forEach((id) => {
        io.to(id).emit('restartedGame', {
          grid: gameState.players[id],
          currentTurn: gameState.currentTurn
        });
      });
      
      
    })

    socket.on('sendMessage', (message, callback)=>{
      const user = getUser({id:socket.id})
      const filter = new Filter()
      if (filter.isProfane(message)){
          socket.emit('message', generateMessage('Profane Language is restricted in this game-room'))
          return
      }
      io.to(user.room).emit('message', generateMessage(message, user.username))
      callback()
    })

    socket.on('startClicked',()=>{
      io.emit('removeStart')
      io.emit('colorCode', gameState.colorCodePlayerID)
    })

    socket.on('numberSelected', (number, currentTurn) => {
      console.log(number)
      console.log(socket.id, gameState.currentTurn)
      console.log(usernameMap)
      if (socket.id === gameState.currentTurn) {
          numberPlayerMap[number] = currentTurn
          io.emit('updateNumberPlayerMap', numberPlayerMap)
          gameState.crossedNumbers.push(number);
          console.log(number)
          console.log(gameState.crossedNumbers)
          io.emit('updateGrid', number);

          const playerIds = Object.keys(gameState.players);
          const currentIndex = playerIds.indexOf(gameState.currentTurn);
          const nextIndex = (currentIndex + 1) % playerIds.length;
          gameState.currentTurn = playerIds[nextIndex];

          io.emit('updateTurn', gameState.currentTurn);
      }
  });

    socket.on('disconnect', ()=>{
      const removedUser = removeUser({id:socket.id})
      delete gameState.colorCodeUsername[usernameMap[playerId]]
      if (removedUser){
          io.to(removedUser.room).emit('message', generateMessage( `${removedUser.username} has left the live chat!`,'Admin'))
          io.to(removedUser.room).emit('roomData', {
              room:removedUser.room,
              users:getUserInRoom({room:removedUser.room}),
              colorCodeMap:gameState.colorCodeUsername
          })
      }
      let currentIndex = Object.keys(gameState.players).indexOf(playerId)
      console.log(gameState.players[playerId])
      console.log(currentIndex)
      delete gameState.players[playerId];
      delete gameState.colorCodePlayerID[playerId]
      delete usernameMap[playerId]
      const playerIds = Object.keys(gameState.players);
      if(playerIds.length===0){
        gameState.currentTurn = null
        gameState.crossedNumbers = []
      }
        if (playerId === gameState.currentTurn) {
            // Handle case where the player whose turn it is disconnects
           
            if (playerIds.length > 0) {
              if (currentIndex === playerIds.length){
                gameState.currentTurn = playerIds[0]
              }
              else{
                currentIndex = currentIndex % playerIds.length;
                gameState.currentTurn = gameState.players[currentIndex];
              }
              io.emit('updateTurn', gameState.currentTurn);
            }
        }
    })



    socket.emit('availableRooms', getRooms())
})

function generateRandomGrid() {
  let numbers = Array.from({ length: 25 }, (_, i) => i + 1);
  numbers = shuffle(numbers); // Implement a shuffle function
  return chunk(numbers, 5);   // Split array into 5x5 chunks
}



function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}


app.use(cors());
app.use(express.json());
app.use('/', indexRouter);

module.exports = server;
