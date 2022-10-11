import Head from "next/head";
import { useEffect, useState } from "react";
import io from "socket.io-client";
let socket = io();
export default function Index() {
  const [room, setroom] = useState(0);
  const [input, setinput] = useState("");
  const [messages, setmessages] = useState("");
  function sendMessage() {
    socket.emit("send_message", {
      message: input,
      room: room,
    });
  }
  function joinroom() {
    socket.emit("join_room", room);
  }
  useEffect(() => {
    sendMessage()
    fetch("/api/websocket").then((res) => {
      socket.on("received_message", (data) => {
        setmessages(data.message);
        console.log(messages);
      });
      socket.on("room_number", (data) => {
        alert(data);
      });
    });
  }, [input]);
  return (
    <>
      <Head>
        <title>Suck it </title>
      </Head>
      <input
        style={{
          padding: "1.5rem",
          fontSize: "1.5rem",
        }}
        value={input}
        onChange={(e) => setinput(e.target.value)}
      />
      <input
        style={{
          padding: "1.5rem",
          fontSize: "1.5rem",
        }}
        type={"number"}
        value={room}
        min={0}
        max={10}
        onChange={(e) => {
          console.log(room);
          setroom(Number(e.target.value));
        }}
      />
      <button onClick={sendMessage}>send message</button>
      <button onClick={joinroom}>join room</button>
      {<p>{messages}</p>}
    </>
  );
}
//NOTE: what's the next step ?
