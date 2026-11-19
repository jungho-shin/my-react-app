from datetime import datetime

import pytest

from app import schedule


def test_next_run():
    base = datetime(2026, 11, 14, 23, 50)                    # UTC = 한국 11/15 08:50
    assert schedule.next_run("interval", "30", base) == datetime(2026, 11, 15, 0, 20)
    assert schedule.next_run("daily", "09:00", base) == datetime(2026, 11, 15, 0, 0)       # 한국 09:00
    assert schedule.next_run("daily", "08:00", base) == datetime(2026, 11, 15, 23, 0)      # 다음 날
    assert schedule.next_run("cron", "0 9 * * 1-5", base) == datetime(2026, 11, 16, 0, 0)  # 11/15 는 일요일
    assert schedule.next_run("none", "", base) is None


def test_validate():
    assert schedule.validate("interval", " 60 ") == "60"
    for kind, value in (("interval", "4"), ("daily", "9시"), ("cron", "* * *"), ("cron", "61 * * * *")):
        with pytest.raises(ValueError):
            schedule.validate(kind, value)
