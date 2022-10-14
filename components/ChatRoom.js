import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { socket } from "../pages/index";
import { setDoc, doc, arrayUnion, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Loader from "../components/Loader";
const ChatRoom = ({
  input,
  messages,
  setinput,
  user,
  ip,
  loading,
  setloading,
}) => {
  const [pare] = useAutoAnimate();
  const [chatmessages, setchatmessages] = useState(messages);
  const lastMsg = useRef(null);
  const route = useRouter();
  async function handleSubmit(e) {
    e.preventDefault();
    setinput("");
    socket.emit("send_message", {
      ip: ip,
      message: input,
      profileImage: user?.profileImage,
    });
    const data = await getDoc(
      doc(db, "rooms", `room_${route.query.room}_messages`)
    );
    if (!data.exists()) {
      await setDoc(doc(db, "rooms", `room_${route.query.room}_messages`), {
        users_message: arrayUnion({
          ip: ip,
          message: input,
          profileImage: user?.profileImage,
        }),
      });
    } else {
      await updateDoc(doc(db, "rooms", `room_${route.query.room}_messages`), {
        users_message: arrayUnion({
          ip: ip,
          message: input,
          profileImage: user?.profileImage,
        }),
      });
    }
  }
  useEffect(() => {
    getChat();
    async function getChat() {
      let data = await getDoc(
        doc(db, "rooms", `room_${route.query.room}_messages`)
      );
      if (data.exists()) {
        setchatmessages(data.data().users_message);
      } else {
        setchatmessages([]);
      }
    }
    setloading(false);
  }, [route.query.room]);
  useEffect(() => {
    setchatmessages((old) => old.concat(messages));
    if (lastMsg.current !== null) {
      lastMsg.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "end",
      });
    }
  }, [messages]);
  return (
    <section className="msger">
      <header className="msger-header">
        <div className="msger-header-title">
          {loading ? "loading..." : ""}
          <i className="fas fa-comment-alt"></i>🔥 Room N{route.query.room}
        </div>
        <div className="msger-header-options">
          <span>
            <i className="fas fa-cog"></i>
          </span>
        </div>
      </header>

      <main ref={pare} className="msger-chat">
        {chatmessages &&
          chatmessages?.map((msg, i) => (
            <div
              ref={chatmessages.length - 1 === i ? lastMsg : null}
              key={i}
              className={`msg ${msg?.ip === ip ? "right-msg" : "left-msg"}`}
            >
              <img className="msg-img" src={msg.profileImage} />
              <div className="msg-bubble">
                <div className="msg-text">{msg.message}</div>
              </div>
            </div>
          ))}
      </main>

      <form className="msger-inputarea" onSubmit={handleSubmit}>
        <input
          type="text"
          className="msger-input"
          placeholder="Enter your message..."
          value={input}
          onChange={(e) => {
            setinput(e.target.value);
          }}
        />
        <button type="submit" className="msger-send-btn">
          Send
        </button>
      </form>
    </section>
  );
};

export default ChatRoom;
