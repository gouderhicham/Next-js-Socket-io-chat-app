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
import { sendIpAddress } from "../lib/sendipfunction";

const ChatRoom = ({
  link,
  input,
  setinput,
  ip,
  loading,
  setLink,
  setloading,
}) => {
  const [pare] = useAutoAnimate();
  const [chatmessages, setchatmessages] = useState();
  const [messageLimit, setMessageLimit] = useState(7); // Track message limit
  const lastMsg = useRef(null);
  const route = useRouter();
  const image = `https://api.multiavatar.com/${ip}.svg`;

  async function handleSubmit(e) {
    e.preventDefault();
    const data = await getDoc(
      doc(db, "rooms", `room_${route.query.room}_messages`)
    );
    if (!data.exists()) {
      await setDoc(doc(db, "rooms", `room_${route.query.room}_messages`), {
        [route.query.room]: arrayUnion({
          ip: ip,
          message: input,
          profileImage: `https://api.multiavatar.com/${ip}.svg`,
        }),
      });
    } else {
      await updateDoc(doc(db, "rooms", `room_${route.query.room}_messages`), {
        [route.query.room]: arrayUnion({
          ip: ip,
          message: input,
          profileImage: image,
        }),
      });
    }
    setinput("");
  }

  useEffect(() => {
    const messagesRef = doc(db, "rooms", `room_${route.query.room}_messages`);
    const unsubscribe = onSnapshot(messagesRef, (doc) => {
      if (doc.exists()) {
        const messages = doc.data()[route.query.room];
        const sortedMessages = messages
          .reverse()
          .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds) // Sort by timestamp (newest first)
          .slice(0, messageLimit) // Limit to the current messageLimit
          .reverse(); // Reverse to show newest at the bottom
        setchatmessages(sortedMessages);
        setloading(false);
      } else {
        setchatmessages([]);
        setloading(false);
      }
    });
    sendIpAddress(ip);
    return () => unsubscribe();
  }, [route.query, messageLimit]);

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
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("link copied");
                    setLink(null);
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
        {chatmessages && chatmessages.length > 0 && (
          <button
            onClick={() => setMessageLimit((prev) => prev + 7)} // Increase the limit by 7
            style={{
              display: "block",
              margin: "0 auto",
              padding: "0.5rem 1rem",
              backgroundColor: "#3240FF",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Show older messages
          </button>
        )}
        {chatmessages &&
          chatmessages.map((msg, i) => (
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
        <textarea
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
