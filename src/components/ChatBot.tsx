import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, Minimize2 } from 'lucide-react';
import type { ChatMessage } from '../types/chat';
import { getChatResponse, generateInitialMessage, getSuggestedQuestions } from '../services/openai';

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
  fullScreen?: boolean;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onToggle, fullScreen = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // 초기 메시지 설정
      const initialMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: generateInitialMessage(),
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 제안 질문 업데이트
  useEffect(() => {
    const updateSuggestedQuestions = async () => {
      if (messages.length > 0) {
        setIsSuggestionsLoading(true);
        try {
          const suggestions = await getSuggestedQuestions(messages);
          setSuggestedQuestions(suggestions);
        } catch (error) {
          console.error('제안 질문 업데이트 오류:', error);
        } finally {
          setIsSuggestionsLoading(false);
        }
      }
    };

    // 메시지가 변경될 때마다 제안 질문 업데이트 (초기 메시지 제외)
    if (messages.length > 1) {
      updateSuggestedQuestions();
    } else if (messages.length === 1) {
      // 초기 상태의 기본 질문들 설정
      setSuggestedQuestions(['진료시간 문의', '예약 방법', '비용 안내']);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await getChatResponse(newMessages);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date()
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  // 전체 화면 모드일 때
  if (fullScreen) {
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`chat-message ${
                message.role === 'user' ? 'chat-message-user' : 'chat-message-bot'
              }`}>
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-brand-100' : 'text-medical-500'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="chat-message chat-message-bot">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-sm text-brand-600">응답 중...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Buttons */}
        <div className="p-4 bg-white border-t">
          <div className="flex flex-wrap gap-2 mb-4">
            {isSuggestionsLoading ? (
              // 제안 질문 로딩 중
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <span className="text-sm text-brand-600">맞춤 질문 생성 중...</span>
              </div>
            ) : (
              // 동적 제안 질문들
              suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(question)}
                  className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-sm hover:bg-brand-100 transition-colors border border-brand-200"
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="궁금한 점을 입력해주세요..."
                className="w-full px-4 py-2 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-brand-50 p-3 text-center border-t border-brand-100">
          <p className="text-xs text-brand-700 font-medium">
            💚 마리아의료재단과 함께하는 건강한 삶 💚
          </p>
          <p className="text-xs text-brand-600 mt-1">
            본 채팅상담은 일반적인 정보를 제공하는 것입니다. 정확한 진단과 치료를 위해서는 전문의 상담을 권해드립니다.
          </p>
        </div>
      </div>
    );
  }

  // 기존 팝업 모드
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-lg shadow-2xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-80 h-96'
      }`}>
        {/* Header */}
        <div className="bg-brand-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            <div>
              <h3 className="font-semibold">MARIA AI 상담</h3>
              <p className="text-xs opacity-90">난임 전문 상담사</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-brand-700 p-1 rounded"
            >
              <Minimize2 size={16} />
            </button>
            <button 
              onClick={onToggle}
              className="hover:bg-brand-700 p-1 rounded"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`chat-message ${
                    message.role === 'user' ? 'chat-message-user' : 'chat-message-bot'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-brand-100' : 'text-medical-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="chat-message chat-message-bot">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-sm text-brand-600">응답 중...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="궁금한 점을 물어보세요..."
                  className="w-full px-4 py-2 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBot; 