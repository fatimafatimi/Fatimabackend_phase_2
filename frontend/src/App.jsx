// frontend > src > App.jsx
import { useState } from "react";
import useWebRTC from "./hooks/useWebRTC";
import VideoCall from "./components/VideoCall";
import Chat from "./components/Chat";
import "./App.css";

export default function App() {
    const [roomId, setRoomId] = useState("");
    const [roomInput, setRoomInput] = useState("");

    const {
        startCall,
        joinCall,
        endCall,
        sendMessage,
        localStream,
        remoteStream,
        messages,
        dataChannelReady,
        wsReady,
        callState,
    } = useWebRTC();

    // Handlers 

    const handleStart = () => {
        const id = roomInput.trim();
        if (!id) return;
        setRoomId(id);
        startCall(id);
    };

    const handleJoin = () => {
        const id = roomInput.trim();
        if (!id) return;
        setRoomId(id);
        joinCall(id);
    };

    const handleEnd = () => {
        endCall();
        setRoomId("");
        setRoomInput("");
    };

    // Derived UI state 

    const isActive = callState === "calling" || callState === "connected";
    const isEnded  = callState === "ended";

    return (
        <div className="app-shell">
            {/* Header */}
            <header className="app-header">
                <span className="app-logo"></span>
                <h1 className="app-title">WebRTC Studio</h1>
                <div className="status-badges">
                    <span className={`badge ${wsReady ? "badge--green" : "badge--red"}`}>
                        WS {wsReady ? "●" : "○"}
                    </span>
                    <span className={`badge ${dataChannelReady ? "badge--green" : "badge--amber"}`}>
                        DC {dataChannelReady ? "●" : "○"}
                    </span>
                    <span className={`badge badge--state badge--${callState}`}>
                        {callState.toUpperCase()}
                    </span>
                </div>
            </header>

            {/*  Main content  */}
            <main className="app-main">

                {/* Room panel (shown when not in a call) */}
                {!isActive && !isEnded && (
                    <section className="room-panel">
                        <h2 className="panel-heading">Join a Room</h2>
                        <p className="panel-sub">Enter the same Room ID on both devices to connect.</p>

                        <div className="room-row">
                            <input
                                className="room-input"
                                type="text"
                                placeholder="Room ID  (e.g. room-42)"
                                value={roomInput}
                                onChange={(e) => setRoomInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                            />
                        </div>

                        <div className="room-actions">
                            <button
                                className="btn btn--start"
                                onClick={handleStart}
                                disabled={!roomInput.trim()}
                            >
                                Start Call
                            </button>
                            <button
                                className="btn btn--join"
                                onClick={handleJoin}
                                disabled={!roomInput.trim()}
                            >
                                Join Call
                            </button>
                        </div>
                    </section>
                )}

                {/* Ended banner */}
                {isEnded && (
                    <section className="room-panel">
                        <div className="ended-banner">
                            <span className="ended-icon"></span>
                            <h2>Call Ended</h2>
                            <p>The call has been disconnected.</p>
                            <button
                                className="btn btn--start"
                                onClick={() => { setRoomInput(""); }}
                            >
                                New Call
                            </button>
                        </div>
                    </section>
                )}

                {/* Active call layout */}
                {isActive && (
                    <div className="call-layout">
                        <div className="call-meta">
                            <span className="call-room-label">Room: <strong>{roomId}</strong></span>
                            <button className="btn btn--end" onClick={handleEnd}>
                                End Call
                            </button>
                        </div>

                        <div className="call-body">
                            <VideoCall
                                localStream={localStream}
                                remoteStream={remoteStream}
                                callState={callState}
                            />
                            <Chat
                                sendMessage={sendMessage}
                                messages={messages}
                                dataChannelReady={dataChannelReady}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}