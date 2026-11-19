"""자동 감지: 페이지에서 '반복되는 묶음'(상품 카드, 게시글 행 ...)을 찾아 목록 선택자와 필드를 제안한다.

방법: 같은 부모 아래 같은 태그(+첫 클래스)의 자식이 3개 이상이면 후보.
      점수 = 개수 × 항목당 글자 수(상한) × (링크가 있으면 가산) → 상위 몇 개를 실제 추출 결과와 함께 돌려준다.
"""
import re

from parsel import Selector

from .extract import extract_items

_SAFE = re.compile(r"^[A-Za-z_][A-Za-z0-9_-]*$")
_SKIP_TAGS = {"script", "style", "noscript", "option", "br", "hr", "svg", "path", "head", "meta", "link",
              "colgroup", "col", "thead"}
_PRICE = re.compile(r"\d[\d,.]*\s*(원|₩|\$|€|£|¥|USD|KRW)|(₩|\$|€|£|¥)\s*\d")


def _classes(el) -> list[str]:
    return [c for c in (el.get("class") or "").split() if _SAFE.match(c)]


def _simple(el) -> str:
    """요소 하나를 가리키는 짧은 선택자: tag.class (클래스 없으면 tag)."""
    cls = _classes(el)
    return f"{el.tag}.{cls[0]}" if cls else el.tag


def _path(el, depth: int = 3) -> str:
    """부모 쪽으로 올라가며 만든 선택자. id 를 만나면 거기서 멈춘다."""
    parts = []
    cur = el
    while cur is not None and isinstance(cur.tag, str) and cur.tag not in ("html", "body") and len(parts) < depth:
        el_id = cur.get("id")
        if el_id and _SAFE.match(el_id) and not re.search(r"\d{3,}", el_id):
            parts.append(f"#{el_id}")
            break
        parts.append(_simple(cur))
        cur = cur.getparent()
    return " > ".join(reversed(parts))


def _rel(el, item) -> str:
    """항목(item) 안에서 el 을 가리키는 선택자."""
    parts = []
    cur = el
    while cur is not None and cur is not item and len(parts) < 3:
        parts.append(_simple(cur))
        cur = cur.getparent()
    return " ".join(reversed(parts))


def _own_text(el) -> str:
    return " ".join("".join(el.itertext()).split())


def _suggest_fields(item) -> list[dict]:
    fields: list[dict] = []
    used_names: set[str] = set()
    used_selectors: set[tuple] = set()

    def add(name: str, selector: str, kind: str) -> None:
        if (selector, kind) in used_selectors or len(fields) >= 8:
            return
        base, n = name, 2
        while name in used_names:
            name, n = f"{base}{n}", n + 1
        used_names.add(name)
        used_selectors.add((selector, kind))
        fields.append({"name": name, "selector": selector, "type": kind, "attr": "", "regex": "",
                       "required": False, "multiple": False})

    # 제목 + 링크: 글자가 있는 첫 번째 링크
    for a in item.iter("a"):
        if a.get("href") and len(_own_text(a)) >= 2:
            sel = _rel(a, item) if a is not item else ""
            add("title", sel, "text")
            add("link", sel, "link")
            break
    else:
        if item.tag == "a" and item.get("href"):
            add("link", "", "link")
    for img in item.iter("img"):
        add("image", _rel(img, item), "image")
        break
    # 나머지: 글자를 직접 가진 말단 요소
    for el in item.iter():
        if not isinstance(el.tag, str) or el.tag in _SKIP_TAGS or el is item:
            continue
        if len(el) > 0 and not (el.text or "").strip():
            continue
        text = _own_text(el)
        if not text or len(text) > 300:
            continue
        cls = _classes(el)
        if _PRICE.search(text):
            add("price", _rel(el, item), "number")
        elif el.tag == "time" or (cls and re.search(r"date|time", cls[0], re.I)):
            add("date", _rel(el, item), "text")
        elif cls:
            add(re.sub(r"[^A-Za-z0-9_]", "_", cls[0])[:30], _rel(el, item), "text")
        elif el.tag in ("h1", "h2", "h3", "h4", "h5", "p", "td", "span", "strong", "em"):
            add(el.tag, _rel(el, item), "text")
    if not fields:
        add("text", "", "text")
    return fields


def detect(html: str, base_url: str, limit: int = 5) -> list[dict]:
    root = Selector(text=html or "<html></html>").root
    candidates = []
    for parent in root.iter():
        if not isinstance(parent.tag, str) or parent.tag in _SKIP_TAGS:
            continue
        groups: dict[str, list] = {}
        for child in parent:
            if isinstance(child.tag, str) and child.tag not in _SKIP_TAGS:
                groups.setdefault(_simple(child), []).append(child)
        for key, members in groups.items():
            if len(members) < 3:
                continue
            lengths = [len(_own_text(m)) for m in members]
            avg = sum(lengths) / len(lengths)
            if avg < 8:
                continue
            links = sum(1 for m in members if m.tag == "a" or m.find(".//a") is not None)
            score = len(members) * min(avg, 400) * (1.5 if links >= len(members) / 2 else 1.0)
            parent_sel = _path(parent)
            selector = f"{parent_sel} > {key}" if parent_sel else key
            candidates.append((score, selector, members))

    candidates.sort(key=lambda c: -c[0])
    out, seen = [], set()
    for _score, selector, members in candidates:
        if selector in seen:
            continue
        seen.add(selector)
        fields = _suggest_fields(members[len(members) // 2])
        try:
            rows = extract_items(html, base_url, selector, fields)
        except Exception:  # noqa: BLE001  (만든 선택자가 맞지 않으면 그 후보는 버림)
            continue
        if len(rows) < 2:
            continue
        # 표본에서 항상 비어 있는 필드는 제안에서 뺀다
        fields = [f for f in fields if any(r.get(f["name"]) is not None for r in rows)]
        out.append({
            "item_selector": selector,
            "count": len(rows),
            "fields": fields,
            "sample": [{f["name"]: r.get(f["name"]) for f in fields} for r in rows[:5]],
        })
        if len(out) >= limit:
            break
    return out
