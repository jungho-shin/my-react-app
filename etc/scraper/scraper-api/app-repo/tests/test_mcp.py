import json

from app import worker
from tests.conftest import make_config


def rpc(client, headers, method, params=None, rid=1):
    body = {"jsonrpc": "2.0", "method": method, "params": params or {}}
    if rid is not None:
        body["id"] = rid
    return client.post("/api/mcp", json=body, headers=headers)


def call(client, headers, name, args=None):
    r = rpc(client, headers, "tools/call", {"name": name, "arguments": args or {}}).json()["result"]
    text = r["content"][0]["text"]
    return r["isError"], (text if r["isError"] else json.loads(text))


def key_headers(client, auth):
    return {"X-API-Key": client.post("/api/keys", json={"name": "mcp"}, headers=auth).json()["key"]}


def test_protocol(client, auth):
    assert client.post("/api/mcp", json={"jsonrpc": "2.0", "id": 1, "method": "ping"}).status_code == 401
    h = key_headers(client, auth)
    init = rpc(client, h, "initialize", {"protocolVersion": "2025-03-26", "capabilities": {},
                                         "clientInfo": {"name": "t", "version": "1"}}).json()["result"]
    assert init["protocolVersion"] == "2025-03-26" and "tools" in init["capabilities"]
    assert init["serverInfo"]["name"] == "scraper"
    assert rpc(client, h, "initialize", {"protocolVersion": "2099-01-01"}).json()["result"]["protocolVersion"] == "2025-06-18"
    assert rpc(client, h, "notifications/initialized", rid=None).status_code == 202        # 알림은 응답 본문 없음
    assert rpc(client, h, "ping").json() == {"jsonrpc": "2.0", "id": 1, "result": {}}
    tools = rpc(client, h, "tools/list").json()["result"]["tools"]
    assert {"list_bots", "run_bot", "get_items", "create_bot", "detect_page", "preview_config"} <= {t["name"] for t in tools}
    assert all(t["inputSchema"]["type"] == "object" and t["description"] for t in tools)
    assert rpc(client, h, "resources/list").json()["error"]["code"] == -32601
    assert client.post("/api/mcp", content="{", headers={**h, "Content-Type": "application/json"}).json()["error"]["code"] == -32700
    batch = client.post("/api/mcp", headers=h, json=[
        {"jsonrpc": "2.0", "id": "a", "method": "ping"}, {"jsonrpc": "2.0", "method": "notifications/initialized"}])
    assert [m["id"] for m in batch.json()] == ["a"]
    assert client.get("/api/mcp", headers=h).status_code == 405
    # 화면 로그인 토큰으로도 호출 가능
    assert rpc(client, auth, "ping").status_code == 200


def test_tools_end_to_end(client, auth, fake, monkeypatch):
    h = key_headers(client, auth)
    err, found = call(client, h, "detect_page", {"url": "https://shop.test/list"})
    assert not err and found["candidates"][0]["item_selector"] == "#list > li.item"
    err, pre = call(client, h, "preview_config", {"config": make_config()})
    assert not err and len(pre["items"]) == 3

    err, msg = call(client, h, "create_bot", {"name": "주스", "config": make_config(fields=[])})
    assert err and "fields" in msg                                   # 검증 오류는 isError 로 전달
    err, bot = call(client, h, "create_bot", {"name": "주스", "config": make_config(key_fields=["link"]),
                                              "schedule_type": "daily", "schedule_value": "09:00"})
    assert not err and bot["next_run_at"]
    err, bots = call(client, h, "list_bots")
    assert [b["name"] for b in bots] == ["주스"]
    err, msg = call(client, h, "get_items", {"bot_id": bot["id"]})
    assert err and "성공한 실행" in msg

    # run_bot 이 기다리는 동안 워커가 처리한 것처럼
    from app.routers import mcp
    monkeypatch.setattr(mcp, "_wait", lambda run_id, seconds: worker.process(worker.claim("test")))
    err, run = call(client, h, "run_bot", {"bot_id": bot["id"], "wait_seconds": 5})
    assert not err and (run["status"], run["item_count"], run["trigger"]) == ("success", 3, "api")
    assert "3건" in run["log"]
    err, same = call(client, h, "get_run", {"run_id": run["id"]})
    assert same["status"] == "success"
    err, data = call(client, h, "get_items", {"bot_id": bot["id"], "limit": 2})
    assert not err and data["total"] == 3 and len(data["items"]) == 2
    assert data["items"][0]["name"] == "사과 주스" and data["items"][0]["_new"] is True

    for name, args, expect in (("get_bot", {"bot_id": 999}, "찾을 수 없습니다"), ("get_items", {}, "bot_id 또는 run_id"),
                               ("run_bot", {"bot_id": "x"}, "정수"), ("nope", {}, "없는 도구")):
        err, msg = call(client, h, name, args)
        assert err and expect in msg, (name, msg)
