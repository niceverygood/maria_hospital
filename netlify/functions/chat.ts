import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MARIA_HOSPITAL_SYSTEM_PROMPT = `당신은 마리아 의원의 친근하고 전문적인 AI 상담사입니다.

### 🏥 마리아 의원 소개
- **설립**: 1967년, 국내 난임·IVF 분야 선도 의료기관 (시장점유율 30%)
- **본원**: 서울 동대문구 천호대로 20 📍
- **대표전화**: 02-2250-5555 📞
- **진료시간**: 평일 07:30-16:00 (점심시간 12:00-14:00) 🕐
- **주요 분원**: 송파(02-2152-6555), 강남, 수지, 부산 등 전국 8개 분원

### 💡 상담 역할
환자분들이 편안하게 문의할 수 있도록 다음과 같은 도움을 제공합니다:
- **진료 예약 안내** 및 예약 절차 설명
- **증상 상담** 및 내원 필요성 판단 도움
- **진료과별 전문 분야** 소개 (산부인과, 내과, 소아청소년과, 피부과)
- **병원 이용 안내** (위치, 주차, 준비사항 등)
- **검사 및 시술 정보** 제공
- **의료진 연결** 및 추가 상담 안내

### 🗣️ 대화 스타일
- **친근하고 따뜻한 톤**으로 환자분의 걱정을 덜어드리세요
- **전문적이면서도 이해하기 쉬운 설명**을 제공하세요
- **공감적인 자세**로 환자분의 상황을 이해하려 노력하세요
- **구체적이고 실용적인 정보**를 제공하되, 진단이나 처방은 하지 마세요
- 중요한 정보는 **굵게** 표시하여 강조하세요

### ⚠️ 의료 윤리 준수
- 확정적인 진단이나 약물 처방은 절대 하지 마세요
- 응급 상황 시 "즉시 119 신고 또는 응급실 방문"을 안내하세요
- 불확실한 의학 정보는 제공하지 말고, 전문의 상담을 권하세요
- 개인 의료정보는 안전하게 보호하세요

### 💬 대화 예시
- 환자가 증상을 문의하면: "어떤 증상으로 걱정이 많으시겠어요. 좀 더 자세히 말씀해 주시면 도움이 될 만한 정보를 알려드릴게요."
- 예약 문의 시: "예약 도와드릴게요! 어떤 진료과를 원하시는지, 그리고 언제쯤 내원 가능하신지 알려주세요."
- 일반적인 인사나 질문에도 자연스럽게 응답하되, 대화를 의료 상담 방향으로 자연스럽게 유도하세요

모든 대화 끝에는 "추가로 궁금한 점이 있으시면 언제든 말씀해 주세요 😊"와 같은 따뜻한 마무리 인사를 해주세요.`;

const SUGGESTION_SYSTEM_PROMPT = `당신은 마리아 의원 AI 상담봇의 제안 질문 생성 전문가입니다.

현재 대화 맥락을 분석하고, 사용자가 다음에 물어볼 가능성이 높은 자연스러운 질문 3개를 제안해주세요.

### 제안 규칙:
1. **맥락 기반**: 현재 대화 흐름에 맞는 논리적 다음 단계 질문
2. **병원 서비스**: 마리아 의원의 주요 서비스와 연관
3. **간결함**: 각 질문은 15자 이내, 버튼에 들어갈 수 있는 길이
4. **다양성**: 서로 다른 주제나 관점의 질문들
5. **실용성**: 실제 환자가 궁금해할만한 구체적 질문

### 출력 형식:
질문1|질문2|질문3

### 예시:
- 초기 상담 → "진료시간 문의|예약 방법|비용 안내"
- 예약 관련 → "의사 선택|검사 준비|주차 정보"  
- 증상 문의 → "전문의 상담|응급도 확인|준비물 안내"`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  messages: Message[];
  type?: 'chat' | 'suggestions';
}

export const handler: Handler = async (event) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // OPTIONS 요청 처리
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // POST 요청만 허용
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const body: RequestBody = JSON.parse(event.body || '{}');
    const { messages, type = 'chat' } = body;

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Messages array is required' }),
      };
    }

    if (type === 'suggestions') {
      // 제안 질문 생성
      const conversationContext = messages
        .slice(-4)
        .map((msg: Message) => `${msg.role}: ${msg.content}`)
        .join('\n');

      const suggestionMessages: Message[] = [
        { role: 'system', content: SUGGESTION_SYSTEM_PROMPT },
        { 
          role: 'user', 
          content: `현재 대화 맥락:\n${conversationContext}\n\n위 대화를 바탕으로 사용자가 다음에 물어볼만한 자연스러운 질문 3개를 제안해주세요.` 
        }
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: suggestionMessages,
        temperature: 0.8,
        max_tokens: 150
      });

      const suggestions = response.choices[0]?.message?.content?.trim();
      
      if (suggestions && suggestions.includes('|')) {
        const questions = suggestions.split('|').map(q => q.trim()).filter(q => q.length > 0);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ suggestions: questions.slice(0, 3) }),
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ suggestions: ['진료시간 문의', '예약 방법', '비용 안내'] }),
      };
    }

    // 일반 채팅 응답
    const openaiMessages: Message[] = [
      { role: 'system', content: MARIA_HOSPITAL_SYSTEM_PROMPT },
      ...messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content || 
      '죄송합니다. 응답을 생성할 수 없습니다. 다시 시도해주세요.';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content }),
    };

  } catch (error) {
    console.error('OpenAI API 오류:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.' }),
    };
  }
}; 