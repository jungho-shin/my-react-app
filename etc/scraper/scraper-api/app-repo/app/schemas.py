import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

from . import schedule
from .config import get_settings

_URL = re.compile(r"^https?://[^\s/]+", re.I)


def _url(v: str, what: str) -> str:
    v = v.strip()
    if not _URL.match(v) or len(v) > 2000:
        raise ValueError(f"{what}: http:// 또는 https:// 로 시작하는 주소여야 합니다")
    return v


class FieldSpec(BaseModel):
    name: str = Field(min_length=1, max_length=40)
    selector: str = Field(default="", max_length=500)
    type: Literal["text", "html", "attr", "link", "image", "number", "page_url"] = "text"
    attr: str = Field(default="", max_length=60)
    regex: str = Field(default="", max_length=300)
    required: bool = False
    multiple: bool = False

    @field_validator("name")
    @classmethod
    def _name(cls, v: str) -> str:
        v = v.strip()
        if not v or any(ord(c) < 32 for c in v):
            raise ValueError("필드 이름이 비어 있습니다")
        return v

    @model_validator(mode="after")
    def _check(self):
        if self.type == "attr" and not self.attr.strip():
            raise ValueError(f"필드 '{self.name}': 속성 이름을 입력하세요")
        if self.regex:
            try:
                re.compile(self.regex)
            except re.error as e:
                raise ValueError(f"필드 '{self.name}': 정규식 오류 ({e})") from None
        return self


def _unique(fields: list[FieldSpec]) -> None:
    names = [f.name for f in fields]
    dup = {n for n in names if names.count(n) > 1}
    if dup:
        raise ValueError(f"필드 이름이 겹칩니다: {', '.join(sorted(dup))}")


class Pagination(BaseModel):
    type: Literal["none", "next", "template"] = "none"
    next_selector: str = Field(default="", max_length=500)
    template: str = Field(default="", max_length=2000)
    start: int = Field(default=1, ge=0, le=1_000_000)
    end: int = Field(default=1, ge=0, le=1_000_000)
    step: int = Field(default=1, ge=1, le=10_000)

    @model_validator(mode="after")
    def _check(self):
        if self.type == "next" and not self.next_selector.strip():
            raise ValueError("다음 페이지 링크 선택자를 입력하세요")
        if self.type == "template":
            self.template = _url(self.template, "페이지 주소 형식")
            if "{page}" not in self.template:
                raise ValueError("페이지 주소 형식에 {page} 가 들어가야 합니다")
            if self.end < self.start:
                raise ValueError("끝 페이지가 시작 페이지보다 작습니다")
        return self


class Detail(BaseModel):
    enabled: bool = False
    link_field: str = ""
    fields: list[FieldSpec] = Field(default_factory=list, max_length=60)


class Limits(BaseModel):
    max_pages: int = Field(default=10, ge=1)
    max_items: int = Field(default=1000, ge=1)
    delay_ms: int = Field(default=1000, ge=0, le=60000)

    @model_validator(mode="after")
    def _cap(self):
        s = get_settings()
        self.max_pages = min(self.max_pages, s.max_pages_limit)
        self.max_items = min(self.max_items, s.max_items_limit)
        self.delay_ms = max(self.delay_ms, s.min_delay_ms)
        return self


class BotConfig(BaseModel):
    start_urls: list[str] = Field(default_factory=list, max_length=50)
    render: Literal["http", "browser"] = "http"
    wait_for: str = Field(default="", max_length=300)
    wait_ms: int = Field(default=0, ge=0, le=15000)
    scroll: int = Field(default=0, ge=0, le=20)
    item_selector: str = Field(default="", max_length=500)
    fields: list[FieldSpec] = Field(min_length=1, max_length=60)
    pagination: Pagination = Field(default_factory=Pagination)
    detail: Detail = Field(default_factory=Detail)
    limits: Limits = Field(default_factory=Limits)
    key_fields: list[str] = Field(default_factory=list, max_length=10)
    skip_known: bool = False        # 이전 실행에서 이미 수집한 데이터(key_fields 기준)는 저장하지 않는다
    respect_robots: bool = True
    headers: dict[str, str] = Field(default_factory=dict)
    user_agent: str = Field(default="", max_length=300)

    @field_validator("start_urls")
    @classmethod
    def _urls(cls, v: list[str]) -> list[str]:
        return [_url(u, "시작 주소") for u in v if u.strip()]

    @field_validator("headers")
    @classmethod
    def _headers(cls, v: dict[str, str]) -> dict[str, str]:
        if len(v) > 10:
            raise ValueError("요청 헤더는 10개까지 지정할 수 있습니다")
        for k, val in v.items():
            if not re.match(r"^[A-Za-z0-9-]{1,60}$", k) or len(val) > 2000 or "\n" in val or "\r" in val:
                raise ValueError(f"요청 헤더 형식 오류: {k}")
        return v

    @model_validator(mode="after")
    def _check(self):
        if self.pagination.type != "template" and not self.start_urls:
            raise ValueError("시작 주소를 1개 이상 입력하세요")
        _unique(self.fields)
        names = {f.name for f in self.fields}
        if self.detail.enabled:
            if not self.detail.fields:
                raise ValueError("상세 페이지에서 가져올 필드를 1개 이상 추가하세요")
            if self.detail.link_field not in names:
                raise ValueError("상세 페이지 주소로 쓸 필드를 선택하세요")
            _unique(self.fields + self.detail.fields)
            names |= {f.name for f in self.detail.fields}
        unknown = [k for k in self.key_fields if k not in names]
        if unknown:
            raise ValueError(f"중복 판단 기준에 없는 필드가 있습니다: {', '.join(unknown)}")
        return self


class BotIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    description: str = Field(default="", max_length=500)
    config: BotConfig
    schedule_type: Literal["none", "interval", "daily", "cron"] = "none"
    schedule_value: str = Field(default="", max_length=60)
    webhook_url: str = Field(default="", max_length=500)

    @field_validator("name")
    @classmethod
    def _name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("봇 이름을 입력하세요")
        return v

    @field_validator("webhook_url")
    @classmethod
    def _webhook(cls, v: str) -> str:
        return _url(v, "Webhook 주소") if v.strip() else ""

    @model_validator(mode="after")
    def _schedule(self):
        self.schedule_value = schedule.validate(self.schedule_type, self.schedule_value)
        return self


class DetectIn(BaseModel):
    url: str
    render: Literal["http", "browser"] = "http"
    wait_for: str = Field(default="", max_length=300)

    @field_validator("url")
    @classmethod
    def _u(cls, v: str) -> str:
        return _url(v, "주소")


class Credentials(BaseModel):
    username: str = Field(min_length=3, max_length=40, pattern=r"^[A-Za-z0-9._-]+$")
    password: str = Field(min_length=8, max_length=100)


class LoginIn(BaseModel):
    username: str = Field(max_length=40)
    password: str = Field(max_length=100)


class KeyIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)


class PasswordIn(BaseModel):
    password: str = Field(min_length=8, max_length=100)


class ChangePasswordIn(BaseModel):
    current: str = Field(max_length=100)
    password: str = Field(min_length=8, max_length=100)


class AdminFlagIn(BaseModel):
    is_admin: bool
