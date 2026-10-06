# MOA FORMULA 제안서 생성기 (moa-proposal-generator)

## 앱 정보
- 진로모아커리어센터 "면접스킬" 앱 묶음의 하나. 강사가 기관에 보낼 강의 제안서를 만들어 인쇄·PDF로 저장
- Vercel 프로젝트: moa-proposal-generator (https://moa-proposal-generator.vercel.app) / GitHub: jaeemi88
- 파일은 저장소 최상위에 바로 있음 (public 폴더 아님)
  - index.html: 작성 화면 + 제안서 미리보기 / api/config.js: 강사별 기본 템플릿 저장(Redis, t=강사코드로 구분)
  - moa-ui.css·moa-ui.js: 공용 디자인 키트 (작성 화면에만 적용)
- 화면 구분
  - 강사 전용 앱: ?t=강사코드 → staff-guard.js(always 모드) 잠금. 원장님 암호(STAFF_PIN)만 인정 (강사 개인 승인 링크 ?k=는 안 됨)
  - 원장님: ?master=1 (MASTER_ADMIN_PASSWORD)
- 환경변수: REDIS_URL, STAFF_PIN, MASTER_ADMIN_PASSWORD

## 디자인 규칙
- 대표색: 코랄 #D9572B (작성 화면). 화면 톤은 공용 디자인 키트(남색 #141A2E + 라임 #C0D904)
- 출력되는 제안서 문서는 기본 5색 그대로 (디자인 키트를 문서에 적용하지 않음)
- 폰트: Noto Sans KR / 흰 배경 / 상단 "MOA FORMULA" 로고
- 버튼·카드 모양은 다른 면접스킬 앱과 통일
- 학생용 버튼은 대표색 채움, 강사용은 같은 색 테두리 + 자물쇠 아이콘
- 소속 강사 명칭은 "파트너강사" ("파견강사" 사용 금지)

## 반드시 유지할 기능 (2026-10-06 기준, index.html 약 555줄 — 이보다 크게 줄면 옛 버전으로 돌아간 것)
- 제안서 작성 → 실시간 미리보기 → 인쇄·PDF 저장 (renderGenerator, updatePreview, renderProposalPreview, printBtn)
- 강사별 기본 템플릿 설정·서버 저장 (renderSettings, api/config.js)
- 처음 쓰는 강사 코드 설정 (renderTeacherSetup)
- 원장님 화면 (renderMasterScreen)

## 작업 원칙
- 수정 전 항상 현재 저장소의 최신 index.html을 기준으로 작업 (예전 버전 덮어쓰기 금지)
- 수정본은 저장소 최상위에 저장 (이 앱은 public 폴더를 쓰지 않음)
- 수정 후 줄 수가 크게 줄었거나 위 기능이 사라졌으면 작업 중단하고 알릴 것
- api/teacher-registry.js는 모의면접·자소서·트래커·제안서 공용 최신 버전 유지 (같은 Redis 강사 명단·초대코드 공유)
  - 2026-10-06 확인: 이 앱의 파일(261줄)이 자소서·모의면접(398줄)보다 옛 버전. 맞출지는 원장님 확인 후 진행
- staff-guard.js, moa-ui.css, moa-ui.js도 여러 앱 공용 파일. 고칠 때는 다른 앱의 같은 파일과 함께 맞출 것
- 큰 변경은 먼저 계획을 보여주고 승인받은 뒤 진행
- 결과물은 모바일에서도 정상 표시되어야 함
