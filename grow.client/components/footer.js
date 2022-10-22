import io from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import styles from '../styles/Home.module.css'

let socket;

export default function Footer() {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null)

  useEffect(() => {
    socketInitializer();

    return () => socket && socket.close()
  }, []);

  const socketInitializer = async () => {
    socket = io("http://pi-mower:3001");

    socket.on("events", (msg) => {
      console.log(msg);
      setMessages((currentMessages) => [
        ...currentMessages,
        msg,
      ]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    });
  };

  return (
    <footer className={styles.footer}>
      {messages.map((message, index) => <div key={index}>{message}</div>)}
      <div ref={messagesEndRef} />
    </footer>
  )
}