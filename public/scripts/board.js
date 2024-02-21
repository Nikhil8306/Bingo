
const removeTokenBtn = document.querySelector('.remove-prev-btn')
const timer = document.querySelector('.timer')



// Code for filling the boxes
const currBoard = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]
let currT = 1
const currStack = []

let currentDate = new Date();
let startTime = currentDate.getSeconds()
let currTime = currentDate.getSeconds()
let tmr = null
function startTimer(){
    currentDate = new Date();
    startTime = parseInt(currentDate.getTime()/1000)
    currTime = currentDate.getTime()/1000
    
    tmr = setInterval(updateTime, 1000)
}

function updateTime(){
    if ((30-(currTime-startTime)) <= 0){
        clearInterval(tmr)
        return
    }
    currentDate = new Date();
    currTime = parseInt(currentDate.getTime()/1000)
    timer.innerHTML = 30-(currTime-startTime)
}

gridButtons.forEach((btn)=>{
    btn.addEventListener("click", function(){
        if (!started){
            
            let row = parseInt(btn.classList[1][0])
            let col = parseInt(btn.classList[1][1])
            if (currBoard[row][col] != 0) {
                showNotification("please select empty box")
                return
            }
            btn.innerHTML = currT
            
            currBoard[row][col] = currT
            currStack.push([row, col])
            currT++
        }
        else{
            const row = btn.classList[1][0]
            const col = btn.classList[1][1]
            socket.emit('boxClicked', {number:currBoard[row][col], roomId:room})
            
        }
    })
})

removeTokenBtn.addEventListener("click", function(){
    if (currStack.length <= 0){
        showNotification("Board is already empty")
        return
    }
    let row = currStack[currStack.length-1][0]
    let col = currStack[currStack.length-1][1]
    gridButtons[row*5 + col].innerHTML = ""
    currBoard[row][col] = 0
    currT--
    currStack.splice(currStack.length-1, 1)
})

function randomSelection(){
    let values = []
    for(let i = currT; i <= 25; i++){
        values.push(i)
    }

    for(let i = 0; i < 5; i++){
        for(let j = 0; j < 5; j++){
            if (currBoard[i][j] == 0){
                const rand = Math.floor(Math.random() * (values.length))
                
                currBoard[i][j] = values[rand]
                gridButtons[(i*5)+(j)].innerHTML = values[rand]
                values.splice(rand, 1)
            }
        }
    }
}

function checkForWin () {
    let countX = 0;
    let countY = 0;
    let countZ = 0;
    for (let i = 0; i < 5; i++) {
      let isCrossed = true;
      for (let j = 0; j < 5; j++) {
        if (currBoard[i][j] != -1) {
          isCrossed = false;
          break;
        }
      }

      if (isCrossed) countX++;
    }

    for (let i = 0; i < 5; i++) {
      let isCrossed = true;
      for (let j = 0; j < 5; j++) {
        if (currBoard[j][i] != -1) {
          isCrossed = false;
          break;
        }
      }

      if (isCrossed) countY++;
    }

    let isCrossed = true;
    for (let row = 0, col = 0; row <= 4; row++, col++) {
      if (currBoard[row][col] != -1) {
        isCrossed = false;
        break;
      }
    }
    if (isCrossed) countZ++;

    isCrossed = true;
    for (let row = 0, col = 4; row <= 4; row++, col--) {
      if (currBoard[row][col] != -1) {
        isCrossed = false;
        break;
      }
    }
    if (isCrossed) countZ++;

    return (countX+countY+countZ)>=5

  };