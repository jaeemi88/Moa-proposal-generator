// 강사가 설정한 제안서 기본 템플릿(강사 소개, 3단 구성, 공통제공사항, 연락처 등)을
// 서버(Redis)에 저장 — 같은 강사의 모든 기기가 공유
// 강사별로 데이터가 섞이지 않도록 t(강사 코드)로 구분해서 저장함
import Redis from 'ioredis';

let redis;
function getRedis() {
  if (!redis) redis = new Redis(process.env.REDIS_URL);
  return redis;
}

function safeTeacherId(raw) {
  return String(raw || '').trim().toLowerCase().replace(/[^a-z0-9가-힣_-]/g, '').slice(0, 40);
}

const DEFAULT_CONFIG = {
  instructorIntro: "항공승무원 12년, 진로·취업교육 16년의 현장 경험을 압축한 코칭 체계 'MOA\u00A0FORMULA(면접의 공식)' — 이를 자소서 첨삭과 모의면접, 두 AI 프로그램에 담았습니다. 시간이 짧아도 학생 손에 결과물이 남고, 답변을 다듬어가는 과정에서 태도와 자신감까지 달라집니다 — 저희가 지키는 기준입니다.",
  zeroEffortNote: "선생님은 손댈 일이 없습니다 — 학생이 직접 시작해서, 저희 전문 강사의 검수를 거쳐 완성본까지 전달됩니다. 진행 상황 확인이나 검수 부담 없이, 완성된 결과물만 받아보시면 됩니다.",
  basePricePerHour: "17만원",
  aiSystemPricePerStudent: "7,500원",
  tiers: [
    {
      name: "집중형",
      duration: "2시간",
      tag: "핵심만 압축한 단회 특강",
      content: "핵심 내용 (택1)\nA. 1분 자기소개 완성\nB. AI 활용 자소서 1문항 완성",
      output: "완성된 자기소개 스피치\n또는 첨삭 완료된 자소서 1문항",
      target: "시간이 매우 제한적인\n단회성 진로특강"
    },
    {
      name: "기본형",
      duration: "3~4시간",
      tag: "완결도와 효율의 균형",
      content: "자소서 작성요령 → 첨삭 실습\n이미지메이킹 → 꼬리질문 대응\n모의면접 1회",
      output: "첨삭 완료된 자소서\n+ 모의면접 AI 피드백 리포트",
      target: "반나절 특강,\n취업동아리·집중과정"
    },
    {
      name: "심화형",
      duration: "4회 이상",
      tag: "성장 과정을 담은 연속 프로그램",
      content: "자기이해 진단부터\nAI 코칭 시스템(자소서 첨삭·모의면접)\n전체 이용 + 반복 피드백,\n포부 설계까지 전 과정",
      output: "완성 자소서 + 1차/2차 비교\n피드백 + 만족도 데이터",
      target: "청년성장프로젝트 등\n정식 취업지원사업"
    }
  ],
  commonPoints: [
    "AI 초안 + 강사 검수를 교육 시간 안에 완결",
    "전공·직무별 맞춤 평가기준 적용 가능",
    "면접관 시점 추론 + 꼬리질문 예상 코멘트 포함"
  ],
  flexNote: "위 세 구성은 하나의 기준일 뿐입니다. 학교·기관의 시간과 여건에 맞춰, 내용과 순서는 얼마든지 새롭게 구성해드립니다.",
  instructorName: "진로모아커리어센터 대표 차재임",
  instructorCred: "항공승무원 12년 경력 · 대학 겸임교수 · MOA FORMULA 개발",
  contactPhone: "010-6540-1524",
  contactEmail: "jinromoa@naver.com"
};

export default async function handler(req, res) {
  const client = getRedis();
  const t = safeTeacherId(req.query.t);
  if (!t) return res.status(400).json({ error: 't(강사 코드) 파라미터가 필요합니다.' });

  const key = `proposal_app_config:${t}`;

  if (req.method === 'GET') {
    const raw = await client.get(key);
    const saved = raw ? JSON.parse(raw) : {};
    const config = { ...DEFAULT_CONFIG, ...saved };
    return res.status(200).json({ config });
  }

  if (req.method === 'POST') {
    await client.set(key, JSON.stringify(req.body));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'GET 또는 POST만 허용됩니다.' });
}
