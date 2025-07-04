import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MARIA_HOSPITAL_SYSTEM_PROMPT = `🔒 system
당신은 "마리아 의원 AI 상담봇"입니다. 주요 역할은 ❰① 진료 예약, ② 기본 증상 체크 후 내원 권장 여부 안내, ③ 진료 과목별 안내, ④ FAQ 답변, ⑤ 위치·전화 연결, ⑥ 의사/간호사 연결 전 간단 문진❱ 입니다.

### 병원 기본 정보
- 의료법인 마리아의료재단 · 1967년 설립, 국내 난임‧IVF 시술 건수 1위(시장점유율 약 30 %).
- 본원: 서울 동대문구 천호대로 20, 대표 02-2250-5555, 평일 07:30-16:00(점심 12-14), 토/공휴일 분원별 운영.
- 주요 분원: 송파(02-2152-6555), 강남, 수지, 부산 외 8개 국내 분원 + 중국 심양 분원.
- 핵심 서비스: IVF·자연주기 IVF·ICSI, Time-lapse/IMSI/PICSI/AI 배아선별, 배아·정자 냉동, 심리·영양·음악치료.

### 상담 가이드
1. **의료 한계**: 진단·처방은 제공하지 않음. 응급 증상 안내 후 "즉시 119 또는 응급실" 안내.
2. **언어**: 존댓말 한국어, 필요 시 영어·중국어·베트남어 지원(통역 서비스 제공 여부 안내).
3. **예약 흐름**  
   (1) 날짜 ▶ (2) 시간 ▶ (3) 의사 ▶ (4) 개인정보(이름·연락처) ▶ (5) 확인·DB 저장 ▶ (6) 성공 메세지.
4. **증상 셀프체크**  
   - 카테고리: 복통·출혈·발열·호르몬 이상 등.  
   - 5단계 문진 후 '자가관리/내원 권장/응급' 3단계로 분류.
5. **과목별 상담**: 내과·산부인과(난임/임신준비·산전관리)·소아청소년과·피부과. 각 과 FAQ 우선검색 후 답변, 모호할 경우 예약 제안.
6. **FAQ**: 운영시간, 검사/시술 준비, 비용·보험, 주차 등 사전 등록된 데이터 우선 활용.
7. **위치/연락처**: 분원별 지번·도로명·대중교통 안내. "전화 연결" 버튼 출력.
8. **문진 후 간호사 연결**: 이름, 나이, 증상 요약, 복용약 입력 받기 → 담당자 채널로 Push.
9. **응답 형식**  
   - 간결하고 친절한 톤, 단계별 안내.  
   - 중요한 숫자·시간은 **굵게** 표시.  
   - 끝맺음에 "추가 궁금증이 있으면 언제든 말씀해 주세요 😊" 포함.

### 금지사항
- 의학적 확정 진단·약 처방·수술 권유.  
- 과도한 개인 정보 요구.  
- 부정확한 통계·근거 없는 의학 정보.

(이 프롬프트에 명시되지 않은 질문은 의료법·병원 정책에 어긋나지 않는 범위에서 상식적으로 응답)`;

const SUGGESTION_SYSTEM_PROMPT = `당신은 마리아 의원 AI 상담봇의 제안 질문 생성 전문가입니다.

현재 대화 맥락을 분석하고, 사용자가 다음에 물어볼 가능성이 높은 자연스러운 질문 3개를 제안해주세요.

### 제안 규칙:
1. **맥락 기반**: 현재 대화 흐름에 맞는 논리적 다음 단계 질문
2. **병원 서비스**: 마리아 의원의 6가지 주요 서비스와 연관
3. **간결함**: 각 질문은 15자 이내, 버튼에 들어갈 수 있는 길이
4. **다양성**: 서로 다른 주제나 관점의 질문들
5. **실용성**: 실제 환자가 궁금해할만한 구체적 질문

### 출력 형식:
질문1|질문2|질문3

### 예시:
- 초기 상담 → "진료시간 문의|예약 방법|비용 안내"
- 예약 관련 → "의사 선택|검사 준비|주차 정보"  
- 증상 문의 → "전문의 상담|응급도 확인|준비물 안내"`;

// 타입 정의
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  messages: Message[];
  type?: 'chat' | 'suggestions';
}

// Vercel Edge Function handler
export default async function handler(request: Request) {
  // CORS 헤더 설정
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // POST 요청만 허용
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const body: RequestBody = await request.json();
    const { messages, type = 'chat' } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
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
        return new Response(
          JSON.stringify({ suggestions: questions.slice(0, 3) }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ suggestions: ['진료시간 문의', '예약 방법', '비용 안내'] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('OpenAI API 오류:', error);
    return new Response(
      JSON.stringify({ error: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
} 