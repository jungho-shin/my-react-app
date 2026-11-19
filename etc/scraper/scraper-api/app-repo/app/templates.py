"""시작 템플릿. 수집 연습용 공개 사이트(toscrape.com)를 대상으로 한 예제라 바로 실행해 볼 수 있다.
실제 업무용 봇은 템플릿을 고른 뒤 주소와 선택자만 바꾸면 된다."""


def _f(name, selector, type_="text", **kw):
    return {"name": name, "selector": selector, "type": type_, "attr": "", "regex": "",
            "required": False, "multiple": False, **kw}


def _config(**kw):
    base = {
        "start_urls": [], "render": "http", "wait_for": "", "wait_ms": 0, "scroll": 0,
        "item_selector": "", "fields": [],
        "pagination": {"type": "none", "next_selector": "", "template": "", "start": 1, "end": 1, "step": 1},
        "detail": {"enabled": False, "link_field": "", "fields": []},
        "limits": {"max_pages": 5, "max_items": 500, "delay_ms": 1000},
        "key_fields": [], "respect_robots": True, "headers": {}, "user_agent": "",
    }
    base.update(kw)
    return base


TEMPLATES = [
    {
        "id": "product-list",
        "name": "상품 목록 · 가격",
        "description": "상품 카드가 반복되는 목록에서 이름·가격·재고·이미지를 모으고 '다음' 링크를 따라간다. 가격 모니터링의 기본형.",
        "tags": ["목록", "다음 페이지"],
        "config": _config(
            start_urls=["https://books.toscrape.com/"],
            item_selector="article.product_pod",
            fields=[
                _f("상품명", "h3 a", "attr", attr="title", required=True),
                _f("가격", ".price_color", "number"),
                _f("재고", ".availability"),
                _f("이미지", "img", "image"),
                _f("링크", "h3 a", "link"),
            ],
            pagination={"type": "next", "next_selector": "li.next a", "template": "", "start": 1, "end": 1, "step": 1},
            key_fields=["링크"],
        ),
    },
    {
        "id": "list-detail",
        "name": "목록 → 상세 페이지",
        "description": "목록에서 링크를 모은 뒤 각 상세 페이지에 들어가 설명·분류 같은 추가 정보를 붙인다.",
        "tags": ["목록", "상세 페이지"],
        "config": _config(
            start_urls=["https://books.toscrape.com/"],
            item_selector="article.product_pod",
            fields=[
                _f("상품명", "h3 a", "attr", attr="title", required=True),
                _f("가격", ".price_color", "number"),
                _f("링크", "h3 a", "link"),
            ],
            detail={"enabled": True, "link_field": "링크", "fields": [
                _f("분류", "ul.breadcrumb li:nth-child(3) a"),
                _f("설명", "#product_description + p"),
                _f("상품코드", "table.table tr:nth-child(1) td"),
            ]},
            limits={"max_pages": 1, "max_items": 20, "delay_ms": 1000},
            key_fields=["링크"],
        ),
    },
    {
        "id": "numbered-pages",
        "name": "게시글 목록 (페이지 번호)",
        "description": "주소의 페이지 번호만 바뀌는 게시판·리뷰 목록. {page} 자리에 1~N 을 넣어 차례로 수집한다.",
        "tags": ["목록", "페이지 번호"],
        "config": _config(
            item_selector="div.quote",
            fields=[
                _f("내용", "span.text", required=True),
                _f("작성자", "small.author"),
                _f("태그", "a.tag", multiple=True),
            ],
            pagination={"type": "template", "next_selector": "",
                        "template": "https://quotes.toscrape.com/page/{page}/", "start": 1, "end": 3, "step": 1},
            key_fields=["내용"],
        ),
    },
    {
        "id": "js-rendered",
        "name": "JavaScript 로 그려지는 목록",
        "description": "소스 보기에는 데이터가 없고 화면에만 보이는 페이지. 브라우저로 렌더링한 뒤 추출한다.",
        "tags": ["브라우저 렌더링"],
        "config": _config(
            start_urls=["https://quotes.toscrape.com/js/"],
            render="browser", wait_for="div.quote",
            item_selector="div.quote",
            fields=[_f("내용", "span.text", required=True), _f("작성자", "small.author")],
            pagination={"type": "next", "next_selector": "li.next a", "template": "", "start": 1, "end": 1, "step": 1},
            limits={"max_pages": 3, "max_items": 100, "delay_ms": 1000},
        ),
    },
    {
        "id": "table",
        "name": "표(table) 추출",
        "description": "HTML 표의 각 행을 1건으로 수집한다. 열 순서대로 td:nth-child(n) 을 지정.",
        "tags": ["표"],
        "config": _config(
            start_urls=["https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html"],
            item_selector="table.table tr",
            fields=[_f("항목", "th", required=True), _f("값", "td")],
        ),
    },
    {
        "id": "page-meta",
        "name": "페이지 정보 (제목·설명·대표 이미지)",
        "description": "여러 주소를 넣으면 주소마다 1건씩 제목, 설명, 대표 이미지를 모은다. 링크 목록 점검용.",
        "tags": ["단일 페이지"],
        "config": _config(
            start_urls=["https://books.toscrape.com/", "https://quotes.toscrape.com/"],
            fields=[
                _f("주소", "", "page_url"),
                _f("제목", "title"),
                _f("설명", "meta[name=description]", "attr", attr="content"),
                _f("대표이미지", "meta[property='og:image']", "attr", attr="content"),
                _f("h1", "h1"),
            ],
            key_fields=["주소"],
        ),
    },
]
