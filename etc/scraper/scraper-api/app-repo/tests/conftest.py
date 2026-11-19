import os
import tempfile

_tmp = tempfile.mkdtemp()
os.environ["SCRAPER_DATABASE_URL"] = f"sqlite:///{_tmp}/test.db"
os.environ["SCRAPER_ALIVE_FILE"] = f"{_tmp}/alive"
os.environ["SCRAPER_MIN_DELAY_MS"] = "0"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.db import Base, engine  # noqa: E402
from app.engine import fetch  # noqa: E402
from app.main import app  # noqa: E402

LIST_1 = """
<html><head><title>상점</title></head><body>
<ul id="list">
  <li class="item"><a class="name" href="/p/1">사과 주스</a><span class="price">1,200원</span><img src="/img/1.png"></li>
  <li class="item"><a class="name" href="/p/2">배 주스</a><span class="price">2,500원</span><img data-src="/img/2.png"></li>
  <li class="item"><a class="name" href="/p/3">포도 주스</a><span class="price">품절</span></li>
</ul>
<a class="next" href="/list?page=2">다음</a>
</body></html>"""
LIST_2 = """
<html><body><ul id="list">
  <li class="item"><a class="name" href="/p/4">귤 주스</a><span class="price">900원</span></li>
</ul></body></html>"""
SITE = {
    "https://shop.test/list": LIST_1,
    "https://shop.test/list?page=1": LIST_1,
    "https://shop.test/list?page=2": LIST_2,
    **{f"https://shop.test/p/{n}": f"<html><body><h1>상품 {n}</h1><p class='desc'>설명 {n}</p></body></html>"
       for n in range(1, 5)},
}


class FakeFetcher:
    """네트워크 없이 SITE 의 HTML 을 돌려준다."""

    def __init__(self, site=None):
        self.site = SITE if site is None else site
        self.calls = []

    def fetch(self, url):
        self.calls.append(url)
        if url not in self.site:
            raise fetch.FetchError("HTTP 404")
        return fetch.Page(url=url, status=200, html=self.site[url])

    def close(self):
        pass


def field(name, selector, type_="text", **kw):
    return {"name": name, "selector": selector, "type": type_, **kw}


def make_config(**kw):
    cfg = {
        "start_urls": ["https://shop.test/list"],
        "item_selector": "li.item",
        "fields": [field("name", "a.name", required=True), field("price", ".price", "number"),
                   field("link", "a.name", "link")],
        "limits": {"max_pages": 10, "max_items": 100, "delay_ms": 0},
    }
    cfg.update(kw)
    return cfg


@pytest.fixture(autouse=True)
def _db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield


@pytest.fixture
def fake(monkeypatch):
    f = FakeFetcher()
    monkeypatch.setattr(fetch, "make_fetcher", lambda config, log=None: f)
    return f


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def auth(client):
    r = client.post("/api/auth/signup", json={"username": "alice", "password": "password1"})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}
