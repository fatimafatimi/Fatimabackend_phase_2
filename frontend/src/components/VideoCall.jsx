// frontend > src > components > VideoCall.jsx
export default function VideoCall({ localStream, remoteStream, callState }) {
    return (
        <div className="video-panel">
            <div className="video-grid">
                {/* Remote video — large */}
                <div className="video-slot video-slot--remote">
                    <video
                        className="video-el"
                        autoPlay
                        playsInline
                        ref={(el) => { if (el && remoteStream) el.srcObject = remoteStream; }}
                    />
                    {!remoteStream && (
                        <div className="video-placeholder">
                            <span className="video-placeholder-icon">👤</span>
                            <p>{callState === "calling" ? "Waiting for peer…" : "No remote video"}</p>
                        </div>
                    )}
                    <span className="video-label">Remote</span>
                </div>

                {/* Local video — picture-in-picture */}
                <div className="video-slot video-slot--local">
                    <video
                        className="video-el"
                        autoPlay
                        muted
                        playsInline
                        ref={(el) => { if (el && localStream) el.srcObject = localStream; }}
                    />
                    {!localStream && (
                        <div className="video-placeholder video-placeholder--sm">
                            <span></span>
                        </div>
                    )}
                    <span className="video-label">You</span>
                </div>
            </div>
        </div>
    );
}