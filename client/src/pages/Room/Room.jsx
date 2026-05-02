
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import ChatPanel from '../ChatPanel/ChatPanel';

function Room() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/", { replace: true });
    }
  }, [navigate]);
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <ChatPanel />
    </div>
  );
}

export default Room;