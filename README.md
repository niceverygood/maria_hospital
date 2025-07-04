# 🏥 마리아 병원 AI 챗봇

마리아 병원 난임 전문 AI 챗봇 - OpenAI API를 활용한 병원 홈페이지 통합 챗봇

## 📋 프로젝트 소개

마리아 병원은 난임 전문 병원으로, 환자들이 24시간 언제든지 상담받을 수 있는 AI 챗봇을 제공합니다. OpenAI GPT-3.5 Turbo를 활용하여 난임 관련 정보 제공, 병원 예약 안내, 심리적 지원 등을 제공합니다.

## ✨ 주요 기능

- 🤖 **OpenAI API 기반 AI 챗봇**: GPT-3.5 Turbo를 활용한 자연스러운 대화
- 🏥 **난임 전문 상담**: 난임 치료 과정, 검사 정보, 준비사항 안내
- 📅 **병원 예약 안내**: 진료 예약 및 병원 정보 제공
- 💝 **심리적 지원**: 따뜻하고 공감적인 대화로 환자 불안감 완화
- 📱 **반응형 디자인**: 모바일과 데스크톱 모두 최적화된 UI
- 🎨 **현대적 UI/UX**: TailwindCSS를 활용한 깔끔한 디자인

## 🛠️ 기술 스택

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **AI**: OpenAI GPT-3.5 Turbo
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🚀 시작하기

### 1. 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd maria-hospital-chatbot

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 `http://localhost:8000`에서 실행됩니다.

### 4. 빌드

```bash
npm run build
```

## 🌐 배포

### Vercel 배포

1. **Vercel 계정 생성**: [vercel.com](https://vercel.com)에서 계정 생성
2. **프로젝트 가져오기**: GitHub 저장소 연결
3. **환경 변수 설정**: 
   - `VITE_OPENAI_API_KEY`: OpenAI API 키 설정
4. **배포**: 자동으로 빌드 및 배포 진행

## 📁 프로젝트 구조

```
maria-hospital-chatbot/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── ChatBot.tsx      # 메인 챗봇 컴포넌트
│   │   └── ChatBotButton.tsx # 챗봇 버튼 컴포넌트
│   ├── services/            # API 서비스
│   │   └── openai.ts        # OpenAI API 서비스
│   ├── types/               # TypeScript 타입 정의
│   │   └── chat.ts          # 챗봇 관련 타입
│   ├── App.tsx              # 메인 앱 컴포넌트
│   ├── main.tsx             # 앱 진입점
│   └── index.css            # 전역 스타일
├── public/                  # 정적 파일
├── .env.example             # 환경 변수 예시
├── vercel.json              # Vercel 배포 설정
├── tailwind.config.js       # TailwindCSS 설정
├── vite.config.ts           # Vite 설정
└── package.json             # 프로젝트 설정
```

## 🎨 디자인 시스템

### 색상 팔레트

- **Primary**: 블루 계열 (#0ea5e9)
- **Medical**: 그레이 계열 (#64748b)
- **Accent**: 의료진 테마 색상

### 컴포넌트 클래스

```css
.chat-message       /* 채팅 메시지 기본 스타일 */
.chat-message-user  /* 사용자 메시지 */
.chat-message-bot   /* 봇 메시지 */
.chat-input         /* 채팅 입력 필드 */
.btn-primary        /* 기본 버튼 */
```

## 🔧 커스터마이징

### AI 프롬프트 수정

`src/services/openai.ts`에서 `MARIA_HOSPITAL_SYSTEM_PROMPT`를 수정하여 AI 응답 스타일을 변경할 수 있습니다.

### 디자인 변경

`tailwind.config.js`에서 색상 테마를 변경하고, `src/index.css`에서 커스텀 클래스를 수정할 수 있습니다.

## 📊 성능 최적화

- **코드 스플리팅**: 자동 코드 분할로 초기 로딩 시간 단축
- **이미지 최적화**: Vite 빌드 시 이미지 최적화
- **CSS 최적화**: TailwindCSS 퍼지로 사용되지 않는 스타일 제거
- **API 응답 캐싱**: 브라우저 캐싱 활용

## 🔒 보안 고려사항

- **API 키 보호**: 환경 변수를 통한 API 키 관리
- **클라이언트 측 제한**: OpenAI API 사용량 모니터링 필요
- **데이터 보호**: 개인정보 수집 최소화

## 🐛 문제 해결

### 자주 발생하는 문제

1. **API 키 오류**: `.env` 파일에 올바른 OpenAI API 키 설정 확인
2. **CORS 오류**: 개발 환경에서 프록시 설정 확인
3. **빌드 오류**: TypeScript 타입 오류 확인

### 디버깅

```bash
# 린트 검사
npm run lint

# 타입 검사
npm run build
```

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

마리아 병원 AI 챗봇 관련 문의:
- 이메일: info@maria-hospital.com
- 전화: 02-1234-5678

---

💝 **마리아 병원에서 새로운 희망을 함께 만들어가겠습니다**
