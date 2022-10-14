import { Server } from "socket.io";
const ioHandler = (req, res) => {
  let user_room;
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;
    io.on("connection", (socket) => {
      socket.on("join_room", (data) => {
        //NOTE: leave all rooms
        Array.from(socket.rooms).forEach((ro) => {
          if (ro !== Array.from(socket.rooms)[0]) {
            socket.leave(ro);
          }
        });
        user_room = data.room;
        //NOTE: join specific room
        socket.join(data.room);
        console.log(
          `joined room ${user_room} , all rooms = ${Array.from(socket.rooms)}`
        );
        socket.emit("joined_room", `joined room N${data.room}`);
      });
      socket.on("send_message", (data) => {
        io.sockets.to(user_room).emit("message_received", data);
        console.log(user_room, data);
      });
    });
  }
  res.end();
};
export const config = {
  api: {
    bodyParser: false,
  },
};
export default ioHandler;
// TODO: look for the active users
// TODO: join room automaticly on page load
