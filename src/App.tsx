import React, { useState } from 'react';
import ChatBot from './components/ChatBot';

function App() {
  const [isChatOpen] = useState(true); // 챗봇을 항상 열어둠

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-brand-800 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {/* MARIA 로고 */}
          <div className="flex items-center gap-3">
            <div className="bg-brand-950 px-4 py-2 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold tracking-wider text-white">MARIA</h1>
            </div>
            <div>
              <p className="text-sm text-brand-100">AI 상담챗봇</p>
            </div>
          </div>
        </div>
      </header>

      {/* Contact Info */}
      <div className="bg-brand-700 text-white p-3">
        <div className="max-w-4xl mx-auto text-sm space-y-1">
          <div className="flex items-center gap-2">
            <span>📞</span>
            <span>전화상담: 02-2250-5555</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🕒</span>
            <span>평일 07:30-16:00 (점심 12-14) | 토/공휴일 분원별 운영</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>본원: 서울 동대문구 천호대로 20 | 분원: 송파, 강남, 수지, 부산 등</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <ChatBot 
            isOpen={isChatOpen} 
            onToggle={() => {}} 
            fullScreen={true}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
