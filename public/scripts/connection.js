// Creating socket when user is in room joining process

createRoomOptBtn.addEventListener("click", function(){
    createRoomDet.innerHTML = ""
    roomStatus.innerHTML = "1/3"
    showPanel(createRoomPanel)
    socket = io('http://localhost:3000')

    socket.on('connect', function(){
        socket.emit("createRoom", {userName:userName})
    })

    socket.on("createRoom", function(payload){
        room = payload.roomId;
        roomId.innerHTML = "Room Id: "+room
        createRoomDet.append(document.createElement('div').innerHTML = userName)
    })
    socket.on('playerCount', function(payload){
        roomStatus.innerHTML = payload.userInfo.length +"/3"
        createRoomDet.innerHTML = ""
        for(let i = 0; i < payload.userInfo.length; i++){
            const elem = document.createElement('div')
            elem.innerHTML = payload.userInfo[i].userName
            createRoomDet.append(elem)
        }
    })
    socket.on('roomErr', function(payload){
        showNotification(payload.message)
    })
    socket.on('startRoom', function(payload){
        connectionBoard.classList.add('hide')
        board.classList.remove('hide')
        starTime = payload.startTime
        startTimer()
        setTimeout(function(){
            socket.emit('startGame', {roomId:room})
        }, 30000)
    })
    gamePlay()
})

joinRoomOptBtn.addEventListener("click", function(){
    showPanel(joinRoomPanel)
})

cancelRoomBtn.addEventListener("click", function(){
    socket.emit('cancelCreateRoom', {roomId:room})
    showPanel(optionPanel)
    socket.disconnect()
})

joinRoomBtn.addEventListener('click', function(){
    showPanel(waitingPlayersPanel)
    socket = io('http://localhost:3000')

    
    socket.on('connect', function(){
        room = roomIdInp.value.trim()
        socket.emit("joinRoom", {roomId:roomIdInp.value.trim(), userName:userName})
    })

    socket.on('playerCount', function(payload){
        waitingStatus.innerHTML = payload.count +"/3"
    })

    socket.on('joinErr', function(payload){
        showNotification(payload.message)
        showPanel(joinRoomPanel)
        socket.disconnect()
    })

    socket.on('playerCount', function(payload){
        waitingStatus.innerHTML = payload.userInfo.length +"/3"
        waitingRoomDet.innerHTML = ""
        for(let i = 0; i < payload.userInfo.length; i++){
            const elem = document.createElement('div')
            elem.innerHTML = payload.userInfo[i].userName
            waitingRoomDet.append(elem)
        }
    })
    socket.on('startRoom', function(payload){
        connectionBoard.classList.add('hide')
        board.classList.remove('hide')
        starTime = payload.startTime
        startTimer()

    })
    gamePlay()
})


cancelJoinRoomBtn.addEventListener("click", function(){
    showPanel(optionPanel)
})

cancelWaitingBtn.addEventListener('click', function(){
    showPanel(optionPanel)
    socket.emit('cancelJoin', {roomId:room})
})

// 
startRoomBtn.addEventListener('click', function(){
    const currDate = new Date()
    socket.emit('startRoom', {roomId:room, startTime:currDate.getTime()})
})

gameEndButton.addEventListener('click', function(){
    gameEndButton.classList.add('hide')
    location.reload()
})
function updatePlayers(turn){
    for(let i = 0; i < playersDetail.children.length; i++){
        playersDetail.children[i].classList.remove('turn');
        if (turn == i) playersDetail.children[i].classList.add('turn')
    }
}

function updateBox(number, name){
    for(let i = 0; i < 5; i++){
        for(let j = 0; j < 5; j++){
            if (currBoard[i][j] == number){
                currBoard[i][j] = -1
                gridButtons[i*5 + j].innerHTML = name
                
                return

            }
        }
    }
}

function gamePlay(){
    socket.on('notify', function(payload){
        showNotification(payload.message)
    })
    socket.on('startGame', function(payload){
        clearInterval(tmr)
        randomSelection()
        started = true
        fillBlocks.classList.add('hide')
        playersDetail.classList.remove('hide')
        users = payload.userInfo
        

        playersDetail.innerHTML = ""
        for(let i = 0; i < users.length; i++){
            const div = document.createElement('div')
            div.classList.add('player')
            const priceDiv = document.createElement('div')
            priceDiv.classList.add('price-box')
            div.innerHTML = users[i].userName
            div.append(priceDiv)
            playersDetail.append(div)
        }

        updatePlayers(payload.turn)
    })
    socket.on('boxClicked', function(payload){
        updateBox(payload.number, payload.name)
        updatePlayers(payload.turn)
        if (checkForWin() && !won){

            socket.emit('playerWon', {roomId:room})
        }
    })
    socket.on('turnErr', function(payload){
        showNotification(payload.message)
    })

    socket.on('playerWon', function(payload){
        


        let medal = '🥇'
        if (payload.price == 2) medal = '🥈'
        if (payload.price == 3) medal = '🥉'
        if (playersDetail.children[payload.index].children[0].innerHTML == "") playersDetail.children[payload.index].children[0].innerHTML = medal
    })
    socket.on("won", function(payload){
        if (won) return
        won = true
        let pos = "1st"
        if (payload.pos == 2) pos = '2nd'
        if (payload.pos == 3) pos = '3rd'
        showCongrats("Congrats you secured "+pos+" position")

    })
    socket.on('finishGame', function(){
        showNotification("Game has been finished")
        socket.disconnect()
        gameEndButton.classList.remove('hide')
    })
    socket.on("turnChange", function(payload){
        updatePlayers(payload.turn)
    })
}