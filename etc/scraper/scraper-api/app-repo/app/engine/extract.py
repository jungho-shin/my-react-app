"""HTML → 데이터. 선택자는 CSS 가 기본이고, `xpath:` 로 시작하거나 `/` `(` 로 시작하면 XPath 로 해석한다."""
import re
from urllib.parse import urljoin

from parsel import Selector


class ExtractError(Exception):
    pass


def select(node: Selector, selector: str):
    s = (selector or "").strip()
    if not s:
        return [node]
    try:
        if s.startswith("xpath:"):
            return node.xpath(s[6:].strip())
        if s.startswith(("/", "./", "(")):
            return node.xpath(s)
        return node.css(s)
    except Exception as e:  # noqa: BLE001  (cssselect / lxml 의 문법 오류)
        raise ExtractError(f"선택자 문법 오류: {s} ({str(e)[:120]})") from None


def _text(node: Selector) -> str:
    if isinstance(node.root, str):
        return " ".join(node.root.split())
    return " ".join((node.xpath("string()").get() or "").split())


def _attr_or_child(node: Selector, attrs: tuple[str, ...], child_css: str) -> str | None:
    """노드 자신의 속성 → 없으면 안쪽 첫 번째 해당 요소의 속성."""
    if isinstance(node.root, str):
        return node.root.strip() or None
    for target in (node, *node.css(child_css)[:1]):
        for a in attrs:
            v = target.attrib.get(a)
            if v and v.strip():
                return v.strip()
    return None


_NUM = re.compile(r"-?\d[\d,]*(?:\.\d+)?")


def to_number(text: str):
    m = _NUM.search(text or "")
    if not m:
        return None
    raw = m.group(0).replace(",", "")
    return float(raw) if "." in raw else int(raw)


def _value(node: Selector, field: dict, base_url: str):
    kind = field.get("type", "text")
    if kind == "html":
        value = node.root if isinstance(node.root, str) else node.get()
    elif kind == "attr":
        value = node.root.strip() if isinstance(node.root, str) else node.attrib.get(field.get("attr") or "")
    elif kind == "link":
        href = _attr_or_child(node, ("href",), "a[href]")
        value = urljoin(base_url, href) if href else None
    elif kind == "image":
        src = _attr_or_child(node, ("src", "data-src", "data-original", "data-lazy-src"), "img")
        value = urljoin(base_url, src) if src else None
    else:
        value = _text(node)

    pattern = field.get("regex")
    if pattern and isinstance(value, str):
        m = re.search(pattern, value)
        value = (m.group(1) if m.groups() else m.group(0)) if m else None
    if kind == "number":
        value = to_number(value) if isinstance(value, str) else None
    if isinstance(value, str):
        value = value.strip()
    return value if value not in ("", None) else None


def extract_fields(node: Selector, fields: list[dict], base_url: str) -> dict:
    row = {}
    for f in fields:
        if f.get("type") == "page_url":
            row[f["name"]] = base_url
            continue
        nodes = select(node, f.get("selector", ""))
        if f.get("multiple"):
            values = [v for v in (_value(n, f, base_url) for n in nodes) if v is not None]
            row[f["name"]] = values or None
        else:
            row[f["name"]] = next((v for v in (_value(n, f, base_url) for n in nodes) if v is not None), None)
    return row


def extract_items(html: str, base_url: str, item_selector: str, fields: list[dict]) -> list[dict]:
    """목록 선택자가 있으면 항목마다 1행, 없으면 페이지 전체가 1행. 필수 필드가 빈 행과 완전히 빈 행은 버린다."""
    root = Selector(text=html or "<html></html>")
    required = [f["name"] for f in fields if f.get("required")]
    rows = []
    for node in select(root, item_selector):
        row = extract_fields(node, fields, base_url)
        if any(row.get(name) is None for name in required):
            continue
        if all(v is None for k, v in row.items() if not _is_page_url(fields, k)):
            continue
        rows.append(row)
    return rows


def _is_page_url(fields: list[dict], name: str) -> bool:
    return any(f["name"] == name and f.get("type") == "page_url" for f in fields)


def find_link(html: str, base_url: str, selector: str) -> str | None:
    """'다음 페이지' 링크 주소."""
    root = Selector(text=html or "<html></html>")
    for node in select(root, selector):
        href = _attr_or_child(node, ("href",), "a[href]")
        if href and not href.lower().startswith(("javascript:", "#")):
            return urljoin(base_url, href)
    return None
