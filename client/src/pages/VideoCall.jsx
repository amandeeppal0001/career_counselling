import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const myVideo = useRef();
  const remoteVideo = useRef();
  const connectionRef = useRef(null);
  const socketRef = useRef(null);
  const myIdRef = useRef(Math.random().toString(36).substring(2, 9));
  const candidatesQueue = useRef([]);

  useEffect(() => {
    let isMounted = true;
    const socket = io('https://careercounselling-production-725b.up.railway.app');
    socketRef.current = socket;
    const myId = myIdRef.current;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        if (!isMounted) {

          currentStream.getTracks().forEach(track => track.stop());
          return;
        }

        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        socket.emit('join-room', roomId, myId);

        socket.on('user-connected', (userId) => {

          callUser(userId, currentStream);
        });

        socket.on('offer', async (offer, senderId) => {

          answerCall(offer, senderId, currentStream);
        });

        socket.on('answer', async (answer, senderId) => {

          if (connectionRef.current) {
            await connectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));

            for (const candidate of candidatesQueue.current) {
              await connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
            }
            candidatesQueue.current = [];
          }
        });

        socket.on('ice-candidate', async (candidate, senderId) => {
          try {
            if (connectionRef.current && connectionRef.current.remoteDescription && connectionRef.current.remoteDescription.type) {
              await connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              candidatesQueue.current.push(candidate);
            }
          } catch (e) {
            console.error('Error adding ICE candidate', e);
          }
        });

        socket.on('user-disconnected', (userId) => {
          if (connectionRef.current) {
            connectionRef.current.close();
            connectionRef.current = null;
          }
          setRemoteStream(null);
          if (remoteVideo.current) {
            remoteVideo.current.srcObject = null;
          }
        });
      })
      .catch((err) => {
        console.error("Failed to get local stream", err);
        if (isMounted) alert("Failed to access camera and microphone");
      });

    return () => {
      isMounted = false;
      setStream(prevStream => {
        if (prevStream) {
          prevStream.getTracks().forEach(track => track.stop());
        }
        return null;
      });
      if (connectionRef.current) {
        connectionRef.current.close();
        connectionRef.current = null;
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [roomId]);

  const createPeerConnection = (senderId, currentStream) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', event.candidate, roomId, myIdRef.current);
      }
    };

    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    currentStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, currentStream);
    });

    return peerConnection;
  };

  useEffect(() => {
    if (remoteVideo.current && remoteStream) {
      remoteVideo.current.srcObject = remoteStream;

      remoteVideo.current.play().catch(error => {
        console.error("Autoplay prevented:", error);

      });
    }
  }, [remoteStream]);

  const callUser = async (userId, currentStream) => {
    const peerConnection = createPeerConnection(userId, currentStream);
    connectionRef.current = peerConnection;

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socketRef.current.emit('offer', offer, roomId, myIdRef.current);
  };

  const answerCall = async (offer, senderId, currentStream) => {
    const peerConnection = createPeerConnection(senderId, currentStream);
    connectionRef.current = peerConnection;

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    for (const candidate of candidatesQueue.current) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
    }
    candidatesQueue.current = [];

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socketRef.current.emit('answer', answer, roomId, myIdRef.current);
  };

  const leaveCall = () => {
    navigate(-1);
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 shadow-sm border-b border-gray-700 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🎥</span> Room: {roomId}
        </h1>
        <div className="text-sm text-gray-400">
          Share link: {window.location.origin + window.location.pathname}
        </div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row items-center justify-center p-4 gap-4 relative">
        <div className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-lg aspect-video">
          {}
          <video 
            playsInline 
            autoPlay 
            ref={remoteVideo} 
            className={`w-full h-full object-cover ${!remoteStream ? 'hidden' : ''}`} 
          />
          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-black">
              Waiting for others to join...
            </div>
          )}

          {}
          <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg">
            <video playsInline muted autoPlay ref={myVideo} className="w-full h-full object-cover" />
          </div>
        </div>
      </main>

      {}
      <div className="bg-gray-800 p-4 flex justify-center gap-4">
        <button 
          onClick={toggleMute}
          className={`p-4 rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'} transition-colors`}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>
        <button 
          onClick={toggleVideo}
          className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'} transition-colors`}
        >
          {isVideoOff ? '🚫' : '📹'}
        </button>
        <button 
          onClick={leaveCall}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full font-bold transition-colors"
        >
          Leave Call
        </button>
      </div>
    </div>
  );
};

export default VideoCall;

