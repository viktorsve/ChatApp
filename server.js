const io = require('socket.io')();

let messageId = 1;
const messages = []; // Limit the size in future maybe
let connectedUsers = [];
const rooms = [{ name: 'general', owner: null }];

const sendMessage = (socket, message) => {
  if (message.room) {
    const messageObject = {
      type: 'user',
      id: messageId,
      user: message.username,
      value: message.value,
      sentAt: new Date().toLocaleTimeString(),
      userColor: socket.color
    };
    messages.push(messageObject);

    io.to(message.room).emit('message', messageObject);
    messageId += 1;
  } else {
    const messageObject = {
      type: 'system',
      value: message
    };

    io.to(`${socket.id}`).emit('message', messageObject);
  }
};

const joinRoom = (socket, room) => {
  if (rooms.some(r => r.name === room)) {
    io.to(`${socket.id}`).emit('joined room', room);
    const index = connectedUsers.findIndex(user => user.id === socket.id);
    connectedUsers[index].room[0] = room;
    io.emit('remove user', connectedUsers);

    Object.keys(socket.rooms).forEach(key => {
      if (socket.id !== key) {
        socket.leave(key);
      }
    });

    sendMessage(socket, `Joined room ${room}`);
    socket.join(room);
  }
};

io.on('connection', socket => {
  socket.join('general');
  socket.color = Math.floor(Math.random() * 255); // eslint-disable-line no-param-reassign
  console.log('a user connected');
  io.to(`${socket.id}`).emit('message history', messages);
  io.emit('update roomlist', rooms);
  socket.on('message', message => {
    sendMessage(socket, message);
  });
  socket.on('add user', username => {
    const room = Object.keys(io.sockets.adapter.sids[socket.id]).filter(item => item !== socket.id);
    const connectedUser = {
      id: socket.id, username, userColor: socket.color, room
    };
    connectedUsers.push(connectedUser);

    io.emit('update userlist', connectedUsers);
    console.log(connectedUsers);
  });
  socket.on('create room', room => {
    if (rooms.filter(r => r.name === room.value).length === 0) {
      rooms.push({ name: room.value, owner: room.username });
      console.log(rooms);

      joinRoom(socket, room.value);
      io.emit('update roomlist', rooms);
    }
  });
  socket.on('join room', room => {
    joinRoom(socket, room.value);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
    const updatedUserList = connectedUsers.filter((id) => id.id !== socket.id);
    connectedUsers = updatedUserList;
    io.emit('update userlist', connectedUsers);
  });
  socket.on('user is writing', username => {
    socket.broadcast.emit('user is writing', username);
  });
  socket.on('stopped typing message', username => {
    socket.broadcast.emit('stopped typing message', username);
  });
});

const port = 8000;
io.listen(port);
console.log('listening on port ', port);
