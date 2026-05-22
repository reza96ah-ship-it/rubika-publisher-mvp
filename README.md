# Rubika Publisher MVP

یک وب‌اپ فارسی و راست‌به‌چپ برای زمان‌بندی و انتشار خودکار پست متنی در روبیکا.

## هدف MVP

در نسخه اول، سیستم باید بتواند:

- ورود ادمین داشته باشد.
- اطلاعات فروشگاه را نگه دارد.
- اتصال ربات روبیکا را تست کند.
- پست متنی بسازد.
- پست را زمان‌بندی کند.
- در زمان مقرر، متن را از طریق Rubika API منتشر کند.
- وضعیت انتشار، خطاها و `message_id` روبیکا را ذخیره کند.

## Stack

- Frontend: Next.js + Tailwind CSS
- Backend: FastAPI
- Database: PostgreSQL
- Queue: Redis
- Worker: Celery
- Local runtime: Docker Compose on Windows WSL2 Ubuntu

## اجرای لوکال

```bash
cp .env.example .env
docker compose up -d --build
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:8000/health
```

## فاز فعلی

Phase 01 — Project Foundation

این commit فقط اسکلت اولیه پروژه را اضافه می‌کند. اتصال واقعی روبیکا و زمان‌بندی در فازهای بعدی اضافه می‌شود.
