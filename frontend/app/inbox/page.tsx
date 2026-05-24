import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { PageHeader } from "../../components/page-header";
import { WorkspaceEmptyState } from "../../components/workspace-empty-state";

export default function InboxPage() {
  return (
    <AuthGate>
      <AppShell>
        <PageHeader
          eyebrow="تعاملات مشتریان"
          title="صندوق پیام‌ها"
          description="محل آینده برای مدیریت پیام‌ها، کامنت‌ها و تعاملات مشتریان پس از اتصال داده‌های تعامل روبیکا."
        />
        <WorkspaceEmptyState
          title="صندوق پیام‌ها هنوز به API متصل نیست"
          description="فعلاً تمرکز محصول روی انتشار پایدار است. این بخش بعد از آماده شدن API تعاملات فعال می‌شود."
        />
      </AppShell>
    </AuthGate>
  );
}
