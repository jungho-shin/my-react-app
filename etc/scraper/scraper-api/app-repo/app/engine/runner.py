"""봇 설정(config)대로 페이지를 돌며 데이터를 모은다. DB 와 무관 → 워커와 미리보기가 같이 쓴다."""
from dataclasses import dataclass
from typing import Callable

from parsel import Selector

from .extract import ExtractError, extract_fields, extract_items, find_link
from .fetch import FetchError, Fetcher


@dataclass
class Stats:
    pages: int = 0
    items: int = 0
    errors: int = 0
    skipped: int = 0            # skip_known: 이전 실행에서 이미 수집해 건너뛴 건수 (items 에 들어가지 않음)
    canceled: bool = False


class RunFailed(Exception):
    pass


def _page_urls(config: dict) -> list[str]:
    pg = config.get("pagination") or {}
    if pg.get("type") == "template" and pg.get("template"):
        step = max(int(pg.get("step") or 1), 1)
        return [pg["template"].replace("{page}", str(n))
                for n in range(int(pg.get("start", 1)), int(pg.get("end", 1)) + 1, step)]
    return list(config.get("start_urls") or [])


def execute(
    config: dict,
    fetcher: Fetcher,
    *,
    log: Callable[[str], None],
    emit: Callable[[list[dict], Stats], None],
    should_cancel: Callable[[], bool] = lambda: False,
    max_pages: int | None = None,
    max_items: int | None = None,
    detail_limit: int | None = None,
    known: Callable[[list[dict]], list[bool]] | None = None,
) -> Stats:
    """known: 행 목록 → 행마다 '이전 실행에서 이미 수집한 데이터인가'. config.skip_known 이 켜져 있을 때만 쓴다.
    skip_known 이면 max_items 는 '살펴볼 건수'다 (예: 상위 10건을 보고 그중 처음 보는 것만 저장)."""
    limits = config.get("limits") or {}
    max_pages = min(max_pages or 10**9, int(limits.get("max_pages", 10)))
    max_items = min(max_items or 10**9, int(limits.get("max_items", 1000)))
    pg = config.get("pagination") or {}
    follow_next = pg.get("type") == "next" and pg.get("next_selector")
    detail = config.get("detail") or {}
    use_detail = bool(detail.get("enabled") and detail.get("link_field") and detail.get("fields"))
    fields = config.get("fields") or []
    skip = known if config.get("skip_known") else None
    key_fields = config.get("key_fields") or []
    # 기준 필드가 목록 페이지에 다 있으면 상세 페이지를 열기 전에 거른다 (이미 수집한 것은 상세 요청도 안 함)
    list_names = {f.get("name") for f in fields}
    skip_early = bool(skip) and bool(key_fields) and all(k in list_names for k in key_fields)
    taken = 0                   # 살펴본 건수 (max_items 기준)

    def drop_known(rows: list[dict]) -> list[dict]:
        flags = skip(rows) if rows else []
        stats.skipped += sum(flags)
        return [r for r, k in zip(rows, flags) if not k]

    queue = _page_urls(config)
    seen: set[str] = set()
    stats = Stats()
    details_done = 0
    last_error = ""

    while queue and stats.pages < max_pages and taken < max_items:
        if should_cancel():
            stats.canceled = True
            break
        url = queue.pop(0)
        if url in seen:
            continue
        seen.add(url)

        try:
            page = fetcher.fetch(url)
        except FetchError as e:
            stats.errors += 1
            last_error = f"{url} → {e}"
            log(f"✗ {url} → {e}")
            continue
        stats.pages += 1

        try:
            rows = extract_items(page.html, page.url, config.get("item_selector", ""), fields)
        except ExtractError as e:
            raise RunFailed(str(e)) from None
        rows = rows[: max_items - taken]
        taken += len(rows)
        log(f"✓ [{stats.pages}] {page.url} → {len(rows)}건")
        if skip_early:
            before = len(rows)
            rows = drop_known(rows)
            if before != len(rows):
                log(f"  이미 수집한 {before - len(rows)}건 건너뜀 → 새 데이터 {len(rows)}건")

        if use_detail:
            for row in rows:
                if should_cancel():
                    stats.canceled = True
                    break
                link = row.get(detail["link_field"])
                if not isinstance(link, str) or not link.startswith(("http://", "https://")):
                    continue
                if detail_limit is not None and details_done >= detail_limit:
                    break
                details_done += 1
                try:
                    sub = fetcher.fetch(link)
                    row.update(extract_fields(Selector(text=sub.html or "<html></html>"), detail["fields"], sub.url))
                except FetchError as e:
                    stats.errors += 1
                    log(f"  ✗ 상세 {link} → {e}")
                except ExtractError as e:
                    raise RunFailed(str(e)) from None

        if skip and not skip_early:            # 기준 필드가 상세 페이지에 있으면 상세 수집 뒤에 거른다
            before = len(rows)
            rows = drop_known(rows)
            if before != len(rows):
                log(f"  이미 수집한 {before - len(rows)}건 건너뜀 → 새 데이터 {len(rows)}건")
        stats.items += len(rows)
        if rows:
            emit(rows, stats)
        if stats.canceled:
            break

        if follow_next:
            try:
                nxt = find_link(page.html, page.url, pg["next_selector"])
            except ExtractError as e:
                raise RunFailed(str(e)) from None
            if nxt and nxt not in seen:
                queue.append(nxt)

    if stats.pages == 0 and not stats.canceled:
        raise RunFailed(last_error or "수집할 페이지가 없습니다")
    return stats
