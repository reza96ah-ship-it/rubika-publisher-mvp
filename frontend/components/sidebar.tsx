const navGroups = [
  {
    title: "فضای کاری",
    items: [
      { label: "داشبورد", href: "/" },
      { label: "پست‌ها", href: "/posts" },
      { label: "برد وضعیت", href: "/board" },
      { label: "تقویم انتشار", href: "/calendar" }
    ]
  },
  {
    title: "انتشار",
    items: [
      { label: "صف انتشار", href: "/queue" },
      { label: "رسانه‌ها", href: "/media" },
      { label: "اتصال روبیکا", href: "/rubika" },
      { label: "گزارش انتشار", href: "/logs" }
    ]
  },
  {
    title: "سیستم",
    items: [
      { label: "پروفایل فروشگاه", href: "/store" },
      { label: "تنظیمات", href: "/settings" }
    ]
  }
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-l border-app-border bg-app-surface lg:block">
      <div className="border-b border-app-border p-5">
        <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-sky-50 p-4 ring-1 ring-violet-100">
          <p className="text-xs font-semibold text-app-primary">Workspace</p>
          <h2 className="mt-1 text-lg font-bold text-app-text">انتشار روبیکا</h2>
          <p className="mt-2 text-xs leading-6 text-app-muted">مدیریت پست، زمان‌بندی و وضعیت انتشار</p>
        </div>
      </div>

      <nav className="space-y-6 p-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-xs font-semibold text-app-muted">{group.title}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = item.href === "/";
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-violet-50 font-semibold text-app-primary ring-1 ring-violet-100"
                        : "text-slate-600 hover:bg-slate-50 hover:text-app-text"
                    }`}
                  >
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
