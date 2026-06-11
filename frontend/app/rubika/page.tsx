"use client";

import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Circle,
  Clock3,
  KeyRound,
  LockKeyhole,
  PlugZap,
  RadioTower,
  RefreshCw,
  Route,
  Save,
  Send,
  ShieldCheck,
  Undo2
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { AuthGate } from "../../components/auth-gate";
import { LoadingPanel } from "../../components/loading-skeleton";
import { useToast } from "../../components/toast-provider";
import { Button } from "../../components/ui/button";
import { Field, Input } from "../../components/ui/form";
import { DetailGrid, NoticeBanner, StatusToken, WorkspacePage, WorkspacePanel } from "../../components/workspace-ui";
import { apiUrl, authHeaders } from "../../lib/posts";
import { isRubikaTestFresh, notifyWorkspaceUpdated } from "../../lib/workspace";

type DiagnosticItem = {
  label: string;
  detail: string;
  done: boolean;
  tone?: "success" | "warning" | "alert";
};

function statusLabel(status: string, dirty = false, testFresh = false) {
  if (dirty) return "طھط؛غŒغŒط±ط§طھ ط°ط®غŒط±ظ‡ ظ†ط´ط¯ظ‡";
  if (status === "connected" && testFresh) return "ط§طھطµط§ظ„ طھط§غŒغŒط¯ ط´ط¯ظ‡";
  if (status === "connected") return "ظ†غŒط§ط²ظ…ظ†ط¯ طھط³طھ ظ…ط¬ط¯ط¯";
  if (status === "failed") return "ط§طھطµط§ظ„ ط®ط·ط§ ط¯ط§ط±ط¯";
  if (status === "missing_settings") return "طھظ†ط¸غŒظ…ط§طھ ظ†ط§ظ‚طµ ط§ط³طھ";
  return "ظ†غŒط§ط²ظ…ظ†ط¯ طھط³طھ ط§طھطµط§ظ„";
}

function statusTone(status: string, dirty = false, testFresh = false): "success" | "warning" | "alert" | "neutral" {
  if (dirty) return "warning";
  if (status === "connected" && testFresh) return "success";
  if (status === "connected") return "warning";
  if (status === "failed" || status === "missing_settings") return "alert";
  return "warning";
}

function formatLastTest(value: string) {
  if (!value) return "ظ‡ظ†ظˆط² ط§ط¬ط±ط§ ظ†ط´ط¯ظ‡";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ط²ظ…ط§ظ† ظ†ط§ظ…ط¹طھط¨ط±";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function buildDiagnostics(maskedToken: string, chatId: string, status: string, dirty: boolean, testFresh: boolean): DiagnosticItem[] {
  return [
    {
      label: "طھظˆع©ظ† ط±ط¨ط§طھ",
      detail: maskedToken ? "طھظˆع©ظ† ط§ظ…ظ† ط°ط®غŒط±ظ‡ ط´ط¯ظ‡ ط§ط³طھ." : "ط¨ط±ط§غŒ ط§ظ†طھط´ط§ط± ط®ظˆط¯ع©ط§ط± ط¨ط§غŒط¯ طھظˆع©ظ† ط±ط¨ط§طھ ط±ط§ ط°ط®غŒط±ظ‡ ع©ظ†غŒط¯.",
      done: Boolean(maskedToken),
      tone: maskedToken ? "success" : "warning"
    },
    {
      label: "ظ…ظ‚طµط¯ ط§ظ†طھط´ط§ط±",
      detail: chatId ? "ط´ظ†ط§ط³ظ‡ ظ…ظ‚طµط¯ ط«ط¨طھ ط´ط¯ظ‡ ط§ط³طھ." : "ط´ظ†ط§ط³ظ‡ ع©ط§ظ†ط§ظ„ غŒط§ ع¯ظپطھâ€Œظˆع¯ظˆغŒ ظ…ظ‚طµط¯ ط±ط§ ظˆط§ط±ط¯ ع©ظ†غŒط¯.",
      done: Boolean(chatId.trim()),
      tone: chatId ? "success" : "warning"
    },
    {
      label: "طھط³طھ ط§طھطµط§ظ„",
      detail: dirty ? "ط§ط¨طھط¯ط§ طھط؛غŒغŒط±ط§طھ ط±ط§ ط°ط®غŒط±ظ‡ ع©ظ†غŒط¯طŒ ط³ظ¾ط³ طھط³طھ ط§طھطµط§ظ„ ط±ط§ ط§ط¬ط±ط§ ع©ظ†غŒط¯." : status === "connected" && testFresh ? "Rubika API ط¯ط± 24 ط³ط§ط¹طھ ط§ط®غŒط± ط¨ط§ ط§غŒظ† طھظ†ط¸غŒظ…ط§طھ ظ¾ط§ط³ط® ظ…ظˆظپظ‚ ط¯ط§ط¯ظ‡ ط§ط³طھ." : status === "connected" ? "ط¢ط®ط±غŒظ† طھط³طھ ط§طھطµط§ظ„ ظ‚ط¯غŒظ…غŒ ط§ط³طھط› ط¨ط±ط§غŒ ط¨ط§ط² ط´ط¯ظ† ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ط¯ظˆط¨ط§ط±ظ‡ طھط³طھ ع©ظ†غŒط¯." : "ط¨ط¹ط¯ ط§ط² ط°ط®غŒط±ظ‡طŒ طھط³طھ ط§طھطµط§ظ„ ط±ط§ ط§ط¬ط±ط§ ع©ظ†غŒط¯.",
      done: status === "connected" && testFresh && !dirty,
      tone: status === "failed" ? "alert" : status === "connected" ? "success" : "warning"
    }
  ];
}

function DiagnosticRow({ item }: { item: DiagnosticItem }) {
  const Icon = item.done ? BadgeCheck : item.tone === "alert" ? AlertTriangle : RadioTower;
  const color = item.done ? "text-emerald-700" : item.tone === "alert" ? "text-rose-700" : "text-amber-700";
  return (
    <div className="flex items-start gap-3 border-b border-app-border py-3 first:pt-0 last:border-0 last:pb-0">
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} aria-hidden="true" />
      <div>
        <p className="text-sm font-bold text-app-text">{item.label}</p>
        <p className="mt-1 text-xs leading-6 text-app-muted">{item.detail}</p>
      </div>
    </div>
  );
}

export default function RubikaPage() {
  const { showToast } = useToast();
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [savedChatId, setSavedChatId] = useState("");
  const [maskedToken, setMaskedToken] = useState("");
  const [botName, setBotName] = useState("");
  const [status, setStatus] = useState("not_tested");
  const [lastError, setLastError] = useState("");
  const [lastTestAt, setLastTestAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const response = await fetch(`${apiUrl}/rubika/settings`, { headers: authHeaders() });

      if (!response.ok) throw new Error("ط®ط·ط§ ط¯ط± ط¯ط±غŒط§ظپطھ طھظ†ط¸غŒظ…ط§طھ ط±ظˆط¨غŒع©ط§");

      const data = await response.json();
      if (data) {
        setChatId(data.chat_id ?? "");
        setSavedChatId(data.chat_id ?? "");
        setMaskedToken(data.bot_token_masked ?? "");
        setBotName(data.bot_name ?? "");
        setStatus(data.status ?? "not_tested");
        setLastError(data.last_error ?? "");
        setLastTestAt(data.last_test_at ?? "");
      }
      setLoading(false);
    }

    loadSettings().catch(() => {
      setError("ط®ط·ط§ ط¯ط± ط¯ط±غŒط§ظپطھ طھظ†ط¸غŒظ…ط§طھ ط±ظˆط¨غŒع©ط§");
      setLoading(false);
    });
  }, []);

  const dirty = useMemo(() => Boolean(botToken.trim()) || chatId !== savedChatId, [botToken, chatId, savedChatId]);
  const testFresh = isRubikaTestFresh(lastTestAt);
  const connectionReady = status === "connected" && testFresh && !dirty;
  const diagnostics = useMemo(() => buildDiagnostics(maskedToken, chatId, status, dirty, testFresh), [chatId, dirty, maskedToken, status, testFresh]);
  const readyCount = diagnostics.filter((item) => item.done).length;
  const hasSavedToken = Boolean(maskedToken);
  const canSave = Boolean(chatId.trim()) && (Boolean(botToken.trim()) || hasSavedToken);
  const canTest = Boolean(maskedToken) && Boolean(savedChatId.trim()) && !dirty && !testing && !saving;
  const journeySteps = [
    { label: "ط«ط¨طھ ط§ط¹طھط¨ط§ط±ظ†ط§ظ…ظ‡", detail: "طھظˆع©ظ† ظˆ ظ…ظ‚طµط¯ ط§ظ†طھط´ط§ط± ط°ط®غŒط±ظ‡ ط´ط¯ظ‡â€Œط§ظ†ط¯.", done: Boolean(maskedToken && savedChatId.trim()) && !dirty, icon: KeyRound },
    { label: "طھط³طھ ط³ظ„ط§ظ…طھ ط§طھطµط§ظ„", detail: testFresh ? "ط§طھطµط§ظ„ ط¯ط± 24 ط³ط§ط¹طھ ط§ط®غŒط± طھط§غŒغŒط¯ ط´ط¯ظ‡ ط§ط³طھ." : "غŒع© طھط³طھ طھط§ط²ظ‡ ط¨ط±ط§غŒ ط§ط·ظ…غŒظ†ط§ظ† ط§ط² ط³ظ„ط§ظ…طھ ع©ط§ظ†ط§ظ„ ط§ط¬ط±ط§ ع©ظ†غŒط¯.", done: connectionReady, icon: RadioTower },
    { label: "ط¨ط§ط² ط´ط¯ظ† ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ", detail: connectionReady ? "طµظپ ط§ظ†طھط´ط§ط± ط§ط¬ط§ط²ظ‡ ط¯ط±غŒط§ظپطھ ظ¾ط³طھ ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒâ€Œط´ط¯ظ‡ ط±ط§ ط¯ط§ط±ط¯." : "طھط§ طھط§غŒغŒط¯ طھط³طھ طھط§ط²ظ‡طŒ ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ط¯ط± API ظ‚ظپظ„ ظ…غŒâ€Œظ…ط§ظ†ط¯.", done: connectionReady, icon: LockKeyhole }
  ];

  function resetChanges() {
    setBotToken("");
    setChatId(savedChatId);
    setMessage("");
    setError("");
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!canSave) {
      setError("طھظˆع©ظ† ط±ط¨ط§طھ ظˆ ط´ظ†ط§ط³ظ‡ ظ…ظ‚طµط¯ ط¨ط±ط§غŒ ط°ط®غŒط±ظ‡ ظ„ط§ط²ظ… ط§ط³طھ");
      showToast({ title: "ط§ط·ظ„ط§ط¹ط§طھ ط§طھطµط§ظ„ ع©ط§ظ…ظ„ ظ†غŒط³طھ", description: "طھظˆع©ظ† ط±ط¨ط§طھ ظˆ ط´ظ†ط§ط³ظ‡ ظ…ظ‚طµط¯ ط±ط§ ط¨ط±ط±ط³غŒ ع©ظ†غŒط¯.", tone: "warning" });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${apiUrl}/rubika/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({ bot_token: botToken.trim(), chat_id: chatId.trim() })
      });

      if (!response.ok) throw new Error("ط°ط®غŒط±ظ‡ طھظ†ط¸غŒظ…ط§طھ ط±ظˆط¨غŒع©ط§ ظ†ط§ظ…ظˆظپظ‚ ط¨ظˆط¯");
      const data = await response.json();
      setChatId(data.chat_id ?? "");
      setSavedChatId(data.chat_id ?? "");
      setMaskedToken(data.bot_token_masked ?? "");
      setStatus(data.status ?? "not_tested");
      setLastError(data.last_error ?? "");
      setLastTestAt(data.last_test_at ?? "");
      const nextMessage = botToken.trim() ? "طھظ†ط¸غŒظ…ط§طھ ط±ظˆط¨غŒع©ط§ ط°ط®غŒط±ظ‡ ط´ط¯ط› ط­ط§ظ„ط§ طھط³طھ ط§طھطµط§ظ„ ط±ط§ ط§ط¬ط±ط§ ع©ظ†غŒط¯" : "ظ…ظ‚طµط¯ ط°ط®غŒط±ظ‡ ط´ط¯ ظˆ طھظˆع©ظ† ظ‚ط¨ظ„غŒ ط­ظپط¸ ط´ط¯";
      setMessage(nextMessage);
      showToast({ title: "طھظ†ط¸غŒظ…ط§طھ ط±ظˆط¨غŒع©ط§ ط°ط®غŒط±ظ‡ ط´ط¯", description: nextMessage, tone: "success" });
      setBotToken("");
      notifyWorkspaceUpdated();
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "ط®ط·ط§غŒ ط°ط®غŒط±ظ‡ طھظ†ط¸غŒظ…ط§طھ";
      setError(nextError);
      showToast({ title: "ط°ط®غŒط±ظ‡ ط§طھطµط§ظ„ ظ†ط§ظ…ظˆظپظ‚ ط¨ظˆط¯", description: nextError, tone: "alert" });
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setMessage("");
    setError("");
    setTesting(true);

    try {
      const response = await fetch(`${apiUrl}/rubika/test`, {
        method: "POST",
        headers: authHeaders()
      });

      const data = await response.json();
      setStatus(data.status ?? "failed");
      setBotName(data.bot_name ?? "");
      setLastError(data.error ?? "");
      setLastTestAt(data.last_test_at ?? "");
      notifyWorkspaceUpdated();
      if (data.ok) {
        setMessage("ط§طھطµط§ظ„ ط±ظˆط¨غŒع©ط§ ظ…ظˆظپظ‚ ط¨ظˆط¯");
        showToast({ title: "ط§طھطµط§ظ„ ط±ظˆط¨غŒع©ط§ طھط§غŒغŒط¯ ط´ط¯", description: "ع©ط§ظ†ط§ظ„ ط¨ط±ط§غŒ ط§ظ†طھط´ط§ط± ط®ظˆط¯ع©ط§ط± ط¢ظ…ط§ط¯ظ‡ ط§ط³طھ.", tone: "success" });
      } else {
        const nextError = data.error || "طھط³طھ ط§طھطµط§ظ„ ظ†ط§ظ…ظˆظپظ‚ ط¨ظˆط¯";
        setError(nextError);
        showToast({ title: "طھط³طھ ط§طھطµط§ظ„ ظ†ط§ظ…ظˆظپظ‚ ط¨ظˆط¯", description: nextError, tone: "alert" });
      }
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "ط®ط·ط§غŒ طھط³طھ ط§طھطµط§ظ„";
      setError(nextError);
      showToast({ title: "طھط³طھ ط§طھطµط§ظ„ ظ†ط§ظ…ظˆظپظ‚ ط¨ظˆط¯", description: nextError, tone: "alert" });
    } finally {
      setTesting(false);
    }
  }

  useEffect(() => {
    function warnAboutUnsavedChanges(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
    }

    window.addEventListener("beforeunload", warnAboutUnsavedChanges);
    return () => window.removeEventListener("beforeunload", warnAboutUnsavedChanges);
  }, [dirty]);

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage className="space-y-4">
          <section className="app-studio-panel rounded-lg px-4 py-3">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <p className="text-[10px] font-black text-app-primary">طھظ†ط¸غŒظ…ط§طھ ع©ط§ظ†ط§ظ„</p>
                <h1 className="mt-1 text-xl font-black text-app-text">ط§طھطµط§ظ„ ط±ظˆط¨غŒع©ط§</h1>
                <p className="mt-1 text-xs leading-5 text-app-muted">ط§ط¹طھط¨ط§ط±ظ†ط§ظ…ظ‡طŒ ظ…ظ‚طµط¯ ظˆ طھط³طھ ط¹ظ…ظ„غŒط§طھغŒ ط§ظ†طھط´ط§ط± ط±ط§ ط§ط² غŒع© طµظپط­ظ‡ ع©ظ†طھط±ظ„ ع©ظ†غŒط¯.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusToken tone={statusTone(status, dirty, testFresh)}>{saving ? "ط¯ط± ط­ط§ظ„ ط°ط®غŒط±ظ‡ طھظ†ط¸غŒظ…ط§طھ" : testing ? "ط¯ط± ط­ط§ظ„ طھط³طھ ط§طھطµط§ظ„" : statusLabel(status, dirty, testFresh)}</StatusToken>
                <StatusToken tone={readyCount === 3 ? "success" : "warning"}>{readyCount}/3 ط¢ظ…ط§ط¯ظ‡</StatusToken>
                {botName ? <StatusToken tone="primary">{botName}</StatusToken> : null}
              </div>
            </div>
          </section>

          <section className="grid overflow-hidden rounded-md border border-app-border bg-white sm:grid-cols-3">
            {[
              { label: "ظˆط¶ط¹غŒطھ ط§طھطµط§ظ„", value: statusLabel(status, dirty, testFresh), detail: dirty ? "ط¨ط¹ط¯ ط§ط² ط°ط®غŒط±ظ‡ ط¯ظˆط¨ط§ط±ظ‡ طھط³طھ ع©ظ†غŒط¯" : testFresh ? "ط¢ط®ط±غŒظ† ظ†طھغŒط¬ظ‡ طھط³طھ ط¹ظ…ظ„غŒط§طھغŒ ظ…ط¹طھط¨ط± ط§ط³طھ" : "ط¨ط±ط§غŒ ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒطŒ طھط³طھ طھط§ط²ظ‡ ظ„ط§ط²ظ… ط§ط³طھ", icon: PlugZap, tone: connectionReady ? "text-emerald-700" : status === "failed" ? "text-rose-700" : "text-amber-700" },
              { label: "طھط´ط®غŒطµ ط¢ظ…ط§ط¯ظ‡â€Œط³ط§ط²غŒ", value: `${readyCount}/3`, detail: "طھظˆع©ظ†طŒ ظ…ظ‚طµط¯ ظˆ طھط³طھ ط§طھطµط§ظ„", icon: ShieldCheck, tone: readyCount === 3 ? "text-emerald-700" : "text-amber-700" },
              { label: "ط¢ط®ط±غŒظ† طھط³طھ", value: formatLastTest(lastTestAt), detail: testFresh ? "ظ…ط¹طھط¨ط± طھط§ 24 ط³ط§ط¹طھ ظ¾ط³ ط§ط² طھط³طھ" : "طھط³طھ ظ…ط¬ط¯ط¯ ط¨ط±ط§غŒ ط¨ط§ط² ط´ط¯ظ† ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ظ„ط§ط²ظ… ط§ط³طھ", icon: Clock3, tone: testFresh ? "text-emerald-700" : "text-amber-700" }
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="flex min-w-0 items-start gap-3 border-b border-app-border p-3 sm:border-b-0 sm:border-l sm:last:border-l-0">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50 ${metric.tone}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-app-muted">{metric.label}</p>
                    <p className="mt-0.5 truncate text-base font-black text-app-text">{metric.value}</p>
                    <p className="truncate text-[11px] text-app-muted">{metric.detail}</p>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="overflow-hidden rounded-md border border-app-border bg-white">
            <div className="flex flex-col justify-between gap-3 border-b border-app-border px-4 py-3 lg:flex-row lg:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-app-primary" aria-hidden="true" />
                  <h2 className="text-sm font-black text-app-text">ظ…ط³غŒط± ط¢ظ…ط§ط¯ظ‡â€Œط³ط§ط²غŒ ط§ظ†طھط´ط§ط±</h2>
                </div>
                <p className="mt-1 text-xs leading-5 text-app-muted">ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ظپظ‚ط· ظ¾ط³ ط§ط² ط°ط®غŒط±ظ‡ طھظ†ط¸غŒظ…ط§طھ ظˆ طھط§غŒغŒط¯ طھط³طھ ط§طھطµط§ظ„ طھط§ط²ظ‡ ط¨ط§ط² ظ…غŒâ€Œط´ظˆط¯.</p>
              </div>
              <StatusToken tone={connectionReady ? "success" : "warning"}>{connectionReady ? "ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ط¨ط§ط² ط§ط³طھ" : "ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ظ‚ظپظ„ ط§ط³طھ"}</StatusToken>
            </div>
            <div className="grid divide-y divide-app-border md:grid-cols-3 md:divide-x md:divide-x-reverse md:divide-y-0">
              {journeySteps.map((step, index) => {
                const Icon = step.icon;
                const active = !step.done && journeySteps.slice(0, index).every((item) => item.done);
                return (
                  <div key={step.label} className={`flex min-h-[96px] gap-3 p-3 ${step.done ? "bg-emerald-50/50" : active ? "bg-blue-50/60" : "bg-white"}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${step.done ? "border-emerald-200 bg-white text-emerald-700" : active ? "border-blue-200 bg-white text-app-primary" : "border-app-border bg-slate-50 text-slate-400"}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-app-text">{step.label}</p>
                        {step.done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" /> : <Circle className={`h-4 w-4 shrink-0 ${active ? "text-app-primary" : "text-slate-300"}`} aria-hidden="true" />}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-app-muted">{step.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {message ? <NoticeBanner tone="success">{message}</NoticeBanner> : null}
          {error ? <NoticeBanner tone="alert">{error}</NoticeBanner> : null}
          {!dirty && status === "connected" && !testFresh ? (
            <NoticeBanner tone="warning" title="طھط³طھ ط§طھطµط§ظ„ ظ†غŒط§ط²ظ…ظ†ط¯ طھظ…ط¯غŒط¯ ط§ط³طھ">
              ط¨ط±ط§غŒ ط§غŒظ…ظ†غŒ ط§ظ†طھط´ط§ط±طŒ طھط³طھ ظ…ظˆظپظ‚ ط§طھطµط§ظ„ ظپظ‚ط· 24 ط³ط§ط¹طھ ظ…ط¹طھط¨ط± ط§ط³طھ. طھط³طھ ط±ط§ ط¯ظˆط¨ط§ط±ظ‡ ط§ط¬ط±ط§ ع©ظ†غŒط¯ طھط§ ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ظ¾ط³طھâ€Œظ‡ط§ ط¨ط§ط² ط´ظˆط¯.
            </NoticeBanner>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <WorkspacePanel title="ط§ط¹طھط¨ط§ط±ظ†ط§ظ…ظ‡ ظˆ ظ…ظ‚طµط¯ ط§ظ†طھط´ط§ط±" description="طھظˆع©ظ† ظپظ‚ط· ظ‡ظ†ع¯ط§ظ… ط¬ط§غŒع¯ط²غŒظ†غŒ ظ„ط§ط²ظ… ط§ط³طھ. ط¨ط±ط§غŒ ط­ظپط¸ طھظˆع©ظ† ط°ط®غŒط±ظ‡â€Œط´ط¯ظ‡طŒ ظپغŒظ„ط¯ ط¢ظ† ط±ط§ ط®ط§ظ„غŒ ط¨ع¯ط°ط§ط±غŒط¯.">
              {loading ? (
                <LoadingPanel />
              ) : (
                <form onSubmit={saveSettings} className="space-y-5">
                  <Field
                    label="طھظˆع©ظ† ط±ط¨ط§طھ ط±ظˆط¨غŒع©ط§"
                    required={!hasSavedToken}
                    hint={hasSavedToken ? "ط¨ط±ط§غŒ ط­ظپط¸ طھظˆع©ظ† ظپط¹ظ„غŒ ط§غŒظ† ظپغŒظ„ط¯ ط±ط§ ط®ط§ظ„غŒ ط¨ع¯ط°ط§ط±غŒط¯ط› ط¨ط±ط§غŒ ط¬ط§غŒع¯ط²غŒظ†غŒطŒ طھظˆع©ظ† ط¬ط¯غŒط¯ ط±ط§ ظˆط§ط±ط¯ ع©ظ†غŒط¯." : "طھظˆع©ظ† ط±ط¨ط§طھ ط¨ط±ط§غŒ ط§ظ†طھط´ط§ط± ط®ظˆط¯ع©ط§ط± ط¶ط±ظˆط±غŒ ط§ط³طھ."}
                  >
                    <Input
                      value={botToken}
                      onChange={(event) => setBotToken(event.target.value)}
                      className="text-left"
                      dir="ltr"
                      placeholder={maskedToken || "طھظˆع©ظ† ط±ط¨ط§طھ ط±ط§ ظˆط§ط±ط¯ ع©ظ†غŒط¯"}
                      required={!hasSavedToken}
                    />
                  </Field>

                  <Field label="Chat ID / Channel ID" required hint="ط´ظ†ط§ط³ظ‡ ع©ط§ظ†ط§ظ„ غŒط§ ع¯ظپطھâ€Œظˆع¯ظˆغŒ ظ…ظ‚طµط¯ ع©ظ‡ ظ¾ط³طھâ€Œظ‡ط§ ط¯ط± ط¢ظ† ظ…ظ†طھط´ط± ظ…غŒâ€Œط´ظˆظ†ط¯.">
                    <Input
                      value={chatId}
                      onChange={(event) => setChatId(event.target.value)}
                      className="text-left"
                      dir="ltr"
                      required
                    />
                  </Field>

                  <div className="grid gap-3 rounded-md border border-app-border bg-slate-50 p-4 text-sm text-app-muted md:grid-cols-2">
                    <div>
                      <p className="font-bold text-app-text">طھظˆع©ظ† ط°ط®غŒط±ظ‡â€Œط´ط¯ظ‡</p>
                      <p className="mt-1 break-all text-left font-mono text-xs" dir="ltr">{maskedToken || "ظ‡ظ†ظˆط² ط°ط®غŒط±ظ‡ ظ†ط´ط¯ظ‡"}</p>
                    </div>
                    <div>
                      <p className="font-bold text-app-text">ط±ظپطھط§ط± ط°ط®غŒط±ظ‡</p>
                      <p className="mt-1 text-xs leading-6">{botToken.trim() ? "طھظˆع©ظ† ط¬ط¯غŒط¯ ط¬ط§غŒع¯ط²غŒظ† ظ…غŒâ€Œط´ظˆط¯." : hasSavedToken ? "طھظˆع©ظ† ظ‚ط¨ظ„غŒ ط­ظپط¸ ظ…غŒâ€Œط´ظˆط¯." : "طھظˆع©ظ† ظ„ط§ط²ظ… ط§ط³طھ."}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 rounded-md border border-app-border bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-black text-app-text">{dirty ? "طھط؛غŒغŒط±ط§طھ ط¢ظ…ط§ط¯ظ‡ ط°ط®غŒط±ظ‡ ط§ط³طھ" : "طھظ†ط¸غŒظ…ط§طھ ط§طھطµط§ظ„ ط¨ظ‡â€Œط±ظˆط² ط§ط³طھ"}</p>
                      <p className="mt-1 text-xs text-app-muted">{dirty ? "ط°ط®غŒط±ظ‡ ع©ظ†غŒط¯ طھط§ طھط³طھ ط§طھطµط§ظ„ ط¨ط±ط§غŒ ظ†ط³ط®ظ‡ ط¬ط¯غŒط¯ ظپط¹ط§ظ„ ط´ظˆط¯." : "ط¨ط±ط§غŒ ط§ط·ظ…غŒظ†ط§ظ† ط§ط² ط³ظ„ط§ظ…طھ ع©ط§ظ†ط§ظ„طŒ طھط³طھ ط¹ظ…ظ„غŒط§طھغŒ ط±ط§ ط§ط¬ط±ط§ ع©ظ†غŒط¯."}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="secondary" onClick={resetChanges} disabled={!dirty || saving}>
                        <Undo2 className="ml-2 h-4 w-4" aria-hidden="true" />
                        ط¨ط§ط²ع¯ط±ط¯ط§ظ†غŒ
                      </Button>
                      <Button type="submit" disabled={saving || !canSave || !dirty}>
                        <Save className="ml-2 h-4 w-4" aria-hidden="true" />
                        {saving ? "ط¯ط± ط­ط§ظ„ ط°ط®غŒط±ظ‡..." : "ط°ط®غŒط±ظ‡ طھط؛غŒغŒط±ط§طھ"}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </WorkspacePanel>

            <aside className="space-y-4">
              <WorkspacePanel title="ظˆط¶ط¹غŒطھ ط¹ظ…ظ„غŒط§طھغŒ" description="ظ‚ط¨ظ„ ط§ط² ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ط¬ط¯غŒطŒ طھط³طھ ط§طھطµط§ظ„ ط¨ط§غŒط¯ ظ…ظˆظپظ‚ ط¨ط§ط´ط¯.">
                <div className="space-y-0">
                  {diagnostics.map((item) => <DiagnosticRow key={item.label} item={item} />)}
                </div>
                {lastError ? (
                  <div className="mt-4">
                    <NoticeBanner tone="alert" title="ط¢ط®ط±غŒظ† ط®ط·ط§">
                      {lastError}
                    </NoticeBanner>
                  </div>
                ) : null}
              </WorkspacePanel>

              <WorkspacePanel title="طھط³طھ ط¹ظ…ظ„غŒط§طھغŒ" description="ط§غŒظ† طھط³طھ ط¨ط§ طھظ†ط¸غŒظ…ط§طھ ط°ط®غŒط±ظ‡â€Œط´ط¯ظ‡طŒ ط¯ط³طھط±ط³غŒ ط±ط¨ط§طھ ط±ظˆط¨غŒع©ط§ ط±ط§ ط¨ط±ط±ط³غŒ ظ…غŒâ€Œع©ظ†ط¯ ظˆ ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ط±ط§ ط¨ط±ط§غŒ 24 ط³ط§ط¹طھ ط¨ط§ط² ظ…غŒâ€Œع©ظ†ط¯.">
                <Button type="button" className="w-full" onClick={testConnection} disabled={!canTest}>
                  <RefreshCw className={`ml-2 h-4 w-4 ${testing ? "animate-spin" : ""}`} aria-hidden="true" />
                  {testing ? "ط¯ط± ط­ط§ظ„ ط¨ط±ط±ط³غŒ ط§طھطµط§ظ„..." : "ط§ط¬ط±ط§غŒ طھط³طھ ط§طھطµط§ظ„"}
                </Button>
                {dirty ? <p className="mt-3 text-xs leading-6 text-amber-700">ط¨ط±ط§غŒ ط§ط¬ط±ط§غŒ طھط³طھطŒ ط§ط¨طھط¯ط§ طھط؛غŒغŒط±ط§طھ ط±ط§ ط°ط®غŒط±ظ‡ ع©ظ†غŒط¯.</p> : null}
              </WorkspacePanel>

              <WorkspacePanel title="ط¬ط²ط¦غŒط§طھ ع©ط§ظ†ط§ظ„" description="ط®ظ„ط§طµظ‡â€Œط§غŒ ط§ط² طھظ†ط¸غŒظ…ط§طھ ط°ط®غŒط±ظ‡â€Œط´ط¯ظ‡ ظˆ ط¢ط®ط±غŒظ† ط¨ط±ط±ط³غŒ.">
                <DetailGrid
                  items={[
                    { label: "طھظˆع©ظ†", value: <span className="block break-all text-left font-mono text-xs" dir="ltr">{maskedToken || "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</span> },
                    { label: "ظ…ظ‚طµط¯ ط°ط®غŒط±ظ‡â€Œط´ط¯ظ‡", value: <span className="block break-all text-left font-mono text-xs" dir="ltr">{savedChatId || "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</span> },
                    { label: "ظ†ط§ظ… ط±ط¨ط§طھ", value: botName || "ظ†ط§ظ…ط´ط®طµ" },
                    { label: "ط¢ط®ط±غŒظ† طھط³طھ", value: formatLastTest(lastTestAt) }
                  ]}
                />
              </WorkspacePanel>

              <WorkspacePanel title="ظ…ط³غŒط± ط¨ط¹ط¯غŒ" description="ط¨ط¹ط¯ ط§ط² طھط³طھ ظ…ظˆظپظ‚طŒ ط§ظ†طھط´ط§ط± ط¯ط³طھغŒ غŒط§ ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ط±ط§ ط´ط±ظˆط¹ ع©ظ†غŒط¯.">
                <div className="grid gap-2">
                  <Button href="/compose">
                    <Send className="ml-2 h-4 w-4" aria-hidden="true" />
                    ط§غŒط¬ط§ط¯ ظ¾ط³طھ
                  </Button>
                  <Button href="/queue" variant="secondary">ط¨ط±ط±ط³غŒ طµظپ ط§ظ†طھط´ط§ط±</Button>
                  <Button href="/logs" variant="secondary">ظ…ط´ط§ظ‡ط¯ظ‡ ظ„ط§ع¯ ط§طھطµط§ظ„ ظˆ ط§ظ†طھط´ط§ط±</Button>
                </div>
              </WorkspacePanel>
            </aside>
          </section>
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}

