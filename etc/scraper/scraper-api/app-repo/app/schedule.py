"""예약: interval(분) / daily(HH:MM) / cron(5칸). 매일·cron 은 SCRAPER_TZ 시간대 기준."""
import re
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from croniter import croniter

from .config import get_settings

MIN_INTERVAL = 5            # 분
_HHMM = re.compile(r"^([01]?\d|2[0-3]):([0-5]\d)$")


def validate(kind: str, value: str) -> str:
    """정리된 값을 돌려주고, 잘못되면 ValueError."""
    value = (value or "").strip()
    if kind == "none":
        return ""
    if kind == "interval":
        if not value.isdigit() or not MIN_INTERVAL <= int(value) <= 10080:
            raise ValueError(f"반복 간격은 {MIN_INTERVAL}~10080분 사이여야 합니다")
        return str(int(value))
    if kind == "daily":
        if not _HHMM.match(value):
            raise ValueError("매일 실행 시각은 HH:MM 형식이어야 합니다")
        return value
    if kind == "cron":
        if len(value.split()) != 5 or not croniter.is_valid(value):
            raise ValueError("cron 식은 '분 시 일 월 요일' 5칸이어야 합니다 (예: 0 9 * * 1-5)")
        return value
    raise ValueError("알 수 없는 예약 종류")


def next_run(kind: str, value: str, after: datetime) -> datetime | None:
    """after(UTC, 시간대 없음) 이후의 다음 실행 시각(UTC, 시간대 없음)."""
    if kind == "none" or not value:
        return None
    if kind == "interval":
        return after + timedelta(minutes=int(value))
    if kind == "daily":
        m = _HHMM.match(value)
        value = f"{int(m.group(2))} {int(m.group(1))} * * *"
    tz = ZoneInfo(get_settings().tz)
    local = after.replace(tzinfo=timezone.utc).astimezone(tz)
    nxt = croniter(value, local).get_next(datetime)
    return nxt.astimezone(timezone.utc).replace(tzinfo=None)
