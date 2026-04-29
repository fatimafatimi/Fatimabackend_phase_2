# WebRTC Real-Time Communication App

A full-stack **WebRTC-based real-time communication application** built using:

- **Frontend:** React
- **Backend:** FastAPI + WebSocket
- **Communication:** WebRTC (Peer-to-Peer)

This project demonstrates the practical implementation of core WebRTC concepts including signaling, SDP exchange, ICE candidate handling, peer-to-peer media streaming, live chat via DataChannel, room-based communication, and clean connection lifecycle management.

---

# Features

## Peer-to-Peer Audio & Video Calling
- Real-time video and audio communication
- Built using `RTCPeerConnection`
- Uses `getUserMedia()` for camera/microphone access
- Direct peer-to-peer media transmission

---

## WebSocket Signaling Server
- FastAPI WebSocket signaling server
- Handles:
  - Offer exchange
  - Answer exchange
  - ICE candidate exchange
- Enables WebRTC peer negotiation

---

## Room-Based Communication
- Users connect using room IDs
- Signaling messages are isolated per room
- Prevents broadcasting to unrelated users
- Supports proper 1-to-1 communication sessions

Example:
```bash
/ws/{room_id}
````

---

## Live Chat (WebRTC DataChannel)

* Real-time peer-to-peer messaging
* Uses WebRTC DataChannel
* No external chat server required
* Messages update instantly in UI

---

## Chat UI

* Displays sent and received messages
* Separate styling for local and remote messages
* Real-time message rendering
* Message state management using React

---

## Call Termination

* Properly ends active calls
* Cleans up:

  * RTCPeerConnection
  * Media tracks
  * Streams
  * DataChannel
* Prevents memory leaks and stuck camera/mic usage

---

## Connection State Handling

Tracks:

* WebSocket status
* DataChannel status
* Peer connection state

---

# Project Structure

```bash
project-root/
│
├── backend/
│   └── main.py
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       │
│       ├── hooks/
│       │   └── useWebRTC.js
│       │
│       └── components/
│           ├── VideoCall.jsx
│           └── Chat.jsx
```

---

# How WebRTC Works in This Project

## Signaling

FastAPI WebSocket server exchanges:

* SDP Offers
* SDP Answers
* ICE Candidates

---

## Peer Connection

`RTCPeerConnection` establishes:

* Audio stream
* Video stream
* Data channel

---

## ICE Candidate Exchange

Peers exchange ICE candidates to discover the best network path.

Uses:

```javascript
stun:stun.l.google.com:19302
```

---

## DataChannel

Used for:

* Live chat
* Peer-to-peer messaging

---

# WebRTC Flow

```text
Caller
   │
   ├── Create Offer
   │
   ├── Send Offer via WebSocket
   │
Receiver
   │
   ├── Receive Offer
   ├── Create Answer
   ├── Send Answer
   │
Caller
   │
   ├── Receive Answer
   │
Both Peers
   │
   ├── Exchange ICE Candidates
   ├── Establish P2P Connection
   ├── Start Audio/Video
   └── Open DataChannel
```

---

# Setup Instructions

## Clone Repository

```bash
git clone https://github.com/fatimafatimi/Fatimabackend_phase_2
cd WebRTC
```

---

## Backend Setup

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Virtual Environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux/Mac

```bash
source venv/bin/activate
```

---

### Install Dependencies

```bash
pip install fastapi uvicorn
```

---

### Run Backend

```bash
uvicorn main:app --reload
```

Backend runs on:

```bash
http://127.0.0.1:8000
```

---

## Frontend Setup

### Install Dependencies

```bash
npm install
```

---

### Run React App

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# Testing the Application

## Open Two Browser Tabs

### Tab 1

* Enter same room ID
* Click **Start Call**

### Tab 2

* Enter same room ID
* Click **Join Call**

---

# Features to Test

##  Video/Audio

* Camera and microphone streaming

##  Chat

* Send messages between peers

##  Rooms

* Different room IDs should isolate users

##  End Call

* Verify camera/microphone stop correctly

---

# Concepts Learned

This project demonstrates practical understanding of:

* WebRTC Architecture
* Peer-to-Peer Communication
* SDP Offer/Answer Model
* ICE Candidates
* STUN Servers
* WebSocket Signaling
* Media Streaming
* DataChannels
* React State Management
* Connection Lifecycle Handling

---

# Future Improvements

Possible future enhancements:

* TURN Server Integration
* Multi-user Video Calls
* Screen Sharing
* File Sharing
* Authentication
* Call Notifications
* Call Recording
* Better UI/UX
* Mobile Responsiveness
* WebRTC Statistics Monitoring

```
