"""교대 기록에 쓰는 교육용 용어 사전. 실행 방법은 register-mcp.ps1 참고."""
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("shift-lab")
FIELDS = {
    "인계 상태": "다음 근무자가 확인할 일의 진행 상태입니다.",
    "재검": "같은 항목을 다시 측정해 첫 결과와 함께 기록하는 절차입니다.",
}


@mcp.tool()
def field_help(term: str) -> str:
    """교대 기록에서 쓰는 용어 한 개의 정의를 찾습니다."""
    return FIELDS.get(term.strip(), "사전에 없는 용어입니다.")


if __name__ == "__main__":
    mcp.run(transport="stdio")
