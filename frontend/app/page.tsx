const stats = [
  { label: "پیش‌نویس", value: "۰" },
  { label: "زمان‌بندی‌شده", value: "۰" },
  { label: "منتشرشده", value: "۰" },
  { label: "ناموفق", value: "۰" }
];

const navItems = ["داشبورد", "پست‌ها", "تقویم انتشار", "صف انتشار", "اتصال روبیکا", "گزارش انتشار", "تنظیمات"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-app-background text-app-text">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-l border-app-border bg-app-surface p-6 lg:block">
          <div className="mb-8">
            <p className="text-sm text-app-muted">Rubika Publisher</p>
            <h1 className="mt-1 text-xl font-bold">پنل انتشار روبیکا</h1>
          </div>
          <nav className="space-y-2">
            {navItems.map((item, index) => (
              <div
                key={item}
                className={`rounded-xl px-4 py-3 text-sm ${index === 0 ? "bg-sky-50 font-semibold text-app-primary" : "text-app-muted hover:bg-slate-50"}`}
              >
                {item}
              </div>
            ))}
          </nav>
        </aside>

        <section className="flex-1 p-5 lg:p-8">
          <header className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm lg:flex-row lg:items-center">
            <div>
              <p className="text-sm text-app-muted">فاز ۰۱ — اسکلت پروژه</p>
              <h2 className="mt-2 text-2xl font-bold">داشبورد انتشار روبیکا</h2>
              <p className="mt-2 text-sm leading-7 text-app-muted">
                پایه رابط کاربری فارسی، بک‌اند، دیتابیس، Redis و Worker آماده‌سازی شده است.
              </p>
            </div>
            <button className="rounded-xl bg-app-primary px-5 py-3 text-sm font-semibold text-white hover:bg-app-primaryHover">
              ایجاد پست جدید
            </button>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
                <p className="text-sm text-app-muted">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
            <h3 className="text-lg font-bold">وضعیت سیستم</h3>
            <div className="mt-4 grid gap-3 text-sm text-app-muted md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">Frontend: آماده</div>
              <div className="rounded-xl bg-slate-50 p-4">Backend: /health</div>
              <div className="rounded-xl bg-slate-50 p-4">Worker: Celery آماده</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
