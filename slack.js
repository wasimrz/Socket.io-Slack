const express = require('express');
const app = express();
const socketio = require('socket.io')
const expressServer = app.listen(9000);
const io = socketio(expressServer);

let namespaces = require("./data/namespaces");


app.use(express.static(__dirname + '/public'));



io.on('connection', (socket) => {
    let nsData = namespaces.map((ns) => {
        return {
            img: ns.img,
            endPoint: ns.endPoint,
        }
    })

    socket.emit("nsList", nsData)
})

namespaces.forEach((namespace) => {
    io.of(namespace.endPoint).on("connection", (nsSocket) => {
        console.log(`${nsSocket.id} join ${namespace.endPoint}`)
        let rooms = namespace.rooms
        nsSocket.emit("nsRoomLoad", rooms)
        nsSocket.on("joinRoom", (roomTOJoin, numberofUsersCalback) => {

            //deal with history once we have it
            const roomTitle = Object.keys(nsSocket.rooms)[1]
            nsSocket.leave(roomTitle)
            nsSocket.join(roomTOJoin)
                // io.of("/wiki").in(roomTOJoin).clients((err, clients) => {
                //     console.log(clients.length)
                //     numberofUsersCalback(clients.length)
                // })

            let nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomTOJoin;
            });

            nsSocket.emit("historyCatchup", nsRoom.history)
            io.of(namespace.endPoint).in(roomTOJoin).clients((err, clients) => {
                nsSocket.emit("clientsLength", clients.length)
            })

        })
        nsSocket.on("newMessageToServer", (msg) => {

            const fullMsg = {
                    text: msg.text,
                    time: Date.now(),
                    userName: "wasim",
                    avatar: "https://via.placeholder.com/30"
                }
                //send this message to all the socket that are in the room that this socket is in how can we find out rooms this socket is in
            console.log(nsSocket.rooms)
                //the user will be in second room in the object list this is beacause the socket always join its own room on connection
                //get the keys

            const roomTitle = Object.keys(nsSocket.rooms)[1]
            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomTitle;
            })
            console.log({ fullMsg })
            nsRoom.addMessage(fullMsg)
            io.of(namespace.endPoint).to(roomTitle).emit("messageToClients", fullMsg)

        })

    })
})

function updateUsersInRoom(namespace, roomToJoin) {
    // Send back the number of users in this room to ALL sockets connected to this room
    io.of(namespace.endpoint).in(roomToJoin).clients((error, clients) => {
        // console.log(`There are ${clients.length} in this room`);
        io.of(namespace.endpoint).in(roomToJoin).emit('clientsLength', clients.length)
    })
}