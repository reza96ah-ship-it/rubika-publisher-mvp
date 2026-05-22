const navGroups = [
  {
    title: "فضای کاری",
    items: ["داشبورد", "پست‌ها", "برد وضعیت", "تقویم انتشار"]
  },
  {
    title: "انتشار",
    items: ["صف انتشار", "رسانه‌ها", "اتصال روبیکا", "گزارش انتشار"]
  },
  {
    title: "سیستم",
    items: ["تنظیمات"]
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
              {group.items.map((item, index) => {
                const active = item === "داشبورد";
                return (
                  <div
                    key={item}
                    className={`flex cursor-default items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-violet-50 font-semibold text-app-primary ring-1 ring-violet-100"
                        : "text-slate-600 hover:bg-slate-50 hover:text-app-text"
                    }`}
                  >
                    <span>{item}</span>
                    {index === 0 && group.title === "انتشار" ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-app-muted">۰</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
