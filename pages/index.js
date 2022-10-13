import Head from "next/head";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
let socket = io();
export default function Index({ ip }) {
  async function getDatabs() {
    const docRef = doc(db, "users", ip);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("user exists");
    } else {
      console.log("user dosn't exists and we created a new user with that ip");
      await setDoc(doc(db, "users", ip), {
        roomNumber: 1,
      });
    }
  }
  getDatabs();
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
    sendMessage();
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
        value={room}
        onChange={(e) => {
          console.log(room);
          setroom(Number(e.target.value));
        }}
      />
      <p>ععع</p>
      <button onClick={sendMessage}>send message</button>
      <button style={{ background: "green" }} onClick={joinroom}>
        join room
      </button>
      {<p>{messages}</p>}
    </>
  );
}
export async function getServerSideProps({ req }) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded
    ? forwarded.split(/, /)[0]
    : req.connection.remoteAddress;
  return {
    props: {
      ip,
    },
  };
}
