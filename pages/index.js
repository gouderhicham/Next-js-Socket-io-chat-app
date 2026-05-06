import Head from "next/head";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useRouter } from "next/router";
import ChatRoom from "../components/ChatRoom";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { sendIpAddress } from "../lib/sendipfunction";

export default function Index({ ip }) {
  const [animationParent] = useAutoAnimate();
  const route = useRouter();
  const [created, setCreated] = useState(false);
  const [link, setLink] = useState("");

  const [allRoomsIndex, setAllRoomsIndex] = useState([]);
  const [input, setinput] = useState("");
  const [roomInput, setRoomInput] = useState({
    roomName: "",
    private: false,
  });
  const [loading, setloading] = useState(true);
  const [toggled, settoggled] = useState(false);
  const addRoom = () => {
    if (!created && !roomInput.private) {
      setAllRoomsIndex((old) => [...old, roomInput]);
      setCreated(true);
    } else if (!created && roomInput.private) {
      // add room to the database
      setCreated(true);
      route.push({ query: { room: roomInput.roomName } });
      settoggled(true);
      setLink(window.location.href);
    } else {
      alert("you are allowed to create a room only once");
    }
    setRoomInput((old) => ({ ...old, roomName: "" }));
  };
  useEffect(() => {
    async function getdata() {
      const q = query(
        collection(db, "rooms_copy"),
        where("private", "==", false)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((gr) =>
        setAllRoomsIndex((old) => [...old, gr.data()])
      );
    }
    getdata();
    sendIpAddress(ip);  
  }, []);
  async function getRoomsFromDataBase(room) {
    let document = await getDoc(doc(db, "rooms_copy", `${room.roomName}`));
    if (!document.exists()) {
      await setDoc(doc(db, "rooms_copy", `${room.roomName}`), {
        private: room.private,
        roomName: room.roomName,
      });
    }
  }
  return (
    <>
      <Head>
        <title>Chat app | Gouder Hicham</title>
      </Head>
      <button
        onClick={() => {
          settoggled((old) => !old);
        }}
        className="rooms_toggler"
      >
        Show rooms
      </button>
      <main
        ref={animationParent}
        className={`main ${toggled ? "zero" : "hun"}`}
      >
        <div className={`rooms-btns ${toggled ? "not-toggled" : "toggled"}`}>
          <h1>Chat Rooms</h1>
          <div className="rooms-center">
            {allRoomsIndex.map((room) => {
              getRoomsFromDataBase(room);
              return (
                <button
                  key={room.roomName}
                  className={room.roomName}
                  onClick={() => {
                    settoggled(true);
                    if (route.query.room !== room.roomName) {
                      setloading(true);
                    }
                    route.push({ query: { room: room.roomName } });
                  }}
                >
                  {room.roomName}
                </button>
              );
            })}
            <div
              style={{ display: "flex", flexDirection: "row", width: "100%" }}
            >
              <input
                type={"text"}
                value={roomInput.roomName}
                onChange={(e) =>
                  setRoomInput((old) => ({ ...old, roomName: e.target.value }))
                }
                className="input_add"
              />
              <button onClick={addRoom} className="input_add_button">
                <img src="/add.png" />{" "}
              </button>
            </div>
            <div className="checkboxes">
              <div className="input-input">
                <input
                  type="checkbox"
                  name="private"
                  checked={roomInput.private}
                  onChange={(e) => {
                    setRoomInput((old) => ({
                      ...old,
                      private: e.target.checked,
                    }));
                  }}
                />
                <label style={{ color: "white" }} htmlFor="private">
                  private
                </label>
              </div>
              <div className="input-input">
                <input
                  type="checkbox"
                  name="publice"
                  checked={!roomInput.private}
                  onChange={(e) => {
                    setRoomInput((old) => ({
                      ...old,
                      private: !e.target.checked,
                    }));
                  }}
                />
                <label style={{ color: "white" }} htmlFor="public">
                  public
                </label>
              </div>
            </div>
          </div>
        </div>
        {route.query.room && (
          <ChatRoom
            setLink={setLink}
            link={link}
            ip={ip}
            setloading={setloading}
            loading={loading}
            input={input}
            setinput={setinput}
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
