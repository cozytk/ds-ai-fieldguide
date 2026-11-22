"""Rebuild assets/corpus.js with torch, transformers 4.x, and sentencepiece installed."""
import json
from pathlib import Path

import torch
from transformers import AutoModel, AutoTokenizer

DOCS = [
    ("A", "기록 안내 §1", "교대 인계", "근무를 마칠 때 미완료 작업, 담당자, 다음 확인 시각을 인계장에 적는다."),
    ("B", "기록 안내 §2", "재검 기록", "재검 시 최초 측정값과 재측정값을 같은 행에 남기고 판정 사유를 적는다."),
    ("C", "운영 안내 §3", "대리 인계", "담당자가 자리를 비우면 대리 담당자가 인계장을 확인하고 이름을 남긴다."),
    ("D", "공간 안내 §1", "회의실 예약", "회의실은 예약 달력에서 빈 시간을 선택하고 참석 인원을 입력해 신청한다."),
    ("E", "기록 안내 §4", "단위 표기", "측정값 옆에 단위를 표시한다. 두께는 nm, 시간은 분으로 기록한다."),
]
QUERIES = [
    ("퇴근 전 어떤 내용을 다음 근무자에게 넘기나요?", "A"),
    ("다시 측정한 값은 어디에 적나요?", "B"),
    ("회의할 장소를 미리 잡으려면?", "D"),
    ("측정 장비의 구매 예산은 얼마인가요?", None),
]
SENTENCES = ["교대 기록", "교대기록", "재측정값을 기록합니다.", "LOT-A17"]
root = Path(__file__).resolve().parents[1]
cache = Path.home() / ".cache/huggingface/hub"


def source(name):
    snapshots = cache / ("models--" + name.replace("/", "--")) / "snapshots"
    return next(snapshots.glob("*"), name)


e5 = source("intfloat/multilingual-e5-small")
tok = AutoTokenizer.from_pretrained(e5)
model = AutoModel.from_pretrained(e5).eval()
texts = ["passage: " + d[2] + ". " + d[3] for d in DOCS] + ["query: " + q[0] for q in QUERIES]
batch = tok(texts, return_tensors="pt", padding=True, truncation=True)
with torch.inference_mode():
    hidden = model(**batch).last_hidden_state
    mask = batch.attention_mask.unsqueeze(-1)
    pooled = (hidden * mask).sum(1) / mask.sum(1)
    vectors = torch.nn.functional.normalize(pooled, dim=1).tolist()


def rounded(v):
    return [round(x, 7) for x in v]


def token_data(tokenizer, sentence):
    ids = tokenizer(sentence, add_special_tokens=False)["input_ids"]
    return list(zip(tokenizer.convert_ids_to_tokens(ids), ids))


klue = AutoTokenizer.from_pretrained(source("klue/bert-base"))
data = {
    "docs": [dict(zip(("id", "source", "title", "body"), d), vec=rounded(v)) for d, v in zip(DOCS, vectors)],
    "queries": [dict(text=q, evidence=key, vec=rounded(v)) for (q, key), v in zip(QUERIES, vectors[len(DOCS):])],
    "tokens": [{"text": s, "E5": token_data(tok, s), "KLUE": token_data(klue, s)} for s in SENTENCES],
}
(root / "assets/corpus.js").write_text("const CORPUS = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
for q in data["queries"]:
    print(q["text"], sorted([(d["id"], round(sum(a*b for a,b in zip(d["vec"], q["vec"])), 3)) for d in data["docs"]], key=lambda x: -x[1]))
