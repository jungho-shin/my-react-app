import pytest

from app.engine import netguard
from app.engine.detect import detect
from app.engine.extract import ExtractError, extract_items, find_link, to_number
from app.engine.fetch import decode_body
from app.engine.runner import RunFailed, execute
from tests.conftest import LIST_1, FakeFetcher, field, make_config


def run(config, fetcher=None, **kw):
    rows, logs = [], []
    stats = execute(config, fetcher or FakeFetcher(), log=logs.append,
                    emit=lambda items, _s: rows.extend(items), **kw)
    return rows, stats, logs


def test_extract_types():
    fields = [field("name", "a.name"), field("price", ".price", "number"), field("link", "a.name", "link"),
              field("img", "img", "image"), field("href", "a.name", "attr", attr="href"),
              field("id", "a.name", "attr", attr="href", regex=r"/p/(\d+)"), field("page", "", "page_url")]
    rows = extract_items(LIST_1, "https://shop.test/list", "li.item", fields)
    assert len(rows) == 3
    assert rows[0] == {"name": "사과 주스", "price": 1200, "link": "https://shop.test/p/1",
                       "img": "https://shop.test/img/1.png", "href": "/p/1", "id": "1",
                       "page": "https://shop.test/list"}
    assert rows[1]["img"] == "https://shop.test/img/2.png"       # data-src
    assert rows[2]["price"] is None and rows[2]["img"] is None


def test_extract_xpath_multiple_required():
    rows = extract_items(LIST_1, "https://shop.test/", "", [
        field("names", "//li/a/text()", multiple=True), field("title", "xpath://title")])
    assert rows == [{"names": ["사과 주스", "배 주스", "포도 주스"], "title": "상점"}]
    rows = extract_items(LIST_1, "https://shop.test/", "li.item", [
        field("name", "a.name"), field("img", "img", "image", required=True)])
    assert [r["name"] for r in rows] == ["사과 주스", "배 주스"]


def test_bad_selector():
    with pytest.raises(ExtractError):
        extract_items(LIST_1, "https://shop.test/", "li..item[", [field("a", "a")])


def test_number_and_charset():
    assert to_number("₩ 12,300") == 12300 and to_number("4.5점") == 4.5 and to_number("없음") is None
    assert decode_body("한글".encode("euc-kr"), "text/html; charset=EUC-KR") == "한글"
    assert decode_body(b'<meta charset="euc-kr">' + "가격".encode("euc-kr"), "text/html").endswith("가격")


def test_next_pagination_and_limits():
    cfg = make_config(pagination={"type": "next", "next_selector": "a.next"})
    assert find_link(LIST_1, "https://shop.test/list", "a.next") == "https://shop.test/list?page=2"
    rows, stats, _ = run(cfg)
    assert [r["name"] for r in rows] == ["사과 주스", "배 주스", "포도 주스", "귤 주스"]
    assert (stats.pages, stats.items) == (2, 4)
    rows, stats, _ = run(cfg, max_pages=1)
    assert stats.pages == 1 and len(rows) == 3
    rows, _, _ = run(make_config(pagination={"type": "next", "next_selector": "a.next"},
                                 limits={"max_pages": 10, "max_items": 2, "delay_ms": 0}))
    assert len(rows) == 2


def test_template_pagination_skips_failed_page():
    cfg = make_config(start_urls=[], pagination={
        "type": "template", "template": "https://shop.test/list?page={page}", "start": 1, "end": 3})
    rows, stats, logs = run(cfg)
    assert len(rows) == 4 and stats.pages == 2 and stats.errors == 1      # 3쪽은 404
    assert any("page=3" in line and "404" in line for line in logs)


def test_detail_pages():
    cfg = make_config(detail={"enabled": True, "link_field": "link",
                              "fields": [field("desc", "p.desc"), field("h1", "h1")]})
    rows, _, _ = run(cfg)
    assert rows[1]["desc"] == "설명 2" and rows[1]["h1"] == "상품 2"
    fetcher = FakeFetcher()
    rows, _, _ = run(cfg, fetcher, detail_limit=1)
    assert rows[0]["desc"] == "설명 1" and "desc" not in rows[1]
    assert len(fetcher.calls) == 2


def test_all_pages_fail_and_cancel():
    with pytest.raises(RunFailed, match="404"):
        run(make_config(start_urls=["https://shop.test/none"]))
    rows, stats, _ = run(make_config(), should_cancel=lambda: True)
    assert stats.canceled and rows == []


def test_netguard(monkeypatch):
    from app.config import get_settings
    netguard.clear_cache()
    for bad in ("http://127.0.0.1/", "http://localhost:8080/x", "http://10.96.0.1/", "http://192.168.45.116:8929/",
                "http://169.254.169.254/latest/meta-data", "http://[::1]/", "file:///etc/passwd", "ftp://a.b/"):
        with pytest.raises(netguard.Blocked):
            netguard.check_url(bad)
    netguard.check_url("http://93.184.216.34/")           # 공인 IP
    monkeypatch.setattr(get_settings(), "allow_hosts", "192.168.45.0/24, intra.test")
    netguard.clear_cache()
    netguard.check_url("http://192.168.45.116:8929/")
    netguard.check_url("http://wiki.intra.test/")
    with pytest.raises(netguard.Blocked):
        netguard.check_url("http://10.0.0.5/")
    netguard.clear_cache()


def test_detect():
    found = detect(LIST_1, "https://shop.test/list")
    assert found, "반복 묶음을 찾아야 한다"
    top = found[0]
    assert top["item_selector"] == "#list > li.item" and top["count"] == 3
    names = {f["name"]: f for f in top["fields"]}
    assert names["title"]["selector"] == "a.name" and names["link"]["type"] == "link"
    assert names["price"]["type"] == "number"
    assert top["sample"][0]["title"] == "사과 주스" and top["sample"][0]["price"] == 1200


def test_skip_known_saves_only_new_rows_and_skips_their_detail_pages():
    cfg = make_config(skip_known=True, key_fields=["link"],
                      detail={"enabled": True, "link_field": "link", "fields": [field("desc", "p.desc")]})
    seen = {"https://shop.test/p/1", "https://shop.test/p/3"}
    fetcher = FakeFetcher()
    rows, stats, logs = run(cfg, fetcher, known=lambda rs: [r["link"] in seen for r in rs])
    assert [r["name"] for r in rows] == ["배 주스"] and rows[0]["desc"] == "설명 2"
    assert (stats.items, stats.skipped) == (1, 2)
    assert fetcher.calls == ["https://shop.test/list", "https://shop.test/p/2"]     # 이미 수집한 것은 상세도 안 엶
    assert any("이미 수집한 2건 건너뜀" in line for line in logs)


def test_skip_known_max_items_is_the_window_to_look_at():
    cfg = make_config(skip_known=True, key_fields=["link"], pagination={"type": "next", "next_selector": "a.next"},
                      limits={"max_pages": 10, "max_items": 3, "delay_ms": 0})
    rows, stats, _ = run(cfg, known=lambda rs: [True] * len(rs))          # 상위 3건이 모두 이미 수집됨
    assert rows == [] and (stats.pages, stats.items, stats.skipped) == (1, 0, 3)   # 다음 페이지로 채우러 가지 않음


def test_skip_known_off_or_without_known_keeps_everything():
    rows, stats, _ = run(make_config(key_fields=["link"]), known=lambda rs: [True] * len(rs))
    assert len(rows) == 3 and stats.skipped == 0
    rows, _, _ = run(make_config(skip_known=True, key_fields=["link"]))   # 미리보기: known 없음
    assert len(rows) == 3
