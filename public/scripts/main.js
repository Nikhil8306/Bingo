// Variables
let started = false
let room = ""
let socket
let userName = "User"
let users = []
let crosses = 0
let won = false

const connectionBoard = document.querySelector(".connection-board")
const board = document.querySelector(".board")
// Panels
const optionPanel = document.querySelector('.connection-options')
const createRoomPanel = document.querySelector(".create-room")
const joinRoomPanel = document.querySelector('.join-room')
const waitingPlayersPanel = document.querySelector(".waiting-players")

// Buttons
// For options
const createRoomOptBtn = document.querySelector('.create-room-btn')
const joinRoomOptBtn = document.querySelector(".join-room-btn")
// For room creation
const startRoomBtn = document.querySelector(".start-room-button")
const cancelRoomBtn = document.querySelector(".cancel-room-button")
// For room joining
const joinRoomBtn = document.querySelector(".join-game-btn")
const cancelJoinRoomBtn = document.querySelector(".join-game-cancel-btn")
// For waiting area
const cancelWaitingBtn = document.querySelector('.cancel-waiting-btn')
//Grid Buttons
const gridButtons = document.querySelectorAll('.grid-btn')
//Game End Button
const gameEndButton = document.querySelector('.game-end-button')



// Input Fields
const userNameInp = document.querySelector(".user-name-input")
const roomIdInp = document.querySelector("#join-game-id")
const roomId = document.querySelector('.room-id')

// Others
// For room status
const roomStatus = document.querySelector(".room-status")
const waitingStatus = document.querySelector(".waiting-status")
const notificationBox = document.querySelector(".notification-box")

const createRoomDet = document.querySelector(".create-room-det")
const waitingRoomDet = document.querySelector(".waiting-room-det")

const fillBlocks = document.querySelector(".fill-blocks")
const playersDetail = document.querySelector(".players-details")

const congrats = document.querySelector('.congratulations')


// To check if use name is not blank
userNameInp.addEventListener('change', function(){
    userNameInp.value = userNameInp.value.trim()
    if (userNameInp.value == "") userNameInp.value = "User" 

    userName = userNameInp.value
})


// Functions

//function to only show certain panel
function showPanel(panel){
    for(let i = 0; i < connectionBoard.children.length; i++){
        connectionBoard.children[i].classList.add('hide');
    }

    panel.classList.remove('hide');
}

function showNotification(message){
    notificationBox.textContent = message;
    notificationBox.classList.add('show-notification')
    clearTimeout(hideNotification)
    setTimeout(hideNotification, 2500)
}

function hideNotification(){
    notificationBox.innerHTML = ""
    notificationBox.classList.remove('show-notification')
}


function showCongrats(message){
    congrats.textContent = message;
    congrats.classList.add('show-congratulations')
    clearTimeout(hideCong)
    setTimeout(hideCong, 2500)
}

function hideCong(){
    congrats.innerHTML = ""
    congrats.classList.remove('show-congratulations')
}