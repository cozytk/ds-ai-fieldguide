const excelState = { value: "확인 대기", route: null };
const widgets = {
  excel(host) {
    host.innerHTML = duo(
      label("모의 통합 문서 · handover.xlsx") +
        '<table class="lab-table"><caption class="sr">교대 시트</caption><thead><tr><th></th><th>A</th><th>B</th></tr></thead><tbody><tr><th>1</th><td>기록 항목</td><td>값</td></tr><tr><th>2</th><td>인계 상태</td><td><input data-cell aria-label="교대 시트 B2 값" maxlength="40"></td></tr></tbody></table>',
      label("읽는 경로 선택") +
        '<div class="choices"><button class="choice" data-route="raw">파일 직접 읽기</button><button class="choice" data-route="excel">열린 Excel로 읽기</button></div><div data-output aria-live="polite" class="result placeholder"></div>',
    );
    const input = host.querySelector("[data-cell]");
    input.value = excelState.value;
    function show() {
      const el = host.querySelector("[data-output]");
      const r = excelState.route;
      el.className =
        "result " + (r === "raw" ? "warn" : r ? "" : "placeholder");
      el.textContent =
        r === "raw"
          ? "모의 결과 · 일반 파일 파서가 보호된 바이트를 xlsx 형식으로 해석하지 못했습니다. 이 오류만으로 파일 손상을 확정할 수 없습니다."
          : r === "excel"
            ? "모의 결과 · 열람 권한을 확인한 Excel → COM → xlwings → 교대!B2 = " +
              (excelState.value || "(빈 셀)")
            : "읽는 경로를 골라 결과를 확인하세요.";
      host
        .querySelectorAll("[data-route]")
        .forEach((b) => b.setAttribute("aria-pressed", b.dataset.route === r));
    }
    input.oninput = () => {
      excelState.value = input.value;
      excelState.route = null;
      show();
    };
    host.querySelectorAll("[data-route]").forEach(
      (b) =>
        (b.onclick = () => {
          excelState.route = b.dataset.route;
          show();
        }),
    );
    show();
  },
  mcpFlow(host) {
    host.innerHTML = panels([
      [
        "① 도구 발견",
        flow([
          ["OpenCode", "서버에 사용 가능한 도구를 묻습니다."],
          ["도구 서버", "검색 도구의 이름, 설명, 입력 형식을 돌려줍니다."],
        ]) +
          take(
            "모의 예시  ·  search_docs(query)  ·  query에 검색어를 넣습니다.",
          ),
      ],
      [
        "② 호출",
        flow([
          ["사용자", "“교대 기록의 재검 기준을 찾아 줘.”"],
          ["OpenCode", "검색어를 담아 도구를 호출합니다."],
          ["서버", "열람 가능한 문서를 검색합니다."],
        ]) + take('모의 요청  ·  search_docs("재검 기준")'),
      ],
      [
        "③ 결과 활용",
        flow([
          ["도구 결과", "문서 제목, 원문 조각, 출처가 돌아옵니다."],
          ["모델", "돌아온 근거를 읽고 질문에 답합니다."],
          ["사용자", "출처를 열어 적용 조건을 확인합니다."],
        ]) +
          take("검색 결과가 비어 있으면 검색 범위나 접근 권한을 확인합니다."),
      ],
    ]);
  },
};
function scopeScene(host, isSkill) {
  const project = isSkill ? localSkill : localRule;
  const global = isSkill ? globalSkill : globalRule;
  const title = isSkill ? "스킬" : "지침";
  const branch = (name, yes) =>
    `<div class="branch ${yes ? "available" : ""}"><span class="folder-icon" aria-hidden="true"></span><span>${name}</span><strong>${yes ? "적용" : "범위 밖"}</strong></div>`;
  host.innerHTML = panels(
    [false, true].map((wide) => {
      const src = wide ? global : project;
      return [
        (wide ? "글로벌 " : "로컬 ") + title,
        duo(
          '<div class="scope-tree">' +
            label(wide ? "사용자 설정 → 프로젝트" : "프로젝트 → 하위 작업") +
            '<div class="tree-root">' +
            (wide ? "사용자 공통 설정" : "C: 드라이브") +
            "</div>" +
            branch("ai-lab", true) +
            branch("report-lab", wide) +
            "</div>",
          code(
            (wide ? "글로벌" : "로컬") + " " + title + " · Windows 기본 경로",
            src,
          ) +
            '<p class="small">' +
            (wide
              ? "%USERPROFILE%은 파일 탐색기에서 현재 사용자 폴더를 뜻합니다."
              : "두 프로젝트는 같은 상위 폴더 아래에 나란히 있습니다.") +
            "</p>",
        ) +
          take(
            isSkill
              ? wide
                ? "내 여러 프로젝트에서 필요할 때 읽는 Excel 절차에 알맞습니다."
                : "팀 고유의 양식·검산 절차를 이 프로젝트 저장소와 함께 공유합니다."
              : wide
                ? "내 계정의 프로젝트들에 매번 필요한 짧은 규칙을 둡니다."
                : "ai-lab에서 새 대화를 열면 읽습니다. 독립된 report-lab에서 시작하면 범위 밖입니다.",
          ),
      ];
    }),
  );
}
widgets.ruleScope = (h) => scopeScene(h, false);
widgets.skillScope = (h) => scopeScene(h, true);
widgets.contextLoad = (h) => {
  const strips = (items) =>
    '<div class="load-strip">' +
    items
      .map(([label, cls]) => `<span class="${cls}">${label}</span>`)
      .join("") +
    "</div>";
  h.innerHTML =
    panels([
      [
        "모든 절차를 글로벌 지침에",
        label("이번 요청 · 회의 문구 다듬기") +
          strips([
            ["공통 규칙", "common"],
            ["Excel 열기", "specific"],
            ["예외 처리", "specific"],
            ["검산 예제", "specific"],
            ["이번 질문", "ask"],
          ]) +
          take("문구를 다듬는 일에도 Excel의 상세 절차가 입력에 들어옵니다."),
      ],
      [
        "절차를 스킬에 분리",
        label("이번 요청 · 회의 문구 다듬기") +
          strips([
            ["공통 규칙", "common"],
            ["스킬 이름·설명", "index"],
            ["이번 질문", "ask"],
          ]) +
          take(
            "공통 지침은 짧게 유지하고, 절차는 어떤 일을 할 때 쓰는지 설명으로 알립니다.",
          ),
      ],
      [
        "Excel 작업을 요청하면",
        label("이번 요청 · 보호 문서의 셀 확인") +
          strips([
            ["공통 규칙", "common"],
            ["스킬 이름·설명", "index"],
            ["이번 질문", "ask"],
            ["선택한 스킬 본문", "specific"],
          ]) +
          take(
            "에이전트가 스킬을 불러올 때 해당 절차가 현재 대화에 추가됩니다.",
          ),
      ],
    ]) +
    '<p class="small">입력에 포함되는 내용의 개념도입니다. 칸 너비는 토큰 수를 나타내지 않습니다.</p>';
};
