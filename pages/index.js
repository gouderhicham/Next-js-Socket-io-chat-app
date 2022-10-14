import Head from "next/head";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useRouter } from "next/router";
import ChatRoom from "../components/ChatRoom";
export let socket = io();
export default function Index({ ip }) {
  const route = useRouter();
  const allRoomsIndex = ["🔥", "🌈", "❄", "🌊"];
  const [input, setinput] = useState("");
  const [user, setuser] = useState(null);
  const [messages, setmessages] = useState([]);
  //NOTE: we used useEffect twice with [] because we dont want to check if user exists on every msg sent
  useEffect(() => {
    async function getdata() {
      let ge = await getDatabs(ip);
      setuser(ge);
    }
    getdata();
  }, []);
  // NOTE: function that do all the messaging work
  useEffect(() => {
    InitializeSocket();
  }, []);
  async function InitializeSocket() {
    await fetch("api/websocket");
    // NOTE: join room on page load
    if (route.query.room) {
      socket.emit("join_room", {
        room: route.query.room,
      });
    }
    // NOTE: show room number on joining
    socket.on("joined_room", (data) => {
      console.log(data);
    });
    // NOTE: reaction to receiving message from the user
    socket.on("message_received", (data) => {
      setmessages([
        ...messages,
        {
          message: data.message,
          ip: data.ip,
          profileImage: data.profileImage,
        },
      ]);
    });
  }
  return (
    <>
      <Head>
        <title>Suck it </title>
      </Head>
      <main className="main">
        <div className="rooms-btns">
          <h1>Rooms</h1>
          <div className="rooms-center">
            {allRoomsIndex.map((emoji, i) => (
              <button
                key={i}
                onClick={() => {
                  route.push({ query: { room: i + 1 } });
                  socket.emit("join_room", {
                    room: i + 1,
                  });
                }}
              >
                {emoji} Room {i + 1} {emoji}
              </button>
            ))}
          </div>
        </div>

        {route.query.room && (
          <ChatRoom
            ip={user?.ip}
            input={input}
            messages={messages}
            setinput={setinput}
            user={user}
          />
        )}
      </main>
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
      ip: ip || null,
    },
  };
}
async function getDatabs(ip) {
  let r = (Math.random() + 1).toString(36).substring(7);
  let image = `https://api.multiavatar.com/${r}.svg`;
  const docRef = doc(db, "users", ip);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("user exists");
  } else {
    if (ip === null)
      console.log(
        `user dosn't exists and we created a new user with ip of ${ip} and profile image ${image}`
      );
    await setDoc(doc(db, "users", ip), {
      roomNumber: 1,
      profileImage: image,
      ip: ip,
    });
  }
  return docSnap.data();
}