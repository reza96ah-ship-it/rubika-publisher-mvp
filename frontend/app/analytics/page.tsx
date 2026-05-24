import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { PageHeader } from "../../components/page-header";
import { WorkspaceEmptyState } from "../../components/workspace-empty-state";

export default function AnalyticsPage() {
  return (
    <AuthGate>
      <AppShell>
        <PageHeader
          eyebrow="گزارش عملکرد"
          title="تحلیل عملکرد"
          description="محل آینده برای آمار انتشار، نرخ خطا، بهترین روزهای انتشار و گزارش‌های محتوایی."
        />
        <WorkspaceEmptyState
          title="گزارش‌ها پس از جمع شدن داده انتشار فعال می‌شوند"
          description="داده واقعی بر اساس لاگ انتشار، وضعیت پست‌ها و آمار عملکرد روبیکا نمایش داده خواهد شد."
        />
      </AppShell>
    </AuthGate>
  );
}
