import io

from openpyxl import load_workbook

from app import worker
from app.db import SessionLocal, utcnow
from app.models import Bot, Run
from tests.conftest import make_config


def bot_body(**kw):
    body = {"name": "주스 가격", "description": "테스트", "config": make_config(key_fields=["link"])}
    body.update(kw)
    return body


def test_auth_flow(client):
    assert client.get("/api/bots").status_code == 401
    r = client.post("/api/auth/signup", json={"username": "Alice", "password": "password1"})
    assert r.json()["user"] == {**r.json()["user"], "username": "alice", "is_admin": True}      # 첫 가입자 = 관리자
    assert client.post("/api/auth/signup", json={"username": "alice", "password": "password1"}).status_code == 409
    assert client.post("/api/auth/signup", json={"username": "bob", "password": "short"}).status_code == 422
    bob = client.post("/api/auth/signup", json={"username": "bob", "password": "password2"}).json()
    assert bob["user"]["is_admin"] is False
    assert client.post("/api/auth/login", json={"username": "bob", "password": "nope-nope"}).status_code == 401
    token = client.post("/api/auth/login", json={"username": "BOB", "password": "password2"}).json()["token"]
    h = {"Authorization": f"Bearer {token}"}
    assert client.get("/api/auth/me", headers=h).json()["username"] == "bob"
    assert client.get("/api/admin/users", headers=h).status_code == 403


def test_bot_validation(client, auth):
    bad = [
        bot_body(config=make_config(start_urls=["ftp://x"])),
        bot_body(config=make_config(start_urls=[])),
        bot_body(config=make_config(fields=[])),
        bot_body(config=make_config(key_fields=["없는필드"])),
        bot_body(config=make_config(fields=[{"name": "a", "selector": "b", "regex": "("}])),
        bot_body(config=make_config(pagination={"type": "template", "template": "https://a.test/x"})),
        bot_body(schedule_type="interval", schedule_value="1"),
        bot_body(schedule_type="cron", schedule_value="nope"),
        bot_body(schedule_type="daily", schedule_value="25:00"),
        bot_body(webhook_url="javascript:alert(1)"),
    ]
    for body in bad:
        r = client.post("/api/bots", json=body, headers=auth)
        assert r.status_code == 422, body


def test_bot_crud_and_permissions(client, auth):
    r = client.post("/api/bots", json=bot_body(schedule_type="daily", schedule_value="09:30"), headers=auth)
    assert r.status_code == 201, r.text
    bot = r.json()
    assert bot["next_run_at"] and bot["can_edit"] and bot["config"]["limits"]["max_pages"] == 10
    bob = client.post("/api/auth/signup", json={"username": "bob", "password": "password2"}).json()
    hb = {"Authorization": f"Bearer {bob['token']}"}
    assert client.get("/api/bots", headers=hb).json()[0]["can_edit"] is False      # 모두 볼 수 있지만
    assert client.put(f"/api/bots/{bot['id']}", json=bot_body(name="x"), headers=hb).status_code == 403
    assert client.delete(f"/api/bots/{bot['id']}", headers=hb).status_code == 403
    r = client.put(f"/api/bots/{bot['id']}", json=bot_body(name="새 이름"), headers=auth)
    assert r.json()["name"] == "새 이름" and r.json()["next_run_at"] is None       # 예약 해제
    assert client.delete(f"/api/bots/{bot['id']}", headers=auth).status_code == 200
    assert client.get(f"/api/bots/{bot['id']}", headers=auth).status_code == 404


def test_preview_and_detect(client, auth, fake):
    r = client.post("/api/preview", json=make_config(pagination={"type": "next", "next_selector": "a.next"}),
                    headers=auth)
    data = r.json()
    assert r.status_code == 200 and data["error"] == ""
    assert data["columns"] == ["name", "price", "link"] and len(data["items"]) == 3      # 첫 페이지만
    r = client.post("/api/preview", json=make_config(item_selector="li[["), headers=auth)
    assert "선택자 문법 오류" in r.json()["error"]
    r = client.post("/api/detect", json={"url": "https://shop.test/list"}, headers=auth)
    assert r.json()["candidates"][0]["item_selector"] == "#list > li.item"
    assert client.post("/api/detect", json={"url": "https://shop.test/none"}, headers=auth).status_code == 400


def test_run_export_and_new_flags(client, auth, fake):
    bot = client.post("/api/bots", json=bot_body(), headers=auth).json()
    run = client.post(f"/api/bots/{bot['id']}/run", headers=auth)
    assert run.status_code == 202 and run.json()["status"] == "queued"
    assert client.post(f"/api/bots/{bot['id']}/run", headers=auth).status_code == 409    # 중복 실행 방지
    assert client.get(f"/api/bots/{bot['id']}/latest/items", headers=auth).status_code == 404

    run_id = worker.claim("test")
    assert run_id == run.json()["id"] and worker.claim("test") is None
    worker.process(run_id)
    done = client.get(f"/api/runs/{run_id}", headers=auth).json()
    assert (done["status"], done["pages"], done["item_count"], done["new_count"]) == ("success", 1, 3, 3)
    assert "사과" not in done["log"] and "3건" in done["log"]

    items = client.get(f"/api/runs/{run_id}/items", headers=auth).json()
    assert items["total"] == 3 and items["items"][0]["data"]["name"] == "사과 주스"

    # 두 번째 실행: 목록에 1건 추가 → 신규 1건만 표시
    fake.site = dict(fake.site)
    fake.site["https://shop.test/list"] = fake.site["https://shop.test/list"].replace(
        "</ul>", '<li class="item"><a class="name" href="/p/9">새 주스</a><span class="price">3,000원</span></li></ul>')
    client.post(f"/api/bots/{bot['id']}/run", headers=auth)
    run2 = worker.claim("test")
    worker.process(run2)
    latest = client.get(f"/api/bots/{bot['id']}/latest/items?new_only=true", headers=auth).json()
    assert latest["run"]["id"] == run2 and latest["run"]["new_count"] == 1
    assert [i["data"]["name"] for i in latest["items"]] == ["새 주스"]

    x = client.get(f"/api/runs/{run2}/export?format=xlsx", headers=auth)
    ws = load_workbook(io.BytesIO(x.content)).active
    rows = list(ws.iter_rows(values_only=True))
    assert rows[0] == ("name", "price", "link") and len(rows) == 5 and rows[1][1] == 1200
    c = client.get(f"/api/runs/{run2}/export?format=csv", headers=auth)
    assert c.content.startswith(b"\xef\xbb\xbf") and "사과 주스".encode() in c.content
    assert len(client.get(f"/api/bots/{bot['id']}/latest/export?format=json", headers=auth).json()) == 4
    assert client.get(f"/api/runs/{run2}/export?format=pdf", headers=auth).status_code == 400

    dash = client.get("/api/dashboard", headers=auth).json()
    assert dash["bots"] == 1 and dash["runs_24h"] == 2 and dash["items_24h"] == 7 and len(dash["days"]) == 7


def test_failed_run_and_cancel(client, auth, fake):
    bot = client.post("/api/bots", json=bot_body(config=make_config(start_urls=["https://shop.test/none"])),
                      headers=auth).json()
    client.post(f"/api/bots/{bot['id']}/run", headers=auth)
    run_id = worker.claim("test")
    worker.process(run_id)
    failed = client.get(f"/api/runs/{run_id}", headers=auth).json()
    assert failed["status"] == "failed" and "404" in failed["error"]

    queued = client.post(f"/api/bots/{bot['id']}/run", headers=auth).json()
    assert client.post(f"/api/runs/{queued['id']}/cancel", headers=auth).json()["status"] == "canceled"
    assert client.post(f"/api/runs/{queued['id']}/cancel", headers=auth).status_code == 409


def test_api_keys(client, auth):
    made = client.post("/api/keys", json={"name": "BI 연동"}, headers=auth).json()
    assert made["key"].startswith("usk_") and "key" not in client.get("/api/keys", headers=auth).json()[0]
    assert client.get("/api/bots", headers={"X-API-Key": made["key"]}).status_code == 200
    assert client.get("/api/bots", headers={"Authorization": f"Bearer {made['key']}"}).status_code == 200
    assert client.get("/api/bots", headers={"X-API-Key": "usk_wrong"}).status_code == 401
    assert client.post("/api/keys", json={"name": "x"}, headers={"X-API-Key": made["key"]}).status_code == 403
    client.delete(f"/api/keys/{made['id']}", headers=auth)
    assert client.get("/api/bots", headers={"X-API-Key": made["key"]}).status_code == 401


def test_schedule_tick_and_stale(client, auth, fake):
    bot = client.post("/api/bots", json=bot_body(schedule_type="interval", schedule_value="30"), headers=auth).json()
    assert worker.schedule_tick() == 0                       # 아직 시각 전
    with SessionLocal() as db:
        db.get(Bot, bot["id"]).next_run_at = utcnow()
        db.commit()
    assert worker.schedule_tick() == 1
    assert worker.schedule_tick() == 0                       # 다음 시각으로 넘어감
    with SessionLocal() as db:
        run = db.query(Run).one()
        assert run.trigger == "schedule" and db.get(Bot, bot["id"]).next_run_at > utcnow()
        run.status, run.heartbeat_at = "running", utcnow().replace(year=2020)
        db.commit()
    worker.recover_stale()
    with SessionLocal() as db:
        assert db.query(Run).one().status == "failed"


def test_prune_keeps_recent_runs(client, auth, fake, monkeypatch):
    from app.config import get_settings
    monkeypatch.setattr(get_settings(), "keep_runs", 2)
    bot = client.post("/api/bots", json=bot_body(), headers=auth).json()
    for _ in range(4):
        client.post(f"/api/bots/{bot['id']}/run", headers=auth)
        worker.process(worker.claim("test"))
    runs = client.get(f"/api/runs?bot_id={bot['id']}", headers=auth).json()
    assert runs["total"] == 2


def test_info_and_health(client):
    assert client.get("/health").json()["status"] == "ok"
    assert client.get("/").json()["app"] == "scraper-api"
    assert client.get("/api/info").json()["app"] == "scraper-api"
    assert client.get("/api/nope").status_code == 404


def test_skip_known_bot_stores_only_new_data(client, auth, fake):
    body = bot_body(); body["config"]["skip_known"] = True
    bot = client.post("/api/bots", json=body, headers=auth).json()

    def run_once():
        client.post(f"/api/bots/{bot['id']}/run", headers=auth)
        run_id = worker.claim("test")
        worker.process(run_id)
        done = client.get(f"/api/runs/{run_id}", headers=auth).json()
        names = [i["data"]["name"] for i in client.get(f"/api/runs/{run_id}/items", headers=auth).json()["items"]]
        return done, names

    done, names = run_once()
    assert done["item_count"] == 3 and len(names) == 3                          # 처음엔 모두 새 데이터
    fake.site = dict(fake.site)
    fake.site["https://shop.test/list"] = fake.site["https://shop.test/list"].replace(
        "</ul>", '<li class="item"><a class="name" href="/p/10">망고 주스</a><span class="price">3,500원</span></li></ul>')
    done, names = run_once()
    assert names == ["망고 주스"] and (done["item_count"], done["new_count"]) == (1, 1)
    assert "이미 수집해 건너뜀 3건" in done["log"]
    done, names = run_once()
    assert (done["status"], done["pages"], done["item_count"], names) == ("success", 1, 0, [])   # 새 것이 없으면 0건
