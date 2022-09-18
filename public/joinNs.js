function joinNs(endPoint) {

    if (nsSocket) {
        nsSocket.close()

        //remove the event listner
        document.querySelector('#user-input').removeEventListener('submit', formSubmission)
    }

    nsSocket = io(`http://localhost:9000${endPoint}`)

    nsSocket.on("nsRoomLoad", (nsRoom) => {
        let roomList = document.querySelector(".room-list");

        roomList.innerHTML = "";
        nsRoom.forEach((room) => {
            let glyph;
            if (room.privateRoom) {
                glyph = "lock";
            } else {
                glyph = "globe"
            }
            roomList.innerHTML += `<li class="room"> <span class="glyphicon glyphicon-${glyph}"></span>${room.roomTitle}</li>`
        })

        // add click listner to each room
        let roomNodes = document.getElementsByClassName("room");
        Array.from(roomNodes).forEach((elem) => {
            elem.addEventListener("click", (e) => {
                joinRoom(e.target.innerText)

            })
        })

        //add room automatically first time here
        const topRoom = document.querySelector(".room");
        let topRoomName = topRoom.innerText;

        joinRoom(topRoomName)

    })


    nsSocket.on('messageToClients', (msg) => {
        console.log(msg)
        const newMsg = buildHTML(msg)
        document.querySelector('#messages').innerHTML += newMsg
    })


    document.querySelector('.message-form').addEventListener('submit', formSubmission)
}


function formSubmission(event) {
    event.preventDefault();
    const newMessage = document.querySelector('#user-message').value;
    nsSocket.emit('newMessageToServer', { text: newMessage })
}

function buildHTML(msg) {
    console.log(msg)
    const convertedDate = new Date(msg.time).toLocaleString();
    const newHTML = `
    <li>
        <div class="user-image">
            <img src="${msg.avatar}" />
        </div>
        <div class="user-message">
            <div class="user-name-time">${msg.userName} <span>${convertedDate}</span></div>
            <div class="message-text">${msg.text}</div>
        </div>
    </li>    
    `
    return newHTML;
}