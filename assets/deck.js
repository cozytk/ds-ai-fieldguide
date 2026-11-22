const page = document.querySelector("#page");
const modal = document.querySelector("dialog");
const modalBody = document.querySelector("#dialogBody");
const meta = {
  title: lesson.title,
  section: "시작",
  note: lesson.coverNote,
  refs: lesson.id === "agent" ? ["ref1", "ref3"] : ["ref2"],
};
const slides = [meta, ...lesson.slides];
let pageNumber = 0,
  tipOwner = null,
  dialogOpener = null;
const tip = document.querySelector("#termTip");
function getPage() {
  const n = Number(location.hash.slice(1));
  return Number.isInteger(n) && n >= 1 && n <= slides.length ? n - 1 : 0;
}
function jump(idx) {
  const target = Math.max(0, Math.min(slides.length - 1, idx));
  if (target !== pageNumber) location.hash = n2(target + 1);
}
function hideTip() {
  if (tipOwner) tipOwner.removeAttribute("aria-describedby");
  tipOwner = null;
  tip.hidden = true;
}
function showTip(b) {
  const v = glossary[b.dataset.term];
  if (!v) return;
  hideTip();
  tipOwner = b;
  b.setAttribute("aria-describedby", "termTip");
  tip.textContent = v;
  tip.hidden = false;
  const r = b.getBoundingClientRect(),
    w = tip.offsetWidth,
    h = tip.offsetHeight;
  tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left)) + "px";
  tip.style.top =
    (r.bottom + h + 15 < innerHeight
      ? r.bottom + 7
      : Math.max(6, r.top - h - 7)) + "px";
}
function autoTerms() {
  const used = new Set(
    [...page.querySelectorAll("[data-term]")].map((b) => b.dataset.term),
  );
  const candidates = Object.keys(glossary).sort((a, b) => b.length - a.length);
  const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const t of nodes) {
    if (
      t.parentElement.closest(
        "button,a,pre,select,svg,h1,h2,h3,.copydata,.label,.eyebrow,[hidden],.fighead,.figfoot",
      )
    )
      continue;
    let raw = t.textContent;
    if (!raw.trim()) continue;
    const hits = [];
    for (const term of candidates) {
      const idx = raw.indexOf(term);
      if (
        used.has(term) ||
        idx < 0 ||
        hits.some((h) => idx < h.i + h.t.length && h.i < idx + term.length)
      )
        continue;
      hits.push({ i: idx, t: term });
    }
    if (!hits.length) continue;
    const f = document.createDocumentFragment();
    let start = 0;
    for (const hit of hits.sort((a, b) => a.i - b.i)) {
      f.append(raw.slice(start, hit.i));
      const b = document.createElement("button");
      b.className = "term";
      b.type = "button";
      b.dataset.term = hit.t;
      b.textContent = hit.t;
      b.setAttribute("aria-label", hit.t + " 용어 설명");
      f.append(b);
      used.add(hit.t);
      start = hit.i + hit.t.length;
    }
    f.append(raw.slice(start));
    t.replaceWith(f);
  }
}
function render() {
  pageNumber = getPage();
  const s = slides[pageNumber];
  hideTip();
  if (!pageNumber) {
    page.innerHTML = `<div class="deckcover"><div><p class="eyebrow">AI 기본 교육 / ${lesson.num}</p><h1>${lesson.lines.map((v) => "<span>" + v + "</span>").join("")}</h1><p class="lead">${lesson.subtitle}</p><div class="cover-meta"><strong>${n2(slides.length)}장</strong><span>${lesson.medium}</span></div></div><div class="instrument"><div class="fighead"><span><i class="lamp"></i>${lesson.id === "agent" ? "CONTEXT" : "RETRIEVAL"}</span><span>FIG. ${lesson.num}</span></div>${lesson.art()}<div class="figfoot">${lesson.id === "agent" ? "작업 조건 → 반복 절차 → 도구 호출" : "질문 → 검색한 원문 → 근거 있는 답"}</div></div></div>`;
  } else {
    page.innerHTML = `<p class="eyebrow">교안 ${lesson.num} / ${s.section}</p><h1>${s.title}</h1><p class="lead">${terms(s.lead)}</p><div class="mainbody">${terms(s.body)}</div>`;
    page
      .querySelectorAll("[data-widget]")
      .forEach((el) => widgets[el.dataset.widget](el));
  }
  autoTerms();
  page.classList.remove("show");
  void page.offsetWidth;
  page.classList.add("show");
  document.title = `${s.title} · ${lesson.title} | DS AX/PI AI 기본 교육`;
  document.querySelector(".pagecount").textContent =
    n2(pageNumber + 1) + " / " + n2(slides.length);
  document.querySelector(".section-label").textContent = s.section;
  document.querySelector(".progress").style.width =
    ((pageNumber + 1) * 100) / slides.length + "%";
  document.querySelector("#prev").disabled = pageNumber === 0;
  const next = document.querySelector("#next");
  next.textContent =
    pageNumber === slides.length - 1 ? lesson.nextName + " ↗" : "다음 →";
  document.querySelector("#announcer").textContent =
    pageNumber + 1 + "장. " + s.title;
  window.scrollTo({ top: 0, behavior: "instant" });
}
function showModal(kind, opener) {
  hideTip();
  dialogOpener = opener;
  const s = slides[pageNumber];
  let html = "";
  if (kind === "toc") {
    document.querySelector("#dialogTitle").textContent = "교안 목차";
    let last = "";
    slides.forEach((x, i) => {
      if (last !== x.section) {
        html += '<div class="tocgroup">' + x.section + "</div>";
        last = x.section;
      }
      html += `<button class="tocrow ${i === pageNumber ? "current" : ""}" data-jump="${i}" ${i === pageNumber ? 'aria-current="page"' : ""}><span>${n2(i + 1)}</span>${x.title}</button>`;
    });
  } else if (kind === "note") {
    document.querySelector("#dialogTitle").textContent = "강사 노트";
    html =
      label(n2(pageNumber + 1) + " · " + s.title) +
      "<p>" +
      esc(s.note) +
      "</p>" +
      links(s.refs);
  } else {
    document.querySelector("#dialogTitle").textContent = "용어 사전";
    const subset =
      lesson.id === "agent"
        ? Object.keys(glossary).slice(0, Object.keys(glossary).indexOf("토큰"))
        : [
            "LLM",
            "API",
            "컨텍스트",
            ...Object.keys(glossary).slice(
              Object.keys(glossary).indexOf("RAG"),
            ),
          ];
    html = [...new Set(subset)]
      .map(
        (t) =>
          `<div class="rowline"><strong>${t}</strong><span>${glossary[t]}</span></div>`,
      )
      .join("");
  }
  modalBody.innerHTML = html;
  modal.showModal();
  modal.scrollTop = 0;
}
function nextPage() {
  if (pageNumber === slides.length - 1) location.assign(lesson.next);
  else jump(pageNumber + 1);
}
document.querySelector("#next").onclick = nextPage;
document.querySelector("#prev").onclick = () => jump(pageNumber - 1);
document
  .querySelectorAll("[data-dialog]")
  .forEach((b) => (b.onclick = () => showModal(b.dataset.dialog, b)));
document.querySelector("#closeDialog").onclick = () => modal.close();
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    const b = modal.getBoundingClientRect();
    if (
      e.clientX < b.left ||
      e.clientX > b.right ||
      e.clientY < b.top ||
      e.clientY > b.bottom
    )
      modal.close();
  }
});
modal.addEventListener("close", () =>
  dialogOpener?.focus({ preventScroll: true }),
);
document.querySelector("#fullscreen").onclick = async () => {
  try {
    if (!document.fullscreenElement)
      await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch {
    document.querySelector("#fullscreen").textContent = "F11 사용";
  }
};
document.addEventListener("fullscreenchange", () => {
  const b = document.querySelector("#fullscreen");
  b.setAttribute("aria-pressed", Boolean(document.fullscreenElement));
  b.textContent = document.fullscreenElement ? "화면 복원" : "전체 화면";
});
document.addEventListener("click", async (e) => {
  const b = e.target.closest("button");
  if (!b?.dataset.term) hideTip();
  if (!b) return;
  if (b.dataset.term) {
    showTip(b);
    return;
  }
  if (b.dataset.jump !== undefined) {
    modal.close();
    jump(+b.dataset.jump);
    return;
  }
  if (b.matches(".copy")) {
    const v = b
      .closest(".prompt,.codebox")
      .querySelector(".copydata").textContent;
    try {
      if (!navigator.clipboard) throw Error();
      await navigator.clipboard.writeText(v);
      b.textContent = "복사됨";
    } catch {
      const sel = getSelection(),
        range = document.createRange();
      range.selectNodeContents(
        b.closest(".prompt,.codebox").querySelector(".copydata"),
      );
      sel.removeAllRanges();
      sel.addRange(range);
      b.textContent = "선택됨 · Ctrl+C";
    }
    setTimeout(() => {
      b.textContent = "복사";
    }, 1800);
    return;
  }
  if (b.dataset.select !== undefined) {
    const g = b.closest("[data-panels]");
    g.querySelectorAll(":scope > .choices > button").forEach((x) =>
      x.setAttribute("aria-pressed", x === b),
    );
    g.querySelectorAll(":scope > [data-panel]").forEach(
      (p) => (p.hidden = p.dataset.panel !== b.dataset.select),
    );
    return;
  }
  if (b.dataset.answer !== undefined) {
    const g = b.closest("[data-quiz]");
    g.querySelectorAll("[data-answer]").forEach((x) =>
      x.setAttribute("aria-pressed", x === b),
    );
    const r = g.querySelector(".result"),
      ok = b.dataset.answer === g.dataset.quiz;
    r.className = "result" + (ok ? "" : " warn");
    r.innerHTML =
      (ok ? "정답 · " : "다시 생각해 보세요 · ") +
      g.querySelectorAll("template")[+b.dataset.answer].innerHTML;
  }
});
document.addEventListener("pointerover", (e) => {
  const b = e.target.closest("[data-term]");
  if (b && e.pointerType === "mouse") showTip(b);
});
document.addEventListener("pointerout", (e) => {
  if (e.target.closest("[data-term]") && document.activeElement !== tipOwner)
    hideTip();
});
document.addEventListener("focusin", (e) => {
  const b = e.target.closest("[data-term]");
  if (b) showTip(b);
  else hideTip();
});
document.addEventListener("scroll", hideTip, { passive: true });
window.addEventListener("resize", hideTip);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hideTip();
    return;
  }
  if (
    modal.open ||
    e.altKey ||
    e.ctrlKey ||
    e.metaKey ||
    e.isComposing ||
    e.target.closest("select,input,textarea,[contenteditable=true]")
  )
    return;
  if (
    e.key === "ArrowRight" ||
    e.key === "PageDown" ||
    (e.code === "Space" && !e.target.closest("button,a"))
  ) {
    e.preventDefault();
    jump(pageNumber + 1);
  }
  if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    jump(pageNumber - 1);
  }
  if (e.key === "Home") {
    e.preventDefault();
    jump(0);
  }
  if (e.key === "End") {
    e.preventDefault();
    jump(slides.length - 1);
  }
  if (e.key.toLowerCase() === "m")
    showModal("toc", document.querySelector("[data-dialog=toc]"));
  if (e.key.toLowerCase() === "n")
    showModal("note", document.querySelector("[data-dialog=note]"));
});
window.addEventListener("hashchange", render);
render();
