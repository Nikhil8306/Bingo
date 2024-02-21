const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const {Server} = require('socket.io')
const {uid} = require("uid")

const matches = new Map()

const port = 3000

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', function(req, res){
    res.render('home')
})

app.get('/room', function(req, res){
    res.render('room')
})

const io = new Server(server,{
      origins: ["http://localhost:3000/room"]
    }
)

io.on('connection', function(socket){
    console.log("user of socket id : "+socket.id+" connected")
    socket.on('disconnect', function(){
        console.log("socket id "+socket.id+" disconnected")
    })

    // For creating room
    socket.on('createRoom', function(payload){
        const id = uid(5)
        socket.join(id)
        socket.emit('createRoom', {roomId:id})
        matches.set(id, {
            userInfo : [{
                userName:payload.userName,
                socketId:socket.id
            }],
            turn : 0,
            gameStart:false,
            crossed:[-1],
            winners:[],
        })
    })

    socket.on('cancelCreateRoom', function(payload){
        io.to(payload.roomId).emit('joinErr', {message:"Room Creation Cancelled"})
        matches.delete(payload.roomId)
    })

    
    //For Joining Room
    socket.on('joinRoom', function(payload){
        if (!matches.get(payload.roomId)){
            socket.emit('joinErr', {message:"No such room present"})
            return
        }
        if (matches.get(payload.roomId).userInfo.length >= 3){
            socket.emit('joinErr', {message:"room is already full"})
            return
        }
        if (matches.get(payload.roomId).gameStart) {
            socket.emit('joinErr', {message:"Game have already been started"})
            return
        }
        socket.join(payload.roomId);
        matches.get(payload.roomId).userInfo.push({userName:payload.userName, socketId:socket.id})
        io.to(payload.roomId).emit("playerCount", {userInfo:matches.get(payload.roomId).userInfo})
        
        // socket.emit("playerCount", {count:io.sockets.adapter.rooms.get(payload.roomId).size})
    })

    socket.on('cancelJoin', function(payload){
        const users = matches.get(payload.roomId).userInfo
        for(let i = 0; i < users.length; i++){
            if (users[i].socketId == socket.id){
                users.splice(i, 1);
                break;
            }
        }
        matches.get(payload.roomId).userInfo = users
        io.to(payload.roomId).emit("playerCount", {userInfo:matches.get(payload.roomId).userInfo})
        socket.emit("joinErr", {message:"You disconnected"})
        
    })

    socket.on('startRoom', function(payload){
        if (matches.get(payload.roomId).userInfo.length < 2) {
            socket.emit("roomErr", {message:"Player count is not enough"})
            return
        }
        io.to(payload.roomId).emit('startRoom', {startTime:payload.startTime})
    })

    
    socket.on('startGame', function(payload){
        matches.get(payload.roomId).gameStart = true
        const currRoom = matches.get(payload.roomId)
        const randTurn = Math.floor(Math.random() * (currRoom.userInfo.length));
        currRoom.turn = randTurn
        io.to(payload.roomId).emit("startGame", {
            userInfo:currRoom.userInfo,
            turn:currRoom.turn,
        })
        io.to(currRoom)
    })

    socket.on('boxClicked', function(payload){
        const currRoom = matches.get(payload.roomId)

        for(let i = 0; i < currRoom.winners.length; i++) {
            if (currRoom.userInfo[currRoom.winners[i]].socketId == socket.id){
                socket.emit("notify", ({message:"You have already won the match"}))
                io.to(payload.roomId).emit('turnChange')
                return
            }
        }

        if (currRoom.userInfo[currRoom.turn].socketId != socket.id){
            socket.emit("turnErr", {message:"It is not your turn"})
            return
        }

    
        if (currRoom.crossed.indexOf(payload.number) != -1){
            socket.emit("turnErr", {message:"Please choose blank box"})
            return
        }
        const name = currRoom.userInfo[currRoom.turn].userName
        currRoom.turn = (currRoom.turn+1)%currRoom.userInfo.length

        while(currRoom.winners.indexOf(currRoom.turn) != -1){
            currRoom.turn = (currRoom.turn+1)%currRoom.userInfo.length
        }

        io.to(payload.roomId).emit("turnChange", {turn:currRoom.turn})
        currRoom.crossed.push(payload.number)

        io.to(payload.roomId).emit('boxClicked', {turn: currRoom.turn, number:payload.number, name:name})
    })

    socket.on('playerWon', function(payload){
        
        const currRoom = matches.get(payload.roomId)
        socket.emit('won', {pos:currRoom.winners.length+1})
        let ind
        for(let i = 0; i < currRoom.userInfo.length; i++){
            if (currRoom.userInfo[i].socketId == socket.id){
                ind = i
                break
            }
        }

        const obj = {index:ind}
        if (currRoom.winners.length == 0){
            obj.price = 1
        }
        else obj.price = 2
        
        if (currRoom.winners.indexOf(ind) == -1)
            currRoom.winners.push(ind)

        io.to(payload.roomId).emit('playerWon', obj)

        if (currRoom.userInfo.length - currRoom.winners.length < 2){

            for(let i = 0; i < currRoom.userInfo.length; i++){
                
                if (currRoom.winners.indexOf(i) == -1){
                    if (currRoom.userInfo.length == 2){
                        io.to(payload.roomId).emit("playerWon", {index:i, price:2})
                    }
                    else{
                        io.to(payload.roomId).emit("playerWon", {index:i, price:3})
                    }
                    break
                }
            }
            io.to(payload.roomId).emit("finishGame")
        }
        else{
            while(currRoom.winners.indexOf(currRoom.turn) != -1){
                currRoom.turn = (currRoom+1)%currRoom.userInfo.length
            }

            io.to(payload.roomId).emit("turnChange", {turn:currRoom.turn})
        }

    })
})

server.listen(port)



