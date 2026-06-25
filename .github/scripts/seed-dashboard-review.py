from datetime import datetime, timedelta

from app.database import SessionLocal
from app.models import Campaign, ChannelAccount, InstagramAccount, Post, PublishAttempt, RubikaAccount, Store

now = datetime.utcnow()
with SessionLocal() as db:
    for model in (PublishAttempt, Post, Campaign, ChannelAccount, InstagramAccount, RubikaAccount, Store):
        db.query(model).delete()
    db.commit()

    store = Store(
        name="فروشگاه نمونه نشرینو",
        category="پوشاک و سبک زندگی",
        description="فضای کاری نمونه برای بازبینی داشبورد عملیاتی",
        brand_primary_color="#0F766E",
        brand_accent_color="#2563EB",
        timezone="Asia/Tehran",
    )
    db.add(store)
    db.flush()

    db.add(
        RubikaAccount(
            bot_token="review-placeholder",
            chat_id="review-channel",
            bot_name="Nashrino Demo",
            status="connected",
            last_test_at=now,
            is_active=True,
        )
    )
    db.add(
        InstagramAccount(
            store_id=store.id,
            username="nashrino_demo",
            account_type="personal",
            publish_mode="reminder",
            status="reminder_ready",
            last_test_at=now,
            is_active=True,
        )
    )

    launch = Campaign(
        store_id=store.id,
        name="کمپین رونمایی تابستان",
        goal="افزایش آگاهی و آماده‌سازی تقویم انتشار",
        status="active",
        color="#0F766E",
        owner="تیم محتوا",
        starts_at=now - timedelta(days=4),
        ends_at=now + timedelta(days=12),
    )
    retention = Campaign(
        store_id=store.id,
        name="بازگشت مشتریان وفادار",
        goal="افزایش تعامل و خرید مجدد",
        status="active",
        color="#2563EB",
        owner="عملیات شبکه اجتماعی",
        starts_at=now - timedelta(days=2),
        ends_at=now + timedelta(days=20),
    )
    db.add_all([launch, retention])
    db.flush()

    scheduled = Post(
        store_id=store.id,
        title="معرفی مجموعه تابستانی",
        caption="انتشار بعدی کمپین رونمایی",
        platform="rubika,instagram",
        status="scheduled",
        timezone="Asia/Tehran",
        campaign_id=launch.id,
        campaign=launch.name,
        scheduled_at=now + timedelta(hours=2),
        ready_at=now - timedelta(hours=3),
        approval_status="approved",
        reviewed_at=now - timedelta(hours=4),
        reviewed_by="مدیر محتوا",
    )
    failed = Post(
        store_id=store.id,
        title="پیشنهاد ویژه آخر هفته",
        caption="نیازمند بازیابی انتشار",
        platform="rubika",
        status="failed",
        timezone="Asia/Tehran",
        campaign_id=launch.id,
        campaign=launch.name,
        failed_at=now - timedelta(hours=1),
        approval_status="approved",
        last_error="پاسخ کانال در مهلت تعیین‌شده دریافت نشد",
        attempt_count=2,
    )
    approval = Post(
        store_id=store.id,
        title="داستان مشتری وفادار",
        caption="در انتظار بازبینی نهایی",
        platform="instagram",
        status="ready",
        timezone="Asia/Tehran",
        campaign_id=retention.id,
        campaign=retention.name,
        ready_at=now - timedelta(hours=5),
        approval_status="pending",
        submitted_at=now - timedelta(hours=5),
    )
    published_recent = Post(
        store_id=store.id,
        title="راهنمای انتخاب محصول",
        platform="rubika",
        status="published",
        timezone="Asia/Tehran",
        campaign_id=retention.id,
        campaign=retention.name,
        published_at=now - timedelta(days=1),
        approval_status="not_required",
    )
    published_recent_2 = Post(
        store_id=store.id,
        title="پشت صحنه آماده‌سازی سفارش‌ها",
        platform="instagram",
        status="published",
        timezone="Asia/Tehran",
        campaign_id=launch.id,
        campaign=launch.name,
        published_at=now - timedelta(days=4),
        approval_status="approved",
    )
    published_previous = Post(
        store_id=store.id,
        title="پست هفته گذشته",
        platform="rubika",
        status="published",
        timezone="Asia/Tehran",
        published_at=now - timedelta(days=10),
        approval_status="not_required",
    )
    db.add_all([scheduled, failed, approval, published_recent, published_recent_2, published_previous])
    db.flush()

    db.add_all(
        [
            PublishAttempt(
                post_id=published_recent.id,
                channel="rubika",
                action="scheduled",
                status="success",
                request_payload="{}",
                response_payload='{"message_id":"demo-1"}',
                started_at=now - timedelta(days=1, minutes=2),
                finished_at=now - timedelta(days=1),
                created_at=now - timedelta(days=1, minutes=2),
            ),
            PublishAttempt(
                post_id=published_recent_2.id,
                channel="instagram",
                action="manual",
                status="success",
                request_payload="{}",
                response_payload="{}",
                started_at=now - timedelta(days=4, minutes=1),
                finished_at=now - timedelta(days=4),
                created_at=now - timedelta(days=4, minutes=1),
            ),
            PublishAttempt(
                post_id=failed.id,
                channel="rubika",
                action="retry",
                status="failed",
                request_payload="{}",
                response_payload="{}",
                error="پاسخ کانال در مهلت تعیین‌شده دریافت نشد",
                started_at=now - timedelta(hours=1, minutes=3),
                finished_at=now - timedelta(hours=1),
                created_at=now - timedelta(hours=1, minutes=3),
            ),
            PublishAttempt(
                post_id=scheduled.id,
                channel="rubika",
                action="scheduled",
                status="started",
                request_payload="{}",
                response_payload="{}",
                started_at=now - timedelta(minutes=2),
                created_at=now - timedelta(minutes=2),
            ),
        ]
    )
    db.commit()
