// 강사가 설정한 제안서 기본 템플릿(강사 소개, 3단 구성, 공통제공사항, 연락처 등)을
// 서버(Redis)에 저장 — 같은 강사의 모든 기기가 공유
// 강사별로 데이터가 섞이지 않도록 t(강사 코드)로 구분해서 저장함
// 보안 (2026-09-25): 강사 전용 앱이므로 조회·저장 모두 강사용 암호(STAFF_PIN) 필요
import Redis from 'ioredis';
import { isStaff } from './_staff.js';

let redis;
function getRedis() {
  if (!redis) redis = new Redis(process.env.REDIS_URL);
  return redis;
}

function safeTeacherId(raw) {
  return String(raw || '').trim().toLowerCase().replace(/[^a-z0-9가-힣_-]/g, '').slice(0, 40);
}

const DEFAULT_CONFIG = {
  instructorIntro: "항공승무원과 진로·취업교육 현장의 경험을 바탕으로 정립한 코칭 체계 'MOA\u00A0FORMULA(면접의 공식)'를 자소서 첨삭과 모의면접 두 가지 AI 프로그램으로 구현하였습니다. 짧은 교육 시간에도 학생별 결과물을 완성하며, 답변을 다듬는 과정에서 태도와 자신감의 향상을 함께 도모합니다.",
  zeroEffortNote: "학생이 직접 참여하고 전문 강사의 검수를 거쳐 완성본까지 제공합니다. 담당 선생님께서는 별도의 진행 관리나 검수 없이 결과물만 확인하시면 됩니다.",
  basePricePerHour: "17만원",
  aiSystemPricePerStudent: "7,500원",
  tiers: [
    {
      name: "집중형",
      duration: "2시간",
      tag: "핵심 내용 중심의 단회 특강",
      content: "핵심 내용 (택1)\nA. 1분 자기소개 완성\nB. AI 활용 자소서 1문항 완성",
      output: "완성된 자기소개 스피치\n또는 첨삭 완료된 자소서 1문항",
      target: "시간이 매우 제한적인\n단회성 진로특강"
    },
    {
      name: "기본형",
      duration: "3~4시간",
      tag: "완성도와 효율을 함께 고려한 구성",
      content: "자소서 작성요령 → 첨삭 실습\n이미지메이킹 → 꼬리질문 대응\n모의면접 1회",
      output: "첨삭 완료된 자소서\n+ 모의면접 AI 피드백 리포트",
      target: "반나절 특강,\n취업동아리·집중과정"
    },
    {
      name: "심화형",
      duration: "4회 이상",
      tag: "성장 과정을 담은 연속 프로그램",
      content: "자기이해 진단부터\nAI 코칭 시스템(자소서 첨삭·모의면접)\n전체 이용 + 반복 피드백,\n포부 설계까지 전 과정",
      output: "완성 자소서, 1·2차 비교 피드백,\n만족도 조사 결과",
      target: "청년성장프로젝트 등\n정규 취업지원사업"
    }
  ],
  commonPoints: [
    "AI 초안 작성과 강사 검수를 교육 시간 내 완료",
    "전공·직무별 맞춤 평가기준 적용 가능",
    "면접관 관점의 답변 분석 및 예상 꼬리질문 제공"
  ],
  flexNote: "위 세 가지 구성은 기본안입니다. 학교·기관의 일정과 여건에 맞추어 내용과 순서를 조정하여 구성해 드립니다.",
  instructorName: "진로모아커리어센터 대표 차재임",
  instructorCred: "항공승무원 출신 · 대학 겸임교수 · MOA FORMULA 개발",
  contactPhone: "010-6540-1524",
  contactEmail: "jinromoa@naver.com"
};

export default async function handler(req, res) {
  const client = getRedis();
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (!(await isStaff(req, client))) return res.status(401).json({ error: '강사용 암호가 필요합니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '확인 중 오류가 발생했습니다.' });
  }

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
