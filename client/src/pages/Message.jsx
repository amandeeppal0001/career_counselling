import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5002');

function Message({ user: propUser }) {
  const { id: otherUserId } = useParams();
  const navigate = useNavigate();

  const [user] = useState(() => {
    return propUser || JSON.parse(localStorage.getItem("user")) || null;
  });

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
      return;
    }

    socket.emit('join-chat', user._id);

    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5002/api/messages/history/${user._id}/${otherUserId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchHistory();

    const handleReceive = (message) => {
      if (message.sender._id === otherUserId || message.sender === otherUserId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleSent = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('receive-message', handleReceive);
    socket.on('message-sent', handleSent);

    return () => {
      socket.off('receive-message', handleReceive);
      socket.off('message-sent', handleSent);
    };
  }, [user, otherUserId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socket.emit('send-message', {
      sender: user._id,
      receiver: otherUserId,
      text: newMessage
    });
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-4xl mx-auto shadow-xl">
      {}
      <div className="bg-white px-6 py-4 border-b flex items-center gap-4 shadow-sm z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          ← Back
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">Conversation</h2>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400 italic">
            No messages yet. Send a message to start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const senderId = msg.sender?._id || msg.sender;
            const isMe = String(senderId) === String(user._id);

            return (
              <div key={msg._id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="flex flex-col max-w-[70%]">
                  <span className={`text-xs mb-1 px-1 ${isMe ? 'text-right text-gray-500' : 'text-left text-gray-500'}`}>
                    {isMe ? 'You' : (msg.sender?.name || (msg.sender?.role === 'counselor' || msg.sender?.role === 'counsellor' ? 'Counsellor' : 'Student'))}
                  </span>
                  <div className={`rounded-2xl px-5 py-3 shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'}`}>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {}
      <div className="bg-white p-4 border-t">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white rounded-full px-6 py-3 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Message;
