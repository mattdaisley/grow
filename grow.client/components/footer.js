import io from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import styles from '../styles/Home.module.css'

let socket;

export default function Footer() {
  const [messages, setMessages] = useState([]);
  const [showSerialLog, setShowSerialLog] = useState(false);
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (showSerialLog) {
      socketInitializer();
    }

    return () => socket && socket.close()
  }, [showSerialLog]);

  const socketInitializer = async () => {
    socket = io("http://localhost:3001");

    socket.on("events", (msg) => {
      setMessages((currentMessages) => [
        ...currentMessages,
        { value: msg, timestamp: new Date(Date.now()).toISOString() },
      ]);
      messagesEndRef.current?.scrollIntoView()
    });
  };

  return (
    <footer className={`${styles.footer} ${!showSerialLog ? styles.footerCollapsed : ""}`}>
      <div className={styles.footerMenu}>
        <div className={styles.footerAction}>
          <button onClick={() => setShowSerialLog(!showSerialLog)}>{showSerialLog ? "hide" : "show"} serial log</button>
        </div>
      </div>
      <div className={styles.log}>
        {showSerialLog && messages.map((message, index) => (
          <div key={index} className={styles.logEntry}>
            <div>{message.timestamp}</div>
            {message.value}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </footer>
  )
}