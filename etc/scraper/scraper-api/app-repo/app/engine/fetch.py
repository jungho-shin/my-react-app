"""페이지 가져오기: 일반 HTTP(빠름) 또는 브라우저 렌더링(JavaScript 로 그려지는 페이지)."""
import os
import re
import time
from dataclasses import dataclass
from typing import Callable
from urllib.parse import urljoin, urlsplit
from urllib.robotparser import RobotFileParser

import httpx

from ..config import get_settings
from .netguard import Blocked, check_url

ROBOTS_AGENT = "uman-scraper"
_BLOCKED_HEADERS = {"host", "content-length", "transfer-encoding", "connection"}


class FetchError(Exception):
    pass


@dataclass
class Page:
    url: str        # 리디렉션을 따라간 최종 주소
    status: int
    html: str


def decode_body(body: bytes, content_type: str) -> str:
    """응답 헤더 → <meta charset> → UTF-8 순으로 문자셋 결정 (EUC-KR 사이트 대응)."""
    m = re.search(r"charset=[\"']?([\w-]+)", content_type or "", re.I)
    enc = m.group(1) if m else None
    if not enc:
        m = re.search(rb"<meta[^>]+charset=[\"']?([\w-]+)", body[:4096], re.I)
        enc = m.group(1).decode("ascii", "ignore") if m else "utf-8"
    try:
        return body.decode(enc, errors="replace")
    except LookupError:
        return body.decode("utf-8", errors="replace")


def browser_available() -> bool:
    try:
        import playwright.sync_api  # noqa: F401
    except ImportError:
        return False
    path = os.environ.get("PLAYWRIGHT_BROWSERS_PATH") or os.path.expanduser("~/.cache/ms-playwright")
    return os.path.isdir(path)


class Fetcher:
    def __init__(self, *, headers: dict | None = None, user_agent: str = "", respect_robots: bool = True,
                 delay_ms: int = 1000, log: Callable[[str], None] = lambda m: None):
        s = get_settings()
        self.settings = s
        self.log = log
        self.respect_robots = respect_robots
        self.delay = max(delay_ms, s.min_delay_ms) / 1000
        self.user_agent = user_agent or s.user_agent
        self.headers = {"Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"}
        self.headers.update({k: v for k, v in (headers or {}).items() if k.lower() not in _BLOCKED_HEADERS})
        self.headers["User-Agent"] = self.user_agent
        self.client = httpx.Client(timeout=s.request_timeout, headers=self.headers, follow_redirects=False)
        self._robots: dict[str, RobotFileParser | None] = {}
        self._last = 0.0

    # ---- 공통 ----
    def fetch(self, url: str) -> Page:
        try:
            check_url(url)
        except Blocked as e:
            raise FetchError(str(e)) from None
        if self.respect_robots and not self._robots_allowed(url):
            raise FetchError("robots.txt 에서 수집을 허용하지 않는 주소입니다")
        wait = self.delay - (time.monotonic() - self._last)
        if self._last and wait > 0:
            time.sleep(wait)
        try:
            return self._get(url)
        finally:
            self._last = time.monotonic()

    def close(self) -> None:
        self.client.close()

    def _get(self, url: str) -> Page:
        raise NotImplementedError

    # ---- HTTP (리디렉션마다 주소 검사, 본문 크기 제한) ----
    def _http_get(self, url: str) -> Page:
        try:
            for _ in range(6):
                check_url(url)
                with self.client.stream("GET", url) as r:
                    if r.status_code in (301, 302, 303, 307, 308) and r.headers.get("location"):
                        url = urljoin(url, r.headers["location"])
                        continue
                    if r.status_code >= 400:
                        raise FetchError(f"HTTP {r.status_code}")
                    chunks, size = [], 0
                    for chunk in r.iter_bytes():
                        size += len(chunk)
                        if size > self.settings.max_body_bytes:
                            raise FetchError("페이지가 너무 큽니다")
                        chunks.append(chunk)
                    return Page(url=url, status=r.status_code,
                                html=decode_body(b"".join(chunks), r.headers.get("content-type", "")))
            raise FetchError("리디렉션이 너무 많습니다")
        except Blocked as e:
            raise FetchError(str(e)) from None
        except httpx.TimeoutException:
            raise FetchError("응답 시간 초과") from None
        except httpx.HTTPError as e:
            raise FetchError(f"연결 실패 ({type(e).__name__})") from None

    def _robots_allowed(self, url: str) -> bool:
        parts = urlsplit(url)
        origin = f"{parts.scheme}://{parts.netloc}"
        if origin not in self._robots:
            rp: RobotFileParser | None = None
            try:
                page = self._http_get(origin + "/robots.txt")
                rp = RobotFileParser()
                rp.parse(page.html.splitlines())
            except FetchError:
                rp = None       # robots.txt 가 없거나 읽을 수 없으면 제한 없음으로 본다
            self._robots[origin] = rp
        rp = self._robots[origin]
        return True if rp is None else rp.can_fetch(ROBOTS_AGENT, url)


class HttpFetcher(Fetcher):
    def _get(self, url: str) -> Page:
        return self._http_get(url)


class BrowserFetcher(Fetcher):
    """헤드리스 Chromium. 실행(run) 하나가 브라우저 하나를 쓰고 끝나면 닫는다."""

    def __init__(self, *, wait_for: str = "", wait_ms: int = 0, scroll: int = 0, **kw):
        super().__init__(**kw)
        self.wait_for, self.wait_ms, self.scroll = wait_for, wait_ms, scroll
        self._pw = self._browser = self._page = None

    def _start(self) -> None:
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            raise FetchError("이 환경에는 브라우저 렌더링이 설치되어 있지 않습니다") from None
        self._pw = sync_playwright().start()
        self._browser = self._pw.chromium.launch(headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
        extra = {k: v for k, v in self.headers.items() if k != "User-Agent"}
        ctx = self._browser.new_context(user_agent=self.user_agent, locale="ko-KR", extra_http_headers=extra,
                                        viewport={"width": 1366, "height": 900})
        ctx.route("**/*", self._route)
        self._page = ctx.new_page()

    @staticmethod
    def _route(route) -> None:
        req = route.request
        if req.resource_type in ("image", "media", "font"):
            return route.abort()
        if req.url.startswith(("http://", "https://")):
            try:
                check_url(req.url)      # 페이지 안의 스크립트가 내부망을 부르는 것도 차단
            except Blocked:
                return route.abort()
        return route.continue_()

    def _get(self, url: str) -> Page:
        from playwright.sync_api import Error as PwError
        from playwright.sync_api import TimeoutError as PwTimeout

        if self._page is None:
            self._start()
        page = self._page
        timeout = self.settings.request_timeout * 1000
        try:
            resp = page.goto(url, wait_until="domcontentloaded", timeout=timeout)
            status = resp.status if resp else 200
            if status >= 400:
                raise FetchError(f"HTTP {status}")
            try:
                if self.wait_for:
                    page.wait_for_selector(self.wait_for, timeout=10000)
                else:
                    page.wait_for_load_state("networkidle", timeout=5000)
            except PwTimeout:
                self.log(f"  ! 대기 조건을 채우지 못했지만 계속 진행: {self.wait_for or '네트워크 유휴'}")
            for _ in range(self.scroll):        # 스크롤로 더 불러오는 목록
                page.mouse.wheel(0, 20000)
                page.wait_for_timeout(800)
            if self.wait_ms:
                page.wait_for_timeout(self.wait_ms)
            return Page(url=page.url, status=status, html=page.content())
        except PwTimeout:
            raise FetchError("응답 시간 초과 (브라우저)") from None
        except PwError as e:
            raise FetchError(f"브라우저 오류: {str(e).splitlines()[0][:200]}") from None

    def close(self) -> None:
        super().close()
        for obj, method in ((self._browser, "close"), (self._pw, "stop")):
            try:
                if obj:
                    getattr(obj, method)()
            except Exception:  # noqa: BLE001  (종료 중 오류는 무시)
                pass
        self._pw = self._browser = self._page = None


def make_fetcher(config: dict, log: Callable[[str], None] = lambda m: None) -> Fetcher:
    common = dict(
        headers=config.get("headers") or {},
        user_agent=config.get("user_agent") or "",
        respect_robots=config.get("respect_robots", True),
        delay_ms=(config.get("limits") or {}).get("delay_ms", 1000),
        log=log,
    )
    if config.get("render") == "browser":
        return BrowserFetcher(wait_for=config.get("wait_for") or "", wait_ms=config.get("wait_ms") or 0,
                              scroll=config.get("scroll") or 0, **common)
    return HttpFetcher(**common)
