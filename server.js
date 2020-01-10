const io = require('socket.io')();

let messageId = 1;
const messages = []; // Limit the size in future maybe
let connectedUsers = [];
const rooms = [{ name: 'general', owner: null }];

const joinRoom = (socket, room) => {
  socket.leaveAll();
  socket.join(room);
  io.to(`${socket.id}`).emit('joined room', room);
};

io.on('connection', socket => {
  socket.join('general');
  socket.color = Math.floor(Math.random() * 255); // eslint-disable-line no-param-reassign
  console.log('a user connected');
  io.to(`${socket.id}`).emit('message history', messages);
  socket.on('message', message => {
    const messageObject = {
      id: messageId,
      user: message.username,
      value: message.value,
      sentAt: new Date().toLocaleTimeString(),
      userColor: socket.color
    };
    messages.push(messageObject);
    console.log(messageObject);
    console.log(`to room ${message.room}`);
    io.to(message.room).emit('message', messageObject);
    messageId += 1;
  });
  socket.on('add user', username => {
    const connectedUser = { id: socket.id, username, userColor: socket.color };
    connectedUsers.push(connectedUser);
    io.emit('update userlist', connectedUsers);
    console.log(connectedUsers);
  });
  socket.on('create room', room => {
    rooms.push({ name: room.value, owner: room.username });
    console.log(rooms);

    joinRoom(socket, room.value);
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
