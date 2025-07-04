import type { ChatMessage } from '../types/chat';

export const getChatResponse = async (messages: ChatMessage[]): Promise<string> => {
  try {
    console.log('🤖 서버리스 API 호출 시작');
    console.log('사용자 메시지:', messages[messages.length - 1]?.content);
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    console.log('✅ 서버리스 API 응답 성공');
    console.log('응답 내용:', data.content?.substring(0, 100) + '...');

    return data.content || '죄송합니다. 응답을 생성할 수 없습니다. 다시 시도해주세요.';
  } catch (error) {
    console.error('❌ 서버리스 API 오류:', error);
    if (error instanceof Error) {
      console.error('오류 메시지:', error.message);
    }
    return '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.';
  }
};

export const getSuggestedQuestions = async (messages: ChatMessage[]): Promise<string[]> => {
  try {
    console.log('🎯 제안 질문 생성 시작');
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        type: 'suggestions'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.suggestions && Array.isArray(data.suggestions)) {
      console.log('✅ 제안 질문 생성 성공:', data.suggestions);
      return data.suggestions;
    }
    
    // 기본 질문 반환
    return getDefaultQuestions();
  } catch (error) {
    console.error('❌ 제안 질문 생성 오류:', error);
    return getDefaultQuestions();
  }
};

const getDefaultQuestions = (): string[] => {
  return [
    '진료시간 문의',
    '예약 방법',
    '비용 안내'
  ];
};

export const generateInitialMessage = (): string => {
  return `안녕하세요! **MARIA** AI 상담봇입니다. 🏥

**의료법인 마리아의료재단** (**1967년 설립**)에서 도움을 드리겠습니다.
**국내 난임‧IVF 시술 건수 1위** (시장점유율 약 30%)

📍 **본원**: 서울 동대문구 천호대로 20
📞 **대표전화**: **02-2250-5555**
🕒 **운영시간**: 평일 **07:30-16:00** (점심 12-14)

다음과 같은 서비스를 제공합니다:
• **① 진료 예약** - 날짜/시간/의사 선택  
• **② 증상 체크** - 기본 문진 후 내원 권장 여부 안내
• **③ 진료과 안내** - 내과, 산부인과, 소아청소년과, 피부과
• **④ FAQ 답변** - 운영시간, 검사준비, 비용 등
• **⑤ 위치·연락처** - 분원별 상세 정보  
• **⑥ 간호사 연결** - 전문 상담 연결

어떤 도움이 필요하신지 말씀해 주세요 😊`;
}; 