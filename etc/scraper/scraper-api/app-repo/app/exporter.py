"""수집 결과 내보내기: Excel(xlsx) / CSV(Excel 에서 한글이 깨지지 않게 BOM 포함) / JSON."""
import csv
import io
import json
import re
from urllib.parse import quote

from fastapi.responses import Response
from openpyxl import Workbook
from openpyxl.cell.cell import ILLEGAL_CHARACTERS_RE
from openpyxl.styles import Font

FORMATS = ("xlsx", "csv", "json")


def _cell(value):
    if isinstance(value, list):
        value = " | ".join(str(v) for v in value)
    elif isinstance(value, dict):
        value = json.dumps(value, ensure_ascii=False)
    if isinstance(value, str):
        # 수식으로 해석되지 않게 (=, +, -, @ 로 시작하는 수집 문자열)
        if value[:1] in ("=", "+", "-", "@"):
            value = "'" + value
        value = ILLEGAL_CHARACTERS_RE.sub("", value)[:32000]
    return value


def export(fmt: str, name: str, cols: list[str], rows: list[dict]) -> Response:
    safe = re.sub(r'[\\/:*?"<>|\s]+', "_", name).strip("_") or "export"
    disposition = f"attachment; filename=\"export.{fmt}\"; filename*=UTF-8''{quote(safe)}.{fmt}"
    headers = {"Content-Disposition": disposition}

    if fmt == "json":
        body = json.dumps(rows, ensure_ascii=False, indent=2, default=str).encode()
        return Response(body, media_type="application/json", headers=headers)

    if fmt == "csv":
        buf = io.StringIO()
        w = csv.writer(buf)
        w.writerow(cols)
        for row in rows:
            w.writerow(["" if (v := _cell(row.get(c))) is None else v for c in cols])
        return Response(("﻿" + buf.getvalue()).encode(), media_type="text/csv; charset=utf-8", headers=headers)

    wb = Workbook(write_only=True)
    ws = wb.create_sheet("data")
    from openpyxl.cell import WriteOnlyCell

    head = []
    for c in cols:
        cell = WriteOnlyCell(ws, value=c)
        cell.font = Font(bold=True)
        head.append(cell)
    ws.append(head)
    for row in rows:
        ws.append([_cell(row.get(c)) for c in cols])
    out = io.BytesIO()
    wb.save(out)
    return Response(out.getvalue(), headers=headers,
                    media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
