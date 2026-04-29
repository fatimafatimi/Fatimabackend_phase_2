// frontend > src > components > Chat.jsx
import { useState, useEffect, useRef } from "react";

export default function Chat({ sendMessage, messages, dataChannelReady }) {
    const [input, setInput] = useState("");
    const bottomRef = useRef(null);

    // Auto-scroll to the latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        const text = input.trim();
        if (!text || !dataChannelReady) return;
        sendMessage(text);
        setInput("");
    };

    return (
        <div className="chat-panel">
            <div className="chat-header">
                <span className="chat-title"> Chat</span>
                {!dataChannelReady && (
                    <span className="chat-status"> Connecting…</span>
                )}
            </div>

            {/* Message list */}
            <div className="chat-messages">
                {messages.length === 0 && (
                    <p className="chat-empty">No messages yet. Say hi! </p>
                )}

                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`bubble ${m.sender === "local" ? "bubble--local" : "bubble--remote"}`}
                    >
                        <span className="bubble-text">{m.text}</span>
                        <span className="bubble-time">{m.time}</span>
                    </div>
                ))}

                <div ref={bottomRef} />
            </div>

            {/* Input row */}
            <div className="chat-input-row">
                <input
                    className="chat-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={dataChannelReady ? "Type a message…" : "Waiting for connection…"}
                    disabled={!dataChannelReady}
                />
                <button
                    className="btn btn--send"
                    onClick={handleSend}
                    disabled={!input.trim() || !dataChannelReady}
                >
                    Send ➤
                </button>
            </div>
        </div>
    );
}