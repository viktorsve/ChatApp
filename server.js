const io = require('socket.io')();

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
    socket.on("message", message => {
      console.log(message)
      io.emit("message", message)
    })
  });

const port = 8000;
io.listen(port);
console.log('listening on port ', port);