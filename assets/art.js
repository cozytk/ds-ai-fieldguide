// Teaching diagrams. All labels remain text and all controls have HTML equivalents.
function gridDefs(id) {
  return `<defs><pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#acc9d8" stroke-opacity=".14" stroke-width="1"/></pattern></defs><rect width="500" height="310" fill="url(#${id})"/>`;
}

function contextArt() {
  const layers = [
    {
      y: 184,
      color: "#3d6777",
      side: "#31505f",
      text: "MCP",
      n: "03",
      label: "도구 호출",
    },
    {
      y: 130,
      color: "#77a8a8",
      side: "#537f85",
      text: "SKILL.md",
      n: "02",
      label: "작업 절차",
    },
    {
      y: 76,
      color: "#e3efbf",
      side: "#99ad86",
      text: "AGENTS.md",
      n: "01",
      label: "공통 지침",
    },
  ];
  let shapes = "";
  for (const l of layers) {
    const y = l.y;
    shapes += `<g><path d="M62 ${y + 37}l124 52 149-63v8l-149 64L62 ${y + 46}Z" fill="${l.side}"/><path d="M62 ${y + 37}l149-63 124 52-149 63Z" fill="${l.color}" stroke="#e5f4df" stroke-opacity=".75"/>
      <g transform="matrix(.91,-.38,.93,.4,105,${y + 41})" fill="#19323b"><text font-size="19" font-family="monospace" font-weight="bold">${l.text}</text><rect y="12" width="76" height="2" opacity=".45"/><rect y="19" width="55" height="2" opacity=".45"/></g>
      <path d="M328 ${y + 25}h25l12-13h15" fill="none" stroke="#aec5c5"/><text x="388" y="${y + 16}" fill="#f3f1de" font-size="15">${l.label}</text></g>`;
  }
  return `<svg viewBox="0 0 500 310" role="img" aria-label="공통 지침, 작업별 스킬, 도구 연결의 세 층">${gridDefs("context-grid")}<path d="M185 39v242" stroke="#eaf7df" stroke-dasharray="3 5" opacity=".5"/>${shapes}</svg>`;
}

function searchArt() {
  const points = [
    [100, 67],
    [136, 110],
    [235, 171],
    [317, 100],
    [383, 64],
    [323, 218],
    [157, 235],
    [99, 183],
    [273, 47],
    [427, 147],
  ];
  const chosen = [2, 3, 5],
    q = [274, 157];
  return `<svg viewBox="0 0 500 310" role="img" aria-label="질문 주변에서 관련된 문서 세 개를 찾는 검색 개념도">${gridDefs("search-grid")}
   <g fill="none" stroke="#8db5b8" stroke-opacity=".35"><ellipse cx="274" cy="157" rx="97" ry="82" stroke-dasharray="3 5"/><ellipse cx="274" cy="157" rx="159" ry="128" stroke-dasharray="2 7"/></g>
   ${chosen.map((i) => `<path d="M${q.join(" ")}L${points[i].join(" ")}" stroke="#c7ed85" fill="none"/>`).join("")}
   ${points.map(([x, y], i) => `<g transform="translate(${x} ${y})"><rect x="-6" y="-6" width="12" height="12" fill="${chosen.includes(i) ? "#c7ed85" : "#6d979c"}" transform="rotate(45)"/>${chosen.includes(i) ? `<text x="14" y="5" font-size="13" fill="#dfebdd">문서 ${"ABC"[chosen.indexOf(i)]}</text>` : ""}</g>`).join("")}
   <circle cx="274" cy="157" r="14" fill="none" stroke="#f7aa87"/><circle cx="274" cy="157" r="6" fill="#ffb798"/><text x="249" y="137" fill="#ffc7ab" font-size="15">질문</text></svg>`;
}
