// frontend > src > hooks > useWebRTC.js
import { useRef, useState, useCallback } from "react";

export default function useWebRTC() {
    const ws = useRef(null);
    const peerConnection = useRef(null);
    const dataChannel = useRef(null);

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [dataChannelReady, setDataChannelReady] = useState(false);
    const [wsReady, setWsReady] = useState(false);
    const [messages, setMessages] = useState([]);          // chat history
    const [callState, setCallState] = useState("idle");    // idle | calling | connected | ended

    const messageQueue = useRef([]);

    const config = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    // HELPERS

    const appendMessage = useCallback((text, sender) => {
        setMessages((prev) => [
            ...prev,
            { id: Date.now() + Math.random(), text, sender, time: new Date().toLocaleTimeString() },
        ]);
    }, []);

    // WEBSOCKET 

    /**
     * Connect to the signaling server for a specific room.
     * @param {string} roomId
     */
    const init = useCallback((roomId) => {
        return new Promise((resolve) => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                setWsReady(true);
                resolve();
                return;
            }

            ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/${roomId}`);

            ws.current.onopen = () => {
                console.log("WebSocket connected to room:", roomId);
                setWsReady(true);
                resolve();
            };

            ws.current.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                await handleSignalingData(data);
            };

            ws.current.onerror = (err) => {
                console.error(" WebSocket error:", err);
                setWsReady(false);
            };

            ws.current.onclose = () => {
                console.log(" WebSocket disconnected");
                setWsReady(false);
            };
        });
    }, []); 
    
    // DATA CHANNEL

    const flushMessageQueue = useCallback(() => {
        while (messageQueue.current.length > 0) {
            const msg = messageQueue.current.shift();
            sendMessage(msg);
        }
    }, []); 

    const setupDataChannel = useCallback(
        (channel) => {
            dataChannel.current = channel;

            channel.onopen = () => {
                console.log(" DataChannel OPEN");
                setDataChannelReady(true);
                setCallState("connected");
                flushMessageQueue();
            };

            channel.onclose = () => {
                console.log(" DataChannel CLOSED");
                setDataChannelReady(false);
            };

            channel.onerror = (err) => console.error("📡 DataChannel ERROR:", err);

            // Incoming messages are pushed into state
            channel.onmessage = (event) => {
                console.log(" Message received:", event.data);
                appendMessage(event.data, "remote");
            };
        },
        [flushMessageQueue, appendMessage]
    );

    // PEER CONNECTION

    const createPeerConnection = useCallback(() => {
        if (peerConnection.current) return;

        peerConnection.current = new RTCPeerConnection(config);
        setDataChannelReady(false);

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate && ws.current?.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({ type: "ice", candidate: event.candidate }));
            }
        };

        peerConnection.current.ontrack = (event) => {
            console.log("🎥 Remote stream received");
            setRemoteStream(event.streams[0]);
        };

        peerConnection.current.ondatachannel = (event) => {
            console.log("📡 Receiver got DataChannel");
            setupDataChannel(event.channel);
        };

        peerConnection.current.onconnectionstatechange = () => {
            const state = peerConnection.current?.connectionState;
            console.log("🔗 Connection state:", state);
            if (state === "disconnected" || state === "failed" || state === "closed") {
                setCallState("ended");
            }
        };
    }, [setupDataChannel]); 

    //  START CALL (CALLER)
    const startCall = useCallback(
        async (roomId) => {
            try {
                setCallState("calling");
                if (!wsReady) await init(roomId);

                createPeerConnection();

                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

                const channel = peerConnection.current.createDataChannel("chat", { ordered: true });
                setupDataChannel(channel);

                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);

                console.log(" Sending offer");
                ws.current.send(JSON.stringify({ type: "offer", offer }));
            } catch (err) {
                console.error(" startCall error:", err);
                setCallState("idle");
            }
        },
        [wsReady, init, createPeerConnection, setupDataChannel]
    );

    //JOIN CALL (RECEIVER)

    const joinCall = useCallback(
        async (roomId) => {
            try {
                setCallState("calling");
                if (!wsReady) await init(roomId);

                createPeerConnection();

                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

                console.log(" Waiting for offer...");
            } catch (err) {
                console.error(" joinCall error:", err);
                setCallState("idle");
            }
        },
        [wsReady, init, createPeerConnection]
    );

    //  END CALL
    const endCall = useCallback(() => {
        console.log(" Ending call...");

        // 1. Notify the remote peer
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: "call-ended" }));
        }

        // 2. Close data channel
        if (dataChannel.current) {
            dataChannel.current.close();
            dataChannel.current = null;
        }

        // 3. Stop all local media tracks
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
        }

        // 4. Close peer connection
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        // 5. Close WebSocket
        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }

        // 6. Reset state
        setLocalStream(null);
        setRemoteStream(null);
        setDataChannelReady(false);
        setWsReady(false);
        setCallState("ended");

        console.log(" Call ended and resources cleaned up");
    }, [localStream]);

    // SIGNALING HANDLER

    const handleSignalingData = useCallback(
        async (data) => {
            // Remote peer left the room (server-sent notification)
            if (data.type === "peer-left" || data.type === "call-ended") {
                console.log(" Remote peer ended the call");
                setCallState("ended");
                setRemoteStream(null);
                setDataChannelReady(false);
                return;
            }

            if (!peerConnection.current) {
                console.warn(" PeerConnection not initialised");
                return;
            }

            try {
                if (data.type === "offer") {
                    console.log(" Offer received");
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                    const answer = await peerConnection.current.createAnswer();
                    await peerConnection.current.setLocalDescription(answer);
                    console.log(" Sending answer");
                    ws.current.send(JSON.stringify({ type: "answer", answer }));
                } else if (data.type === "answer") {
                    console.log(" Answer received");
                    if (peerConnection.current.signalingState !== "have-local-offer") {
                        console.warn("Wrong signaling state:", peerConnection.current.signalingState);
                        return;
                    }
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                    console.log("Answer applied — connection established");
                } else if (data.type === "ice" && data.candidate) {
                    try {
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                    } catch (err) {
                        console.debug("ICE candidate error (may be normal):", err.message);
                    }
                }
            } catch (err) {
                console.error("Signaling error:", err);
            }
        },
        [] 
    );

    // SEND MESSAGE

    const sendMessage = useCallback(
        (msg) => {
            if (!msg || typeof msg !== "string") return;

            const channel = dataChannel.current;

            if (!channel || channel.readyState !== "open") {
                messageQueue.current.push(msg);
                return;
            }

            try {
                channel.send(msg);
                appendMessage(msg, "local");
                console.log("SENT:", msg);
            } catch (err) {
                console.error("Send error:", err);
                messageQueue.current.push(msg);
            }
        },
        [appendMessage]
    );

    // PUBLIC API
    return {
        init,
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
    };
}