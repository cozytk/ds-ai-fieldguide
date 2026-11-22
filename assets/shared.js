const esc = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const n2 = (n) => String(n).padStart(2, "0");
const slide = (section, title, lead, body, note, refs = []) => ({
  section,
  title,
  lead,
  body,
  note,
  refs,
});
const sources = {
  rules: ["OpenCode · 지침", "https://opencode.ai/docs/rules/"],
  skills: ["OpenCode · 스킬", "https://opencode.ai/docs/skills/"],
  mcp: [
    "MCP · 도구 서버 만들기",
    "https://modelcontextprotocol.io/docs/develop/build-server",
  ],
  ocMcp: ["OpenCode · MCP 연결", "https://opencode.ai/docs/mcp-servers/"],
  cli1: [
    "OpenCode 1.17 · MCP CLI 소스",
    "https://github.com/anomalyco/opencode/blob/v1.17.15/packages/opencode/src/cli/cmd/mcp.ts",
  ],
  xl: [
    "xlwings · 열린 통합 문서에 연결",
    "https://docs.xlwings.org/en/stable/connect_to_workbook.html",
  ],
  ref1: [
    "참고 강의 · 지침과 스킬",
    "https://vibe-coding.euiyun.com/agent-skills/",
  ],
  ref2: ["참고 강의 · 문서와 RAG", "https://vibe-coding.euiyun.com/knowledge/"],
  ref3: ["참고 강의 · 도구 연결", "https://vibe-coding.euiyun.com/automation/"],
  rag: ["Lewis 외 · RAG 원 논문", "https://arxiv.org/abs/2005.11401"],
  tok: [
    "Hugging Face · 토큰화",
    "https://huggingface.co/docs/tokenizers/pipeline",
  ],
  klue: ["KLUE · BERT 토크나이저", "https://huggingface.co/klue/bert-base"],
  e5: [
    "intfloat · multilingual-e5-small",
    "https://huggingface.co/intfloat/multilingual-e5-small",
  ],
  search: [
    "Sentence Transformers · 의미 검색",
    "https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html",
  ],
  db: ["pgvector · 벡터 검색", "https://github.com/pgvector/pgvector"],
  sql: ["SQLite · 집계 함수", "https://www.sqlite.org/lang_aggfunc.html"],
};
const glossary = {
  OpenCode: "파일을 읽고 도구를 호출하며 작업하는 코드 에이전트입니다.",
  "코드 에이전트":
    "언어 모델의 판단에 따라 파일 읽기나 프로그램 실행 같은 도구를 쓰는 소프트웨어입니다.",
  LLM: "대규모 언어 모델. 전달받은 텍스트를 바탕으로 다음 토큰을 예측하며 답을 만듭니다.",
  프롬프트: "모델에 이번 일을 요청하는 지시와 참고 자료입니다.",
  "NASCA DRM":
    "이 실습 사례에서 Office 문서를 보호하고 열람 권한을 관리하는 사내 프로그램입니다.",
  DRM: "Digital Rights Management. 문서 열람 등 사용 권한을 관리하는 기술입니다.",
  COM: "Windows에서 한 프로그램이 다른 프로그램의 기능을 호출할 때 쓰는 인터페이스입니다.",
  xlwings:
    "Python에서 데스크톱 Excel을 조작하고 셀 값을 읽을 수 있게 해 주는 라이브러리입니다.",
  "AGENTS.md":
    "OpenCode가 작업할 때 참고하는 지속적인 지침을 담은 Markdown 파일입니다.",
  "SKILL.md": "스킬의 이름·설명과 작업 절차를 담은 Markdown 파일입니다.",
  스킬: "특정 일을 할 때 불러오는 절차입니다. 관련 예제와 스크립트를 함께 둘 수 있습니다.",
  로컬: "이 교안에서는 특정 프로젝트나 그 하위 작업 폴더에 적용하는 범위입니다.",
  글로벌:
    "이 Windows 사용자 계정의 OpenCode 프로젝트들에 걸쳐 쓰는 범위입니다.",
  컨텍스트:
    "모델이 이번 응답을 만들 때 볼 수 있는 지침·대화·도구 결과 등의 입력입니다.",
  "Agent Factory":
    "수강 환경에서 구성원이 만든 에이전트 스킬을 찾아볼 수 있는 사내 공유 공간입니다.",
  MCP: "Model Context Protocol. 에이전트 앱과 도구 서버가 기능을 알리고 호출 결과를 주고받는 표준입니다.",
  "DS Search MCP":
    "강의에서 사용하는 사내 검색 연결입니다. DSDN과 Confluence의 접근 가능한 자료를 찾는 데 씁니다.",
  DSDN: "강의 환경에서 개발·기술 경험을 검색하는 사내 지식 공유 서비스입니다.",
  Confluence: "팀 문서와 업무 지식을 페이지로 모아두는 협업 위키입니다.",
  API: "Application Programming Interface. 프로그램이 다른 프로그램에 정해진 형식으로 요청하고 응답을 받는 접점입니다.",
  RAG: "Retrieval-Augmented Generation, 검색 증강 생성. 검색한 근거를 모델 입력에 더해 답하게 하는 방식입니다.",
  토큰: "토크나이저가 텍스트를 나누고 정수 ID를 부여하는 처리 단위입니다.",
  토크나이저: "문자열을 해당 모델이 쓰는 토큰과 ID의 열로 변환하는 도구입니다.",
  "컨텍스트 창":
    "한 번의 요청에서 모델이 처리할 수 있는 토큰 범위입니다. 출력에 쓸 여유도 고려합니다.",
  청크: "검색하거나 모델에 전달하기 위해 떼어 낸 문서 조각입니다.",
  임베딩: "텍스트 등의 특징을 숫자 목록인 벡터로 표현한 값입니다.",
  벡터: "순서가 있는 숫자의 목록입니다. 임베딩에 쓰이는 목록 길이가 차원 수입니다.",
  "코사인 유사도":
    "두 벡터 사이 각도의 코사인 값입니다. 같은 방향이면 1, 직각이면 0입니다.",
  "벡터 DB":
    "벡터와 식별자 등을 보관하고 유사한 벡터를 검색하는 데이터베이스입니다.",
  인덱싱: "자료를 검색 가능한 구조로 준비하는 과정입니다.",
  "Top-k": "검색 순위에서 앞의 k개를 선택하는 방법입니다.",
  SQL: "관계형 데이터베이스에 조회·집계 등을 요청하는 언어입니다.",
  NL2SQL:
    "자연어 질문을 SQL로 바꾸고 데이터베이스에서 실행해 결과를 얻는 방식입니다.",
};
const terms = (s) =>
  s.replace(
    /<t>(.*?)<\/t>/g,
    (_, t) =>
      `<button class="term" type="button" data-term="${esc(t)}" aria-label="${esc(t)} 용어 설명">${esc(t)}</button>`,
  );
const box = (html) => `<div class="stage">${html}</div>`;
const duo = (a, b) =>
  `<div class="twocol"><div>${a}</div><div>${b}</div></div>`;
const text = (s) => `<p class="aside-copy">${s}</p>`;
const label = (s) => `<div class="label">${s}</div>`;
const take = (s) => `<div class="take">${s}</div>`;
const rows = (items) =>
  items
    .map(
      ([a, b]) =>
        `<div class="rowline"><strong>${a}</strong><span>${b}</span></div>`,
    )
    .join("");
const code = (name, value) =>
  `<div class="codebox"><div class="codehead">${label(esc(name))}<button class="copy" type="button">복사</button></div><pre class="copydata" tabindex="0">${esc(value)}</pre></div>`;
const prompt = (value) =>
  `<div class="prompt"><div class="codehead">${label("OpenCode에 입력")}<button class="copy" type="button">복사</button></div><p class="copydata">${esc(value)}</p></div>`;
const flow = (entries) =>
  `<div class="flow">${entries.map(([name, desc], i) => `${i ? '<span class="flow-arr" aria-hidden="true">→</span>' : ""}<div class="flow-item on"><span class="flow-n">${n2(i + 1)}</span><strong>${name}</strong><p>${desc}</p></div>`).join("")}</div>`;
const link = (href, name) =>
  `<a class="tool-link" href="${href}" download>${name} ↓</a>`;
const links = (ids) =>
  `<div class="ref-list">${ids.map((id) => `<a target="_blank" rel="noopener" href="${sources[id][1]}">${sources[id][0]} ↗</a>`).join("")}</div>`;
const widget = (name) => `<div data-widget="${name}"></div>`;
function panels(options, initial = 0) {
  return `<div data-panels><div class="choices">${options.map(([title], i) => `<button class="choice" type="button" data-select="${i}" aria-pressed="${i === initial}">${title}</button>`).join("")}</div>${options.map(([, html], i) => `<div data-panel="${i}" ${i === initial ? "" : "hidden"}>${html}</div>`).join("")}</div>`;
}
function quiz(q, options, correct, feedback) {
  return `<div data-quiz="${correct}"><p class="qtext">${q}</p><div class="choices">${options.map((v, i) => `<button class="choice" data-answer="${i}" aria-pressed="false">${v}</button>`).join("")}</div><div aria-live="polite" class="result placeholder">답을 고르면 판단 근거를 확인할 수 있습니다.</div>${feedback.map((s) => `<template>${s}</template>`).join("")}</div>`;
}
const refDocs = (s, ids) => `${text(s)}${links(ids)}`;
