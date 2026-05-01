
import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import ChatPanel from '../ChatPanel/ChatPanel';

function Room() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <ChatPanel />
    </div>
  );
}

export default Room;