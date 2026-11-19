"""수집 대상 주소 검사 (SSRF 방지).

수집기는 클러스터 안에서 돌기 때문에, 그대로 두면 사용자가 입력한 주소로 내부 서비스
(Kubernetes API, GitLab, DB, 클라우드 메타데이터 등)를 읽을 수 있다.
→ http/https 만 허용하고, 이름을 풀어 나온 IP 가 공인 주소일 때만 요청한다.
   내부 사이트를 수집해야 하면 SCRAPER_ALLOW_HOSTS 에 그 호스트만 추가한다.
"""
import ipaddress
import socket
import time
from urllib.parse import urlsplit

from ..config import get_settings


class Blocked(Exception):
    pass


_cache: dict[str, tuple[float, str | None]] = {}
_TTL = 60.0


def _allow_rules() -> tuple[list[str], list]:
    names, nets = [], []
    for raw in get_settings().allow_hosts.split(","):
        rule = raw.strip().lower()
        if not rule:
            continue
        try:
            nets.append(ipaddress.ip_network(rule, strict=False))
        except ValueError:
            names.append(rule.lstrip("."))
    return names, nets


def _is_public(ip: ipaddress._BaseAddress) -> bool:
    if getattr(ip, "ipv4_mapped", None):
        ip = ip.ipv4_mapped
    return ip.is_global and not ip.is_multicast


def _check_host(host: str) -> str | None:
    """문제가 없으면 None, 막아야 하면 이유."""
    names, nets = _allow_rules()
    if any(host == n or host.endswith("." + n) for n in names):
        return None
    try:
        infos = socket.getaddrinfo(host, None, type=socket.SOCK_STREAM)
    except (socket.gaierror, UnicodeError):
        return f"주소를 찾을 수 없습니다: {host}"
    ips = {ipaddress.ip_address(info[4][0].split("%")[0]) for info in infos}
    if not ips:
        return f"주소를 찾을 수 없습니다: {host}"
    for ip in ips:
        if _is_public(ip) or any(ip in net for net in nets):
            continue
        return f"내부망 주소는 수집할 수 없습니다: {host} ({ip})"
    return None


def check_url(url: str) -> None:
    """수집해도 되는 주소가 아니면 Blocked."""
    parts = urlsplit(url)
    if parts.scheme not in ("http", "https"):
        raise Blocked(f"http/https 주소만 수집할 수 있습니다: {url[:120]}")
    host = (parts.hostname or "").lower().rstrip(".")
    if not host:
        raise Blocked(f"주소 형식이 올바르지 않습니다: {url[:120]}")
    if get_settings().allow_private:
        return
    now = time.monotonic()
    hit = _cache.get(host)
    if hit and now - hit[0] < _TTL:
        reason = hit[1]
    else:
        reason = _check_host(host)
        _cache[host] = (now, reason)
    if reason:
        raise Blocked(reason)


def clear_cache() -> None:
    _cache.clear()
