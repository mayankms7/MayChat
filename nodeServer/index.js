// Node server which will handle our socket.io connections

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();

const server = http.createServer(app);

const io = socketio(server,{
        cors: {
            origin: "*",
          methods: ["GET", "POST"],
          allowedHeaders: ["my-custom-header"],
          credentials: true
        }
      });

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// const io = require('socket.io')(8000);

const users = {};

io.on('connection',(socket) => {
    // If any user joins, then the other connected users get to know this
    socket.on('new-user-joined', name => {
        // console.log("New user", name);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined',name);
    });

    // If a user sends the msg, broadcast it to the other connected ppl
    socket.on('send',message => {
        socket.broadcast.emit('receive', {message: message, name : users[socket.id]})
    });

    // If someone leaves the chat, let the connected ppl know
    socket.on('disconnect',message=>{
        socket.broadcast.emit('left',users[socket.id]);
        delete users[socket.id];
    })
})

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
