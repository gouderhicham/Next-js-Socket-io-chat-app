import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import {
  setDoc,
  doc,
  arrayUnion,
  updateDoc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAutoAnimate } from "@formkit/auto-animate/react";
const ChatRoom = ({ link, input, setinput, user, ip, loading,setLink,setloading }) => {
  const [pare] = useAutoAnimate();
  const [chatmessages, setchatmessages] = useState();
  const lastMsg = useRef(null);
  const route = useRouter();

  async function handleSubmit(e) {
    if (ip === null) {
      alert("your ip is not stored yet please refresh page ");
    }
    if (ip === null) return;
    e.preventDefault();
    const data = await getDoc(
      doc(db, "rooms", `room_${route.query.room}_messages`)
    );
    if (!data.exists()) {
      await setDoc(doc(db, "rooms", `room_${route.query.room}_messages`), {
        [route.query.room]: arrayUnion({
          ip: ip,
          message: input,
          profileImage: user?.profileImage,
        }),
      });
    } else {
      await updateDoc(doc(db, "rooms", `room_${route.query.room}_messages`), {
        [route.query.room]: arrayUnion({
          ip: ip,
          message: input,
          profileImage: user?.profileImage,
        }),
      });
    }

    setinput("");
  }
  useEffect(() => {
    onSnapshot(doc(db, "rooms", `room_${route.query.room}_messages`), (doc) => {
      if (doc.exists()) {
        setchatmessages(doc.data()[route.query.room]);
        setloading(false);
      } else {
        setchatmessages([]);
        setloading(false);
      }
    });
  }, [route.query]);
  useEffect(() => {
    if (lastMsg.current !== null) {
      setTimeout(() => {
        lastMsg.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "end",
        });
      }, 5);
    }
  }, [chatmessages]);
  return (
    <section className="msger">
      <header className="msger-header">
        <div className="msger-header-title">
          {loading ? (
            <div className="loader"></div>
          ) : (
            <>
              {link ? (
                <p
                  onClick={(e) => {
                    console.log(e.target.textContent);
                    navigator.clipboard.writeText(window.location.href);
                    setLink(null)
                  }}
                  style={{
                    padding: "0.4rem 0.2rem",
                    borderRadius: "5px",
                    backgroundColor: "#3240FF",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Copy room link
                </p>
              ) : (
                `${route.query.room} room `
              )}
            </>
          )}
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
