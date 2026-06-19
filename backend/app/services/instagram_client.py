from __future__ import annotations

from dataclasses import dataclass

import httpx

from app.config import get_settings


@dataclass(frozen=True)
class InstagramSendResult:
    ok: bool
    message_id: str = ""
    comment_id: str = ""
    error: str = ""
    raw: dict | None = None


class InstagramGraphClient:
    def __init__(
        self,
        graph_base_url: str | None = None,
        instagram_base_url: str | None = None,
        api_version: str | None = None,
        timeout: float = 20.0,
    ) -> None:
        settings = get_settings()
        self.graph_base_url = (graph_base_url or settings.meta_graph_base_url).rstrip("/")
        self.instagram_base_url = (instagram_base_url or settings.instagram_graph_base_url).rstrip("/")
        self.api_version = (api_version or settings.meta_graph_api_version).strip("/")
        self.timeout = timeout

    def send_private_reply(self, page_id: str, access_token: str, comment_id: str, text: str) -> InstagramSendResult:
        if not page_id:
            return InstagramSendResult(ok=False, error="Facebook Page ID is required for Instagram private replies")
        if not access_token:
            return InstagramSendResult(ok=False, error="Meta access token is required for Instagram private replies")
        if not comment_id:
            return InstagramSendResult(ok=False, error="Instagram comment ID is required for private replies")
        if not text.strip():
            return InstagramSendResult(ok=False, error="Private reply message is empty")

        url = f"{self.graph_base_url}/{self.api_version}/{page_id}/messages"
        payload = {
            "recipient": {"comment_id": comment_id},
            "message": {"text": text.strip()},
        }
        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(url, json=payload, params={"access_token": access_token})
                data = response.json() if response.content else {}
                if response.is_error:
                    error = data.get("error", {}).get("message") if isinstance(data, dict) else ""
                    return InstagramSendResult(ok=False, error=error or response.text or "Meta private reply failed", raw=data)
                message_id = ""
                if isinstance(data, dict):
                    message_id = str(data.get("message_id") or data.get("recipient_id") or data.get("id") or "")
                return InstagramSendResult(ok=True, message_id=message_id, raw=data if isinstance(data, dict) else {})
        except httpx.HTTPError as exc:
            return InstagramSendResult(ok=False, error=str(exc))

    def send_public_comment_reply(self, access_token: str, comment_id: str, text: str) -> InstagramSendResult:
        if not access_token:
            return InstagramSendResult(ok=False, error="Meta access token is required for public comment replies")
        if not comment_id:
            return InstagramSendResult(ok=False, error="Instagram comment ID is required for comment replies")
        if not text.strip():
            return InstagramSendResult(ok=False, error="Public reply message is empty")

        url = f"{self.instagram_base_url}/{self.api_version}/{comment_id}/replies"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(url, json={"message": text.strip()}, params={"access_token": access_token})
                data = response.json() if response.content else {}
                if response.is_error:
                    error = data.get("error", {}).get("message") if isinstance(data, dict) else ""
                    return InstagramSendResult(ok=False, error=error or response.text or "Meta public reply failed", raw=data)
                reply_id = str(data.get("id") or "") if isinstance(data, dict) else ""
                return InstagramSendResult(ok=True, comment_id=reply_id, raw=data if isinstance(data, dict) else {})
        except httpx.HTTPError as exc:
            return InstagramSendResult(ok=False, error=str(exc))
