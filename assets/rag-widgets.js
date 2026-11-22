const searchState = { query: 0, k: 2 };
const corpus = CORPUS.docs;
const presets = CORPUS.queries;
const sampleRows = [
  ["A조", 2],
  ["B조", 3],
  ["A조", 1],
  ["B조", 4],
  ["A조", 2],
  ["B조", 1],
];
const options = (items, selected = 0) =>
  items
    .map(
      (s, i) =>
        `<option value="${i}" ${i === selected ? "selected" : ""}>${esc(s)}</option>`,
    )
    .join("");
const field = (name, select) =>
  `<label class="control">${name}${select}</label>`;
const selector = (name, items, selected = 0) =>
  field(name, `<select>${options(items, selected)}</select>`);
const choices = (items, idx = 0) =>
  `<div class="choices">${items.map((s, i) => `<button class="choice" data-i="${i}" aria-pressed="${i === idx}">${esc(s)}</button>`).join("")}</div>`;
function bindChoices(host, fn) {
  host.querySelectorAll("[data-i]").forEach(
    (b) =>
      (b.onclick = () => {
        host
          .querySelectorAll("[data-i]")
          .forEach((el) => el.setAttribute("aria-pressed", el === b));
        fn(Number(b.dataset.i));
      }),
  );
}
function cosine(a, b) {
  let dot = 0,
    aa = 0,
    bb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  return dot / Math.sqrt(aa * bb);
}
const rank = (q) =>
  corpus
    .map((d) => ({ ...d, score: cosine(d.vec, presets[q].vec) }))
    .sort((a, b) => b.score - a.score);
const vectorExcerpt = (v) =>
  "[" +
  v
    .slice(0, 6)
    .map((x) => x.toFixed(3))
    .join(", ") +
  ", …]";
function rankLines(all, k) {
  return all
    .map(
      (d, i) =>
        `<div class="data-rank ${i < k ? "" : "muted"}"><span class="id">${i + 1}</span><strong>${d.title}</strong><div class="bar"><i style="width:${100 * d.score}%"></i></div><span class="score">${d.score.toFixed(3)}</span><span class="id">${i < k ? "선택" : "제외"}</span></div>`,
    )
    .join("");
}
function vectorMap(values) {
  const cells = values
    .map((v, i) => {
      const strength = Math.min(1, Math.abs(v) / 0.15);
      const from = [38, 66, 77],
        to = v >= 0 ? [210, 241, 157] : [247, 160, 131];
      const c = from
        .map((x, j) => Math.round(x + (to[j] - x) * strength))
        .join(",");
      return `<rect x="${(i % 48) * 10}" y="${Math.floor(i / 48) * 10}" width="8" height="8" fill="rgb(${c})"/>`;
    })
    .join("");
  return `<div class="vector-map"><svg viewBox="0 0 480 80" role="img" aria-label="선택한 문장의 384차원 임베딩. 한 칸이 좌표 하나를 나타냅니다.">${cells}</svg><div><span>384개 좌표</span><span>주황 −　·　연두 +</span></div></div>`;
}
const widgets = {
  budget(h) {
    h.innerHTML = duo(
      label("예시 모델의 입력·출력 예산") +
        text(
          "<b>4,000 토큰</b> 중 지침·질문과 출력 여유로 1,000을 남깁니다. 문서 한 장은 500토큰으로 가정합니다.",
        ),
      field("넣을 문서 수", '<input type="range" min="1" max="10" value="2">') +
        '<div data-info aria-live="polite"></div>',
    );
    const range = h.querySelector("input");
    function draw() {
      const n = Number(range.value),
        used = 1000 + 500 * n;
      h.querySelector("[data-info]").innerHTML =
        `<div class="meter ${used > 4000 ? "over" : ""}"><i style="width:${Math.min(100, used / 40)}%"></i></div><strong>${n}장 · ${used.toLocaleString()} / 4,000 토큰</strong><p class="small">${used <= 4000 ? "전체 문서를 함께 입력할 수 있습니다." : "예산을 넘습니다. 질문과 관련된 조각을 고르거나 자료를 나눕니다."}</p>`;
    }
    range.oninput = draw;
    draw();
  },
  tokens(h) {
    h.innerHTML = duo(
      selector(
        "예문",
        CORPUS.tokens.map((x) => x.text),
      ) + choices(["KLUE BERT", "E5"]),
      "<div data-pieces></div>",
    );
    const select = h.querySelector("select");
    let model = "KLUE";
    function draw() {
      const tokens = CORPUS.tokens[Number(select.value)][model];
      h.querySelector("[data-pieces]").innerHTML =
        label(tokens.length + "개 토큰 · 조각을 누르면 ID 표시") +
        `<div class="chips">${tokens.map(([s], i) => `<button class="chip" aria-pressed="false" data-t="${i}">${esc(s)}</button>`).join("")}</div><p class="small" aria-live="polite" data-token-info>특수 토큰 제외 · ##는 이어지는 조각, ▁는 공백 경계를 표시합니다.</p>`;
      h.querySelectorAll("[data-t]").forEach(
        (b) =>
          (b.onclick = () => {
            const [s, id] = tokens[+b.dataset.t];
            h.querySelectorAll("[data-t]").forEach((x) =>
              x.setAttribute("aria-pressed", x === b),
            );
            h.querySelector("[data-token-info]").textContent =
              s + "  →  토큰 ID " + id + " · ID는 어휘 목록의 번호입니다.";
          }),
      );
    }
    select.onchange = draw;
    bindChoices(h, (i) => {
      model = ["KLUE", "E5"][i];
      draw();
    });
    draw();
  },
  angle(h) {
    h.innerHTML = duo(
      '<svg class="plot" viewBox="0 0 390 235" role="img" aria-label="문서와 질문 벡터의 각도"></svg>',
      field(
        "질문 방향 · 각도 조절",
        '<input aria-label="질문 각도" type="range" min="0" max="180" value="30">',
      ) + '<div data-angle aria-live="polite"></div>',
    );
    const input = h.querySelector("input");
    const angles = [22, 82, 145];
    function draw() {
      const a = Number(input.value);
      const vec = (angle, len) => [
        190 + len * Math.cos((angle * Math.PI) / 180),
        192 - len * Math.sin((angle * Math.PI) / 180),
      ];
      const point = (angle, len) =>
        vec(angle, len)
          .map((n) => n.toFixed(2))
          .join(" ");
      const data = angles
        .map((v, i) => ({
          id: "ABC"[i],
          angle: v,
          score: Math.cos(((a - v) * Math.PI) / 180),
        }))
        .sort((a, b) => b.score - a.score);
      h.querySelector("svg").innerHTML =
        '<defs><marker id="head" viewBox="0 0 10 10" markerWidth="6" markerHeight="6" refX="8" refY="5" orient="auto"><path fill="#ffb18f" d="M0 0L10 5L0 10z"/></marker></defs><path d="M32 192H355M190 212V27" fill="none" stroke="#718d90"/><path d="M64 192a126 126 0 0 1 252 0" fill="none" stroke="#5b787e" stroke-dasharray="3 5"/>' +
        angles
          .map(
            (v, i) =>
              `<path d="M190 192L${point(v, 126)}" stroke="#cfe69f" stroke-width="2"/><circle cx="${vec(v, 126)[0]}" cy="${vec(v, 126)[1]}" r="3.5" fill="#cfe69f"/><text x="${vec(v, 151)[0]}" y="${vec(v, 151)[1]}" fill="#e0f2be" text-anchor="middle" font-size="16">${"ABC"[i]}</text>`,
          )
          .join("") +
        `<path d="M190 192L${point(a, 100)}" stroke="#ffb18f" stroke-width="3" marker-end="url(#head)"/><text x="16" y="23" fill="#ffc3a6" font-size="13">질문 · ${a}°</text><circle cx="190" cy="192" r="4" fill="white"/>`;
      h.querySelector("[data-angle]").innerHTML =
        take(
          `가장 가까운 방향은 문서 ${data[0].id} · ${data[0].score.toFixed(3)}`,
        ) +
        `<p class="small">${data.map((d) => d.id + " " + d.score.toFixed(3)).join("　")}<br>교육용 2차원 좌표 · 실제 문장 검색은 뒤에서 실험합니다.</p>`;
    }
    input.oninput = draw;
    draw();
  },
  vectors(h) {
    const vectors = [presets[2], corpus[3], corpus[1]];
    h.innerHTML =
      choices(["질문 문장", "회의실 문서", "재검 문서"]) + "<div data-v></div>";
    function draw(i) {
      const d = vectors[i];
      h.querySelector("[data-v]").innerHTML =
        duo(
          text(d.text || d.body) + vectorMap(d.vec),
          code("multilingual-e5-small · 앞 여섯 좌표", vectorExcerpt(d.vec)),
        ) +
        take(
          "각 값은 여러 특징을 함께 담습니다. 숫자 하나에 “회의실” 같은 고정된 의미를 붙이지 않습니다.",
        );
    }
    bindChoices(h, draw);
    draw(0);
  },
  index(h) {
    h.innerHTML =
      choices(corpus.map((d) => d.id + " · " + d.title)) + "<div data-d></div>";
    function draw(i) {
      const d = corpus[i];
      h.querySelector("[data-d]").innerHTML =
        duo(
          label("문서 " + d.id + " · " + d.source) + text(d.body),
          code("저장된 벡터 · 384차원", vectorExcerpt(d.vec)),
        ) +
        take(
          "검색 결과의 ID " +
            d.id +
            "를 따라가면 이 원문과 출처를 함께 가져올 수 있습니다.",
        );
    }
    bindChoices(h, draw);
    draw(0);
  },
  rank(h) {
    h.innerHTML = duo(
      selector(
        "검색할 질문",
        presets.map((x) => x.text),
        searchState.query,
      ) +
        field(
          "가져올 조각 수 k",
          `<input type="range" min="1" max="5" value="${searchState.k}">`,
        ) +
        '<p class="small" data-count></p>',
      '<div data-ranks aria-live="polite"></div>',
    );
    function draw() {
      h.querySelector("[data-ranks]").innerHTML =
        label("검색 순위 · 코사인 유사도") +
        rankLines(rank(searchState.query), searchState.k);
      h.querySelector("[data-count]").textContent =
        "선택한 상위 " +
        searchState.k +
        "개를 다음 장에서 모델 입력으로 보냅니다.";
    }
    h.querySelector("select").onchange = (e) => {
      searchState.query = +e.target.value;
      draw();
    };
    h.querySelector("input").oninput = (e) => {
      searchState.k = +e.target.value;
      draw();
    };
    draw();
  },
  assembly(h) {
    const q = presets[searchState.query];
    const evidence = rank(searchState.query).slice(0, searchState.k);
    const answer = [
      "미완료 작업, 담당자, 다음 확인 시각을 적습니다. [A]",
      "최초 측정값과 재측정값을 같은 행에 적고 판정 사유를 남깁니다. [B]",
      "예약 달력의 빈 시간을 고르고 참석 인원을 입력합니다. [D]",
    ];
    h.innerHTML =
      choices(["검색 근거 포함", "근거 빼기"]) + "<div data-content></div>";
    function draw(i) {
      const hasEvidence = !i && evidence.some((d) => d.id === q.evidence);
      const rows = i
        ? "(제공된 원문 없음)"
        : evidence
            .map((d) => "[" + d.id + "] " + d.source + " · " + d.body)
            .join("\n");
      h.querySelector("[data-content]").innerHTML = duo(
        code(
          "조립된 모델 입력",
          "질문  " +
            q.text +
            "\n\n근거\n" +
            rows +
            "\n\n근거에서 답을 찾고 출처 ID를 표시하라.",
        ),
        label("근거에 맞춘 답변 예시") +
          text(
            hasEvidence
              ? answer[searchState.query]
              : "제공된 근거에서 이 질문의 답을 확인할 수 없습니다.",
          ) +
          '<p class="small">실제 API 호출 없이 준비한 예시 답을 근거 유무에 맞춰 표시합니다.</p>',
      );
    }
    bindChoices(h, draw);
    draw(0);
  },
  missing(h) {
    const first = rank(3)[0];
    h.innerHTML = duo(
      label("실제 검색 1위 · 유사도 " + first.score.toFixed(3)) +
        text("“" + first.body + "”"),
      quiz(
        "이 원문으로 답할 수 있나요?",
        ["금액을 추정한다", "근거가 부족하다"],
        1,
        [
          "문서에는 구매 비용이나 예산 항목이 없습니다. 추정한 금액을 원문으로 검증할 수 없습니다.",
          "맞습니다. 구매 예산을 확인할 수 있는 문서나 담당자에게 확인해야 합니다.",
        ],
      ),
    );
  },
  tableSum(h) {
    h.innerHTML = duo(
      "<div data-table></div>",
      field(
        "선택한 행 수 · 교육용 부분 선택",
        '<input type="range" min="1" max="6" value="2">',
      ) + '<div data-sum aria-live="polite"></div>',
    );
    function draw() {
      const n = +h.querySelector("input").value;
      const partial = sampleRows.slice(0, n).reduce((s, r) => s + r[1], 0);
      h.querySelector("[data-table]").innerHTML =
        '<table class="lab-table compact"><thead><tr><th>기록</th><th>근무조</th><th>재검 건수</th></tr></thead><tbody>' +
        sampleRows
          .map(
            ([shift, num], i) =>
              `<tr class="${i < n ? "selected-row" : ""}"><td>${i + 1}</td><td>${shift}</td><td>${num}</td></tr>`,
          )
          .join("") +
        "</tbody></table>";
      h.querySelector("[data-sum]").innerHTML =
        take(`${n}행 합계 ${partial}건 · 전체 6행 합계 13건`) +
        `<p class="small">${n === 6 ? "모든 행이 들어왔을 때 두 합계가 일치합니다." : "선택에서 빠진 행에 " + (13 - partial) + "건이 더 있습니다."}</p>`;
    }
    h.querySelector("input").oninput = draw;
    draw();
  },
  sql(h) {
    const statements = [
      "SELECT SUM(rechecks) AS total\nFROM shift_log;",
      "SELECT team, SUM(rechecks) AS total\nFROM shift_log\nGROUP BY team ORDER BY team;",
    ];
    let chosen = 0,
      generation = 0;
    h.innerHTML =
      choices(["전체 재검 건수는?", "근무조별 합계는?"]) +
      '<div data-query></div><div class="btns"><button class="action" data-run>SQLite에서 실행 ▷</button><span class="small">앞 장의 가상 기록 6행</span></div><div class="result placeholder" data-result aria-live="polite"></div>';
    function draw(i) {
      chosen = i;
      generation++;
      h.querySelector("[data-query]").innerHTML = code(
        "질문에 대응하는 SQL 예시",
        statements[i],
      );
      h.querySelector("[data-result]").textContent =
        "SQL을 실행해 집계 결과를 확인하세요.";
    }
    bindChoices(h, draw);
    draw(0);
    h.querySelector("[data-run]").onclick = async () => {
      const run = ++generation,
        statement = statements[chosen];
      let db;
      try {
        const SQL = await loadSql();
        db = new SQL.Database();
        db.run("CREATE TABLE shift_log(team TEXT, rechecks INTEGER)");
        for (const pair of sampleRows)
          db.run("INSERT INTO shift_log VALUES (?, ?)", pair);
        const res = db.exec(statement)[0];
        if (run === generation)
          h.querySelector("[data-result]").textContent = res.values
            .map((row) =>
              row.length === 1
                ? "전체 " + row[0] + "건"
                : row[0] + " " + row[1] + "건",
            )
            .join("  /  ");
      } catch (e) {
        if (run === generation)
          h.querySelector("[data-result]").textContent =
            "실행 오류 · " + e.message;
      } finally {
        db?.close();
      }
    };
  },
};
let sqlReady;
function loadSql() {
  if (!sqlReady)
    sqlReady = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "../assets/sql-asm.js";
      script.onload = () => initSqlJs().then(resolve, reject);
      script.onerror = () =>
        reject(new Error("SQLite 파일을 불러올 수 없습니다."));
      document.head.append(script);
    }).catch((e) => {
      sqlReady = undefined;
      throw e;
    });
  return sqlReady;
}
widgets.ragSequence = (h) => {
  const entries = [
    [
      "1  검색",
      "Retrieval",
      "질문",
      "관련 원문",
      "“인계할 항목은?”이라는 질문으로 기록 안내 §1을 찾습니다.",
    ],
    [
      "2  입력 보강",
      "Augmentation",
      "질문 + 원문",
      "모델 입력",
      "질문에 원문과 출처 [A]를 붙여 한 번의 요청으로 조립합니다.",
    ],
    [
      "3  답변 생성",
      "Generation",
      "모델 입력",
      "출처 있는 답",
      "LLM이 “미완료 작업, 담당자, 다음 확인 시각을 적습니다. [A]”라고 답할 수 있습니다.",
    ],
  ];
  h.innerHTML = panels(
    entries.map(([title, en, a, b, ex], i) => [
      title,
      `<div class="transform"><div><small>입력</small><strong>${a}</strong></div><span class="transform-mid">${en}<i>⟶</i></span><div><small>출력</small><strong>${b}</strong></div></div>` +
        take(ex),
    ]),
  );
};
