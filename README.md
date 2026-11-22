# DS AX/PI 센터 AI 기본 교육

두 편의 한국어 HTML 교안을 브라우저에서 바로 엽니다. [교안 목록](https://cozytk.github.io/ds-ai-fieldguide/) · [지침·스킬·MCP](https://cozytk.github.io/ds-ai-fieldguide/agent/) · [RAG의 작동 원리](https://cozytk.github.io/ds-ai-fieldguide/rag/)

## 발표

- 다음·이전 버튼, 방향키 또는 Page Up/Down으로 이동합니다. 스페이스는 다음 장, Home과 End는 처음과 끝, M은 목차, N은 현재 장의 강사 노트입니다.
- 목차에서 장표로 이동하면 URL 해시로 공유할 수 있습니다. 밑줄 친 용어는 마우스·키보드·터치로 설명을 엽니다.
- 사내 PC에서는 실습 ZIP을 풀고 Excel 파일을 열어 B2를 바꿉니다. 실제 보호 적용, Excel 자동화 가능 여부, 사내 도구 연결은 해당 계정과 환경에서 확인합니다.
- 오프라인으로는 저장소 ZIP을 모두 풀고 최상위 `index.html`을 엽니다. 폰트와 SQLite를 포함한 브라우저 실습 자산은 이 저장소에 들어 있습니다. 사내 서비스 및 참고 문서 방문은 별도 연결이 필요합니다.

## 편집

`agent/lesson.js`와 `rag/lesson.js`에 장표 문구, 순서, 강사 노트가 있습니다. `assets/agent-widgets.js`와 `assets/rag-widgets.js`가 상호작용을 담당합니다. 수정한 파일을 저장하고 브라우저를 새로 고치면 됩니다. 로컬 HTTP 서버가 필요하면 이 폴더에서 `python -m http.server 8000`을 실행합니다.

## 실습과 데이터

`lab/practice.zip`에는 가상 Excel 파일, Python 예제, 패키지 요구 사항과 Windows용 MCP 등록 스크립트가 들어 있습니다. MCP 서버는 Python SDK 1.x를 사용합니다. 사용자는 예제 서버를 복사하고 용어를 추가한 뒤 OpenCode의 실제 도구 호출로 결과를 확인합니다.

RAG 실험에는 직접 작성한 가상 문서 5건과 질문 4건을 사용합니다. `tools/make_corpus.py`는 multilingual-e5-small 임베딩과 KLUE BERT·E5 토큰 분할 예시를 재생성합니다. 벡터 검색 순위는 브라우저에서 코사인 유사도로 계산합니다. 모델 입력과 예시 답변은 브라우저에서 조립하며 외부 LLM을 호출하지 않습니다. SQL 예시는 sql.js로 실제 구문을 실행합니다.

기술 출처와 수업 참고 자료는 해당 장표의 강사 노트에서 열 수 있습니다. 폰트는 Pretendard이며 배포 라이선스는 `assets/FONT-LICENSE.txt`, sql.js 라이선스는 `assets/SQL-LICENSE.txt`에 있습니다.
