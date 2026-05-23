from app.services.publisher import build_post_text, extract_message_id, json_text


class PostStub:
    def __init__(self, title: str = "", caption: str = "", hashtags: str = "") -> None:
        self.title = title
        self.caption = caption
        self.hashtags = hashtags


def test_build_post_text_combines_caption_and_hashtags() -> None:
    post = PostStub(caption="A launch caption", hashtags="#rubika #shop")

    assert build_post_text(post) == "A launch caption\n\n#rubika #shop"


def test_build_post_text_falls_back_to_title() -> None:
    post = PostStub(title="Internal title")

    assert build_post_text(post) == "Internal title"


def test_build_post_text_has_default_empty_message() -> None:
    post = PostStub()

    assert build_post_text(post) == "پست بدون متن"


def test_extract_message_id_checks_nested_and_top_level_fields() -> None:
    assert extract_message_id({"data": {"message_id": 123}}) == "123"
    assert extract_message_id({"messageId": "abc"}) == "abc"
    assert extract_message_id({"data": {"id": "nested-id"}}) == "nested-id"


def test_json_text_keeps_persian_text_readable() -> None:
    assert json_text({"text": "سلام"}) == '{"text": "سلام"}'
