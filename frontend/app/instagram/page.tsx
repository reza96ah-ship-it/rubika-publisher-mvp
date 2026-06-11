"use client";

import { BadgeCheck, Instagram, KeyRound, RefreshCw, Route, Save, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { AuthGate } from "../../components/auth-gate";
import { LoadingPanel } from "../../components/loading-skeleton";
import { useToast } from "../../components/toast-provider";
import { Button } from "../../components/ui/button";
import { Field, Input, Textarea } from "../../components/ui/form";
import { DetailGrid, NoticeBanner, StatusToken, WorkspacePage, WorkspacePanel } from "../../components/workspace-ui";
import { apiUrl, authHeaders } from "../../lib/posts";
import { notifyWorkspaceUpdated } from "../../lib/workspace";

type InstagramSettings = {
  id: number;
  store_id: number;
  username: string;
  account_type: string;
  publish_mode: string;
  professional_account_id: string;
  page_id: string;
  status: string;
  permissions: string;
  last_error: string;
  last_test_at: string | null;
  is_active: boolean;
};

const DEFAULT_INSTAGRAM_PERMISSIONS = "instagram_basic, instagram_content_publish, pages_show_list, pages_read_engagement";

function statusLabel(status: string) {
  if (status === "connected") return "ط§طھطµط§ظ„ طھط§غŒغŒط¯ ط´ط¯ظ‡";
  if (status === "reminder_ready") return "ط¢ظ…ط§ط¯ظ‡ غŒط§ط¯ط¢ظˆط±غŒ ط¯ط³طھغŒ";
  if (status === "oauth_required") return "ظ†غŒط§ط²ظ…ظ†ط¯ Meta OAuth";
  if (status === "failed") return "ط§طھطµط§ظ„ ط®ط·ط§ ط¯ط§ط±ط¯";
  return "ط¯ط± ط­ط§ظ„ ط¢ظ…ط§ط¯ظ‡â€Œط³ط§ط²غŒ";
}

function statusTone(status: string): "success" | "warning" | "alert" | "neutral" {
  if (status === "connected") return "success";
  if (status === "reminder_ready") return "success";
  if (status === "failed") return "alert";
  if (status === "oauth_required") return "warning";
  return "neutral";
}

function formatDateTime(value?: string | null) {
  if (!value) return "ظ‡ظ†ظˆط² ط§ط¬ط±ط§ ظ†ط´ط¯ظ‡";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ط²ظ…ط§ظ† ظ†ط§ظ…ط¹طھط¨ط±";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function InstagramPage() {
  const { showToast } = useToast();
  const [username, setUsername] = useState("");
  const [accountType, setAccountType] = useState<"personal" | "creator" | "business">("creator");
  const [professionalAccountId, setProfessionalAccountId] = useState("");
  const [pageId, setPageId] = useState("");
  const [permissions, setPermissions] = useState(DEFAULT_INSTAGRAM_PERMISSIONS);
  const [saved, setSaved] = useState<InstagramSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const response = await fetch(`${apiUrl}/instagram/settings`, { headers: authHeaders() });
      if (!response.ok) throw new Error("ط¯ط±غŒط§ظپطھ طھظ†ط¸غŒظ…ط§طھ ط§غŒظ†ط³طھط§ع¯ط±ط§ظ… ظ†ط§ظ…ظˆظپظ‚ ط¨ظˆط¯");
      const data = await response.json();
      if (data) {
        setSaved(data);
        setUsername(data.username ?? "");
        setAccountType(data.account_type ?? "creator");
        setProfessionalAccountId(data.professional_account_id ?? "");
        setPageId(data.page_id ?? "");
        setPermissions(data.permissions || DEFAULT_INSTAGRAM_PERMISSIONS);
      }
      setLoading(false);
    }

    loadSettings().catch((err) => {
      setError(err instanceof Error ? err.message : "ط®ط·ط§ ط¯ط± ط¯ط±غŒط§ظپطھ طھظ†ط¸غŒظ…ط§طھ ط§غŒظ†ط³طھط§ع¯ط±ط§ظ…");
      setLoading(false);
    });
  }, []);

  const dirty = useMemo(() => {
    if (!saved) return Boolean(username || professionalAccountId || pageId || permissions);
    return username !== saved.username
      || accountType !== saved.account_type
      || professionalAccountId !== saved.professional_account_id
      || pageId !== saved.page_id
      || permissions !== saved.permissions;
  }, [accountType, pageId, permissions, professionalAccountId, saved, username]);
  const status = dirty ? "draft" : saved?.status ?? "not_configured";
  const publishMode = accountType === "personal" ? "reminder" : "direct";
  const hasIdentity = Boolean(username.trim() || professionalAccountId.trim() || pageId.trim());
  const readiness = [
    { label: accountType === "personal" ? "ط§ع©ط§ظ†طھ ظ…ط¹ظ…ظˆظ„غŒ" : "ط­ط³ط§ط¨ ط­ط±ظپظ‡â€Œط§غŒ", detail: hasIdentity ? "ظ†ط§ظ… ع©ط§ط±ط¨ط±غŒ غŒط§ ط´ظ†ط§ط³ظ‡ ط­ط³ط§ط¨ ط«ط¨طھ ط´ط¯ظ‡ ط§ط³طھ." : "ظ†ط§ظ… ع©ط§ط±ط¨ط±غŒ غŒط§ ط´ظ†ط§ط³ظ‡ ع©ط§ظ†ط§ظ„ ط±ط§ ظ…ط´ط®طµ ع©ظ†غŒط¯.", done: hasIdentity, icon: Instagram },
    { label: accountType === "personal" ? "غŒط§ط¯ط¢ظˆط±غŒ ط¯ط³طھغŒ" : "ظ…ط¬ظˆط²ظ‡ط§غŒ Meta", detail: accountType === "personal" ? "ط¨ط±ط§غŒ ط§ع©ط§ظ†طھ ظ…ط¹ظ…ظˆظ„غŒطŒ ط§ظ†طھط´ط§ط± ظ…ط³طھظ‚غŒظ… ط؛غŒط±ظپط¹ط§ظ„ ظˆ غŒط§ط¯ط¢ظˆط±غŒ ط¯ط³طھغŒ ظپط¹ط§ظ„ ظ…غŒâ€Œط´ظˆط¯." : permissions.trim() ? "ظ„غŒط³طھ ظ…ط¬ظˆط²ظ‡ط§غŒ ظ…ظˆط±ط¯ظ†غŒط§ط² ظ…ط³طھظ†ط¯ ط´ط¯ظ‡ ط§ط³طھ." : "ظ…ط¬ظˆط²ظ‡ط§غŒ Meta Graph ط±ط§ ظ…ط´ط®طµ ع©ظ†غŒط¯.", done: accountType === "personal" || Boolean(permissions.trim()), icon: ShieldCheck },
    { label: accountType === "personal" ? "ظ‚ط§ط¨ظ„ ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ" : "OAuth ظˆط§ظ‚ط¹غŒ", detail: accountType === "personal" ? "ظ¾ط³طھ ط¯ط± ط²ظ…ط§ظ† ظ…ظ‚ط±ط± ط¨ظ‡ ظˆط¶ط¹غŒطھ ط¢ظ…ط§ط¯ظ‡ ط§ظ†طھط´ط§ط± ط¯ط³طھغŒ ظ…غŒâ€Œط±ط³ط¯." : saved?.status === "connected" ? "طھظˆع©ظ† ظ…ط¹طھط¨ط± ظ…طھطµظ„ ط§ط³طھ." : "ط¯ط± ظپط§ط² ط¨ط¹ط¯غŒ ط¨ط§غŒط¯ ط¬ط±غŒط§ظ† OAuth ظˆ refresh token ط§ط¶ط§ظپظ‡ ط´ظˆط¯.", done: accountType === "personal" || saved?.status === "connected", icon: KeyRound }
  ];
  const readyCount = readiness.filter((item) => item.done).length;

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`${apiUrl}/instagram/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          username: username.trim(),
          account_type: accountType,
          publish_mode: publishMode,
          professional_account_id: professionalAccountId.trim(),
          page_id: pageId.trim(),
          permissions: permissions.trim()
        })
      });
      if (!response.ok) throw new Error("ط°ط®غŒط±ظ‡ طھظ†ط¸غŒظ…ط§طھ ط§غŒظ†ط³طھط§ع¯ط±ط§ظ… ظ†ط§ظ…ظˆظپظ‚ ط¨ظˆط¯");
      const data = (await response.json()) as InstagramSettings;
      setSaved(data);
      setMessage(accountType === "personal" ? "ط§ع©ط§ظ†طھ ظ…ط¹ظ…ظˆظ„غŒ ط¨ط±ط§غŒ غŒط§ط¯ط¢ظˆط±غŒ ط§ظ†طھط´ط§ط± ط¯ط³طھغŒ ط¢ظ…ط§ط¯ظ‡ ط´ط¯" : "ظ¾ط±ظˆظپط§غŒظ„ ط§غŒظ†ط³طھط§ع¯ط±ط§ظ… ط¨ط±ط§غŒ ظپط§ط² ط§طھطµط§ظ„ ظˆط§ظ‚ط¹غŒ ط¢ظ…ط§ط¯ظ‡ ط´ط¯");
      showToast({ title: "طھظ†ط¸غŒظ…ط§طھ ط§غŒظ†ط³طھط§ع¯ط±ط§ظ… ط°ط®غŒط±ظ‡ ط´ط¯", description: accountType === "personal" ? "ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ط¯ط³طھغŒ ط¨ط±ط§غŒ ط§ع©ط§ظ†طھ ظ…ط¹ظ…ظˆظ„غŒ ظپط¹ط§ظ„ ط´ط¯." : "ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ظ…ط³طھظ‚غŒظ… ط¨ط¹ط¯ ط§ط² Meta OAuth ظپط¹ط§ظ„ ظ…غŒâ€Œط´ظˆط¯.", tone: "success" });
      notifyWorkspaceUpdated();
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "ط®ط·ط§غŒ ط°ط®غŒط±ظ‡ طھظ†ط¸غŒظ…ط§طھ";
      setError(nextError);
      showToast({ title: "ط°ط®غŒط±ظ‡ ط§غŒظ†ط³طھط§ع¯ط±ط§ظ… ظ†ط§ظ…ظˆظپظ‚ ط¨ظˆط¯", description: nextError, tone: "alert" });
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`${apiUrl}/instagram/test`, { method: "POST", headers: authHeaders() });
      const data = await response.json();
      setSaved((current) => current ? { ...current, status: data.status, last_error: data.error, last_test_at: data.last_test_at } : current);
      if (data.ok) {
        setMessage(data.error || "ط§ع©ط§ظ†طھ ظ…ط¹ظ…ظˆظ„غŒ ط¨ط±ط§غŒ غŒط§ط¯ط¢ظˆط±غŒ ط¯ط³طھغŒ ط¢ظ…ط§ط¯ظ‡ ط§ط³طھ");
        showToast({ title: "ط­ط§ظ„طھ غŒط§ط¯ط¢ظˆط±غŒ ظپط¹ط§ظ„ ط§ط³طھ", description: "ظ¾ط³طھâ€Œظ‡ط§ ط¯ط± ط²ظ…ط§ظ† ظ…ظ‚ط±ط± ط¨ط±ط§غŒ ط§ظ†طھط´ط§ط± ط¯ط³طھغŒ ط¢ظ…ط§ط¯ظ‡ ظ…غŒâ€Œط´ظˆظ†ط¯.", tone: "success" });
      } else {
        setError(data.error || "Meta OAuth ظ‡ظ†ظˆط² ظ…طھطµظ„ ظ†غŒط³طھ");
        showToast({ title: "ط§طھطµط§ظ„ ط§غŒظ†ط³طھط§ع¯ط±ط§ظ… ظ‡ظ†ظˆط² ع©ط§ظ…ظ„ ظ†غŒط³طھ", description: "ط¨ط±ط§غŒ ط§ظ†طھط´ط§ط± ظ…ط³طھظ‚غŒظ… ط¨ط§غŒط¯ Meta OAuth ظˆ ظ…ط¬ظˆط²ظ‡ط§غŒ ط§ظ†طھط´ط§ط± ط§ط¶ط§ظپظ‡ ط´ظˆط¯.", tone: "warning" });
      }
      notifyWorkspaceUpdated();
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "ط®ط·ط§غŒ طھط³طھ ط§طھطµط§ظ„ ط§غŒظ†ط³طھط§ع¯ط±ط§ظ…";
      setError(nextError);
      showToast({ title: "طھط³طھ ط§غŒظ†ط³طھط§ع¯ط±ط§ظ… ظ†ط§ظ…ظˆظپظ‚ ط¨ظˆط¯", description: nextError, tone: "alert" });
    } finally {
      setTesting(false);
    }
  }

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage className="space-y-4">
          <section className="app-studio-panel rounded-lg px-4 py-3">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <p className="text-[10px] font-black text-app-primary">طھظ†ط¸غŒظ…ط§طھ ع©ط§ظ†ط§ظ„</p>
                <h1 className="mt-1 text-xl font-black text-app-text">ط§طھطµط§ظ„ ط§غŒظ†ط³طھط§ع¯ط±ط§ظ…</h1>
                <p className="mt-1 text-xs leading-5 text-app-muted">ط§ع©ط§ظ†طھ ظ…ط¹ظ…ظˆظ„غŒ ط¨ط§ غŒط§ط¯ط¢ظˆط±غŒ ط¯ط³طھغŒ ع©ط§ط± ظ…غŒâ€Œع©ظ†ط¯ط› Creator ظˆ Business ط¨ط¹ط¯ ط§ط² Meta OAuth ط§ظ†طھط´ط§ط± ظ…ط³طھظ‚غŒظ… ظ…غŒâ€Œع¯غŒط±ظ†ط¯.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusToken tone={dirty ? "warning" : statusTone(status)}>{dirty ? "طھط؛غŒغŒط±ط§طھ ط°ط®غŒط±ظ‡ ظ†ط´ط¯ظ‡" : statusLabel(status)}</StatusToken>
                <StatusToken tone={readyCount === 3 ? "success" : "warning"}>{readyCount}/3 ط¢ظ…ط§ط¯ظ‡</StatusToken>
                <Button type="button" variant="secondary" size="sm" disabled={testing || dirty} onClick={testConnection}>
                  <RefreshCw className={`ml-2 h-4 w-4 ${testing ? "animate-spin" : ""}`} aria-hidden="true" />
                  طھط³طھ ط§طھطµط§ظ„
                </Button>
              </div>
            </div>
          </section>

          {loading ? <LoadingPanel /> : null}
          {message ? <NoticeBanner tone="success" title="ط§ظ†ط¬ط§ظ… ط´ط¯">{message}</NoticeBanner> : null}
          {error ? <NoticeBanner tone="warning" title="ظˆط¶ط¹غŒطھ ط§طھطµط§ظ„">{error}</NoticeBanner> : null}

          {!loading ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
              <WorkspacePanel title="ظ¾ط±ظˆظپط§غŒظ„ ع©ط§ظ†ط§ظ„" description="ط§ط·ظ„ط§ط¹ط§طھغŒ ع©ظ‡ ط¯ط± ظپط§ط² OAuth ط¨ط±ط§غŒ ط§طھطµط§ظ„ ط¨ظ‡ ط­ط³ط§ط¨ ط­ط±ظپظ‡â€Œط§غŒ Meta ظ„ط§ط²ظ… ظ…غŒâ€Œط´ظˆط¯.">
                <form onSubmit={saveSettings} className="grid gap-4">
                  <section className="grid gap-2 rounded-md border border-app-border bg-app-surfaceMuted p-3 sm:grid-cols-3">
                    {[
                      { value: "personal", label: "ظ…ط¹ظ…ظˆظ„غŒ", detail: "غŒط§ط¯ط¢ظˆط±غŒ ط¯ط³طھغŒطŒ ط¨ط¯ظˆظ† ط§ظ†طھط´ط§ط± ط®ظˆط¯ع©ط§ط±" },
                      { value: "creator", label: "Creator", detail: "ط§ظ†طھط´ط§ط± ظ…ط³طھظ‚غŒظ… ط¨ط¹ط¯ ط§ط² Meta OAuth" },
                      { value: "business", label: "Business", detail: "ط§ظ†طھط´ط§ط± ظ…ط³طھظ‚غŒظ… ط¨ط¹ط¯ ط§ط² ط§طھطµط§ظ„ Page" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setAccountType(option.value as "personal" | "creator" | "business")}
                        className={`app-interactive rounded-md border px-3 py-3 text-right ${
                          accountType === option.value ? "border-blue-200 bg-white text-app-primary shadow-soft" : "border-app-border bg-white/70 text-app-text hover:bg-white"
                        }`}
                        aria-pressed={accountType === option.value}
                      >
                        <span className="block text-sm font-black">{option.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-app-muted">{option.detail}</span>
                      </button>
                    ))}
                  </section>

                  <Field label="ظ†ط§ظ… ع©ط§ط±ط¨ط±غŒ ط§غŒظ†ط³طھط§ع¯ط±ط§ظ…" hint="ظ…ط«ظ„ط§ظ‹ brand_shop">
                    <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="instagram_username" />
                  </Field>
                  {accountType !== "personal" ? (
                    <>
                      <Field label="Instagram Professional Account ID" hint="ط¨ط¹ط¯ ط§ط² OAuth ط¨ظ‡ طµظˆط±طھ ط®ظˆط¯ع©ط§ط± ظ‚ط§ط¨ظ„ ط¯ط±غŒط§ظپطھ ط§ط³طھ.">
                        <Input value={professionalAccountId} onChange={(event) => setProfessionalAccountId(event.target.value)} placeholder="1784..." dir="ltr" />
                      </Field>
                      <Field label="Facebook Page ID" hint="ط¨ط±ط§غŒ Graph API ط§ظ†طھط´ط§ط± ظ…ط­طھظˆط§ ط¨ظ‡ Page linkage ظ†غŒط§ط² ط§ط³طھ.">
                        <Input value={pageId} onChange={(event) => setPageId(event.target.value)} placeholder="page_id" dir="ltr" />
                      </Field>
                      <Field label="ظ…ط¬ظˆط²ظ‡ط§غŒ ظ…ظˆط±ط¯ظ†غŒط§ط²" hint="ط¯ط± ظپط§ط² OAuth ط¨ظ‡ scopeظ‡ط§غŒ Meta طھط¨ط¯غŒظ„ ظ…غŒâ€Œط´ظˆط¯.">
                        <Textarea value={permissions} onChange={(event) => setPermissions(event.target.value)} className="min-h-24" dir="ltr" />
                      </Field>
                    </>
                  ) : (
                    <NoticeBanner tone="info" title="ط­ط§ظ„طھ ط§ع©ط§ظ†طھ ظ…ط¹ظ…ظˆظ„غŒ">
                      ط§غŒظ† ط­ط§ظ„طھ ظ¾ط³طھ ط±ط§ ط®ظˆط¯ع©ط§ط± ظ…ظ†طھط´ط± ظ†ظ…غŒâ€Œع©ظ†ط¯. ط¯ط± ط²ظ…ط§ظ† ظ…ظ‚ط±ط±طŒ ظ¾ط³طھ ط¨ظ‡ ظˆط¶ط¹غŒطھ ط¢ظ…ط§ط¯ظ‡ ط§ظ†طھط´ط§ط± ط¯ط³طھغŒ ظ…غŒâ€Œط±ط³ط¯ طھط§ ع©ظ¾ط´ظ† ط±ط§ ع©ظ¾غŒ ع©ظ†غŒط¯ ظˆ ط¯ط± Instagram ظ…ظ†طھط´ط± ع©ظ†غŒط¯.
                    </NoticeBanner>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={saving}>
                      <Save className="ml-2 h-4 w-4" aria-hidden="true" />
                      {saving ? "ط¯ط± ط­ط§ظ„ ط°ط®غŒط±ظ‡" : "ط°ط®غŒط±ظ‡ طھظ†ط¸غŒظ…ط§طھ"}
                    </Button>
                    <Button href="/compose" variant="secondary">ط±ظپطھظ† ط¨ظ‡ composer</Button>
                  </div>
                </form>
              </WorkspacePanel>

              <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
                <WorkspacePanel title={accountType === "personal" ? "ظ…ط³غŒط± ط§ع©ط§ظ†طھ ظ…ط¹ظ…ظˆظ„غŒ" : "ظ…ط³غŒط± ط§طھطµط§ظ„ ظˆط§ظ‚ط¹غŒ"} description={accountType === "personal" ? "ط¨ط¯ظˆظ† ظ¾ط³ظˆط±ط¯ ظˆ ط¨ط¯ظˆظ† ط§طھظˆظ…ط§ط³غŒظˆظ† ظ†ط§ط§ظ…ظ†ط› ظپظ‚ط· غŒط§ط¯ط¢ظˆط±غŒ ظˆ ط¢ظ…ط§ط¯ظ‡â€Œط³ط§ط²غŒ ط¯ط³طھغŒ." : "ط§غŒظ† ظپط§ط² ط¹ظ…ط¯ط§ظ‹ طھظˆع©ظ† ط¬ط¹ظ„غŒ ط°ط®غŒط±ظ‡ ظ†ظ…غŒâ€Œع©ظ†ط¯."} action={<StatusToken tone={accountType === "personal" ? "success" : "warning"}>{accountType === "personal" ? "Reminder mode" : "OAuth pending"}</StatusToken>}>
                  <div className="space-y-3">
                    {readiness.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-start gap-3 rounded-md border border-app-border bg-white p-3">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${item.done ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"}`}>
                            {item.done ? <BadgeCheck className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                          </span>
                          <div>
                            <p className="text-sm font-black text-app-text">{item.label}</p>
                            <p className="mt-1 text-xs leading-5 text-app-muted">{item.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </WorkspacePanel>

                <WorkspacePanel title="ظ‚ط±ط§ط±ط¯ط§ط¯ ط§ظ†طھط´ط§ط±" description={accountType === "personal" ? "ط§ع©ط§ظ†طھ ظ…ط¹ظ…ظˆظ„غŒ ظپظ‚ط· غŒط§ط¯ط¢ظˆط±غŒ ط¯ط³طھغŒ ظ…غŒâ€Œع¯غŒط±ط¯." : "ظ‚ط¨ظ„ ط§ط² ط§طھطµط§ظ„ ظˆط§ظ‚ط¹غŒطŒ ط§ظ†طھط´ط§ط± ظ…ط³طھظ‚غŒظ… ط§غŒظ†ط³طھط§ع¯ط±ط§ظ… ظ…ط³ط¯ظˆط¯ ظ…غŒâ€Œظ…ط§ظ†ط¯."}>
                  <DetailGrid
                    items={[
                      { label: "ظˆط¶ط¹غŒطھ", value: statusLabel(status), hint: "ظˆط¶ط¹غŒطھ ط¢ظ…ط§ط¯ظ‡â€Œط³ط§ط²غŒ ع©ط§ظ†ط§ظ„" },
                      { label: "ط¢ط®ط±غŒظ† طھط³طھ", value: formatDateTime(saved?.last_test_at), hint: "طھط³طھ ظپط¹ظ„غŒ ظپظ‚ط· OAuth pending ط±ط§ ع¯ط²ط§ط±ط´ ظ…غŒâ€Œع©ظ†ط¯" },
                      { label: "ظ†ظˆط¹ ط­ط³ط§ط¨", value: accountType === "personal" ? "ظ…ط¹ظ…ظˆظ„غŒ" : accountType === "creator" ? "Creator" : "Business", hint: accountType === "personal" ? "غŒط§ط¯ط¢ظˆط±غŒ ط¯ط³طھغŒ" : "ط§ظ†طھط´ط§ط± ظ…ط³طھظ‚غŒظ… ط¨ط¹ط¯ ط§ط² OAuth" },
                      { label: "ظ¾ط´طھغŒط¨ط§ظ†غŒ ظپط¹ظ„غŒ", value: accountType === "personal" ? "ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ غŒط§ط¯ط¢ظˆط±غŒ" : "ظ¾غŒط´â€Œظ†ظˆغŒط³ ظˆ ط§ظ†طھط®ط§ط¨ ع©ط§ظ†ط§ظ„", hint: accountType === "personal" ? "ط¨ط¯ظˆظ† auto-publish" : "ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ظ…ط³طھظ‚غŒظ… ط¨ط¹ط¯ ط§ط² OAuth" },
                      { label: "ظ…ط³غŒط± ط¨ط¹ط¯غŒ", value: accountType === "personal" ? "Push reminder + copy flow" : "Meta OAuth + publisher adapter", hint: accountType === "personal" ? "طھط¬ط±ط¨ظ‡ ط¯ط³طھغŒ ط­ط±ظپظ‡â€Œط§غŒ" : "Graph API content publishing" }
                    ]}
                  />
                  <NoticeBanner tone="info" title="ع¯ط§ظ… ط¨ط¹ط¯غŒ ظپظ†غŒ">
                    {accountType === "personal" ? "ط¨ط±ط§غŒ ط§ع©ط§ظ†طھ ظ…ط¹ظ…ظˆظ„غŒ ط¨ط§غŒط¯ push reminderطŒ copy caption ظˆ open Instagram flow ط±ط§ ع©ط§ظ…ظ„ ع©ظ†غŒظ…." : "ط¨ط§غŒط¯ flow ظˆط±ظˆط¯ MetaطŒ ط°ط®غŒط±ظ‡ refresh tokenطŒ ط¨ط±ط±ط³غŒ ظ…ط¬ظˆط²ظ‡ط§ ظˆ adapter ط§ظ†طھط´ط§ط± Instagram ط§ط¶ط§ظپظ‡ ط´ظˆط¯."}
                  </NoticeBanner>
                  <Button href="/queue" variant="secondary" className="mt-4 w-full">
                    <Route className="ml-2 h-4 w-4" aria-hidden="true" />
                    ظ…ط´ط§ظ‡ط¯ظ‡ طµظپ ط§ظ†طھط´ط§ط±
                  </Button>
                </WorkspacePanel>

                <NoticeBanner tone={accountType === "personal" ? "success" : "warning"} title="طھظˆط¬ظ‡">
                  {accountType === "personal" ? "ط§ع©ط§ظ†طھ ظ…ط¹ظ…ظˆظ„غŒ ظ…غŒâ€Œطھظˆط§ظ†ط¯ ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ط´ظˆط¯طŒ ط§ظ…ط§ ط§ظ†طھط´ط§ط± ظ†ظ‡ط§غŒغŒ ط¯ط³طھغŒ ط§ط³طھ." : "ط§ظ†طھط®ط§ط¨ ط§غŒظ†ط³طھط§ع¯ط±ط§ظ… ط¯ط± composer ط¨ط±ط§غŒ ط¢ظ…ط§ط¯ظ‡â€Œط³ط§ط²غŒ ظ…ط­طھظˆط§ ظپط¹ط§ظ„ ط§ط³طھطŒ ط§ظ…ط§ ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ظ…ط³طھظ‚غŒظ… ط¢ظ† طھط§ ط§طھطµط§ظ„ ظˆط§ظ‚ط¹غŒ Meta ظ…ط³ط¯ظˆط¯ ظ…غŒâ€Œط´ظˆط¯."}
                </NoticeBanner>
              </aside>
            </div>
          ) : null}
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}

