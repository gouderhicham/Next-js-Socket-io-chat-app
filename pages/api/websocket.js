import { Server } from "socket.io";
const ioHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;
    io.on("connection", (socket) => {
      socket.on("join_room", (data) => {
        socket.join(data);
      });
      socket.on("send_message", (data) => {
        console.log(data);
        io.sockets.to(data.room).emit("received_message", data);
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
// TODO: when clicking on a user icon, create automaticly a room between those two
// TODO: create a room automaticly on page load from the room id stored on both users accounts on firebase