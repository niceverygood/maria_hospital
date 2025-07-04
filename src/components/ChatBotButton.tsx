import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ChatBotButtonProps {
  onClick: () => void;
  hasUnreadMessages?: boolean;
}

const ChatBotButton: React.FC<ChatBotButtonProps> = ({ 
  onClick, 
  hasUnreadMessages = false 
}) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-200"
      aria-label="AI 상담 챗봇 열기"
    >
      <MessageCircle size={24} />
      {hasUnreadMessages && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      )}
    </button>
  );
};

export default ChatBotButton; 