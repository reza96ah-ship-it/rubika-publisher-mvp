from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "frontend" / "app" / "compose" / "_page.tsx"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise RuntimeError(f"Composer migration block not found: {label}")
    return text.replace(old, new, 1)


def replace_regex(text: str, pattern: str, replacement: str, label: str) -> str:
    next_text, count = re.subn(pattern, replacement, text, count=1, flags=re.DOTALL)
    if count != 1:
        raise RuntimeError(f"Composer migration regex did not match once: {label} ({count})")
    return next_text


def main() -> None:
    text = PATH.read_text(encoding="utf-8")

    text = replace_once(
        text,
        'import { createCampaign, loadCampaigns, type Campaign } from "../../lib/campaigns";\n'
        'import { channelCanAutoPublish, channelCanManualPublish, channelIsReady, channelStatusLabel, findChannelAccount, loadChannelAccounts, type ChannelAccount } from "../../lib/channel-accounts";\n'
        'import { channelOptions, hasChannel, normalizeChannels, serializeChannels, type PublishingChannel } from "../../lib/channels";\n'
        'import { approvalBlocksPublishing, approvalConfig } from "../../lib/posts";\n'
        'import { loadWorkspaceOverview, type StoreProfile } from "../../lib/workspace";\n',
        'import { createCampaign, type Campaign } from "../../lib/campaigns";\n'
        'import { channelCanAutoPublish, channelCanManualPublish, channelIsReady, channelStatusLabel, findChannelAccount, type ChannelAccount } from "../../lib/channel-accounts";\n'
        'import { channelOptions, hasChannel, serializeChannels, type PublishingChannel } from "../../lib/channels";\n'
        'import {\n'
        '  composerDraftStorageKey,\n'
        '  composerTimezone,\n'
        '  deriveComposerReadiness,\n'
        '  emptyComposerForm,\n'
        '  getComposerValidationMessage,\n'
        '  hasComposerDraftContent,\n'
        '  parseComposerDraft,\n'
        '  serializeComposerDraft,\n'
        '  type AutosaveState,\n'
        '  type ComposerForm,\n'
        '  type ComposerImageEditSource,\n'
        '  type MediaAsset,\n'
        '  type SaveAction,\n'
        '  type StudioPanel,\n'
        '  type WorkspaceMode\n'
        '} from "../../lib/composer/domain";\n'
        'import {\n'
        '  attachComposerMedia,\n'
        '  changeComposerPostStatus,\n'
        '  loadComposerMediaFile,\n'
        '  loadComposerResources,\n'
        '  markComposerPostReady,\n'
        '  saveComposerPost,\n'
        '  scheduleComposerPost,\n'
        '  uploadComposerMedia\n'
        '} from "../../lib/composer/repository";\n'
        'import { approvalConfig, type Post } from "../../lib/posts";\n'
        'import type { StoreProfile } from "../../lib/workspace";\n',
        "imports",
    )

    text = replace_regex(
        text,
        r'const apiUrl = process\.env\.NEXT_PUBLIC_API_URL \?\? "http://localhost:8000";\n'
        r'const scheduleTimezone = "Asia/Tehran";\n'
        r'const localDraftKey = "rubika_publisher_compose_draft";\n\n'
        r'type MediaAsset = \{.*?\n\};\n\n'
        r'type SaveAction = .*?\n'
        r'type AutosaveState = .*?\n'
        r'type StudioPanel = .*?\n'
        r'type WorkspaceMode = .*?\n'
        r'type ComposerImageEditSource = \{.*?\n\};\n\n'
        r'type Post = \{.*?\n\};\n\n'
        r'const emptyForm = \{.*?\n\};\n',
        "",
        "local contracts",
    )

    text = text.replace("scheduleTimezone", "composerTimezone")
    text = text.replace("localDraftKey", "composerDraftStorageKey")
    text = text.replace("emptyForm", "emptyComposerForm")

    old_readiness = '''  const timezone = composerTimezone;
  const hasSchedule = Boolean(form.scheduled_at);
  const hasTitle = Boolean(form.title.trim());
  const hasPostBody = Boolean(form.caption.trim() || previewImageUrl);
  const hasLocalDraftContent = Boolean(form.title.trim() || form.caption.trim() || form.hashtags.trim() || form.campaign_id || form.campaign.trim() || form.internal_note.trim() || form.scheduled_at || selectedMediaId);
  const selectedChannels = useMemo(() => normalizeChannels(form.platform), [form.platform]);
  const instagramSelected = hasChannel(form.platform, "instagram");
  const rubikaSelected = hasChannel(form.platform, "rubika");
  const rubikaChannel = findChannelAccount(channelAccounts, "rubika");
  const instagramChannel = findChannelAccount(channelAccounts, "instagram");
  const rubikaReady = channelIsReady(rubikaChannel);
  const instagramReady = channelIsReady(instagramChannel);
  const instagramManualReady = channelCanManualPublish(instagramChannel);
  const selectedReadyChannels = selectedChannels.filter((channel) => channelIsReady(findChannelAccount(channelAccounts, channel)));
  const hasReadyPublishingChannel = selectedReadyChannels.length > 0;
  const canMoveToReady = !editingPost || ["draft", "failed", "cancelled"].includes(editingPost.status);
  const reviewBlocksSchedule = editingPost ? approvalBlocksPublishing(editingPost) : false;
  const canSaveDraft = hasTitle;
  const canMarkReady = hasTitle && hasPostBody && canMoveToReady;
  const canSchedule = canMarkReady && hasSchedule && hasReadyPublishingChannel && !reviewBlocksSchedule;
'''
    new_readiness = '''  const timezone = composerTimezone;
  const readiness = useMemo(() => deriveComposerReadiness({
    form,
    channelAccounts,
    editingPost,
    hasMedia: Boolean(previewImageUrl)
  }), [channelAccounts, editingPost, form, previewImageUrl]);
  const {
    selectedChannels,
    selectedReadyChannels,
    hasSchedule,
    hasTitle,
    hasPostBody,
    hasReadyPublishingChannel,
    reviewBlocksSchedule,
    canSaveDraft,
    canMarkReady,
    canSchedule
  } = readiness;
  const hasLocalDraftContent = hasComposerDraftContent(form, selectedMediaId);
  const instagramSelected = hasChannel(form.platform, "instagram");
  const rubikaSelected = hasChannel(form.platform, "rubika");
  const rubikaChannel = findChannelAccount(channelAccounts, "rubika");
  const instagramChannel = findChannelAccount(channelAccounts, "instagram");
  const rubikaReady = channelIsReady(rubikaChannel);
  const instagramReady = channelIsReady(instagramChannel);
  const instagramManualReady = channelCanManualPublish(instagramChannel);
'''
    text = replace_once(text, old_readiness, new_readiness, "readiness")

    text = replace_regex(
        text,
        r'  function token\(\) \{.*?\n  \}\n\n'
        r'  const loadData = useCallback\(async \(\) => \{.*?\n  \}, \[editingPostId, presetCampaignId, presetScheduledAt\]\);',
        '''  const loadData = useCallback(async () => {
    setLoading(true);
    setComposerReady(false);
    const resources = await loadComposerResources(editingPostId);
    const loadedMediaAssets = resources.mediaAssets;

    setStore(resources.store);
    setChannelAccounts(resources.channelAccounts);
    setCampaigns(resources.campaigns);
    setPosts(resources.posts);
    setMediaAssets(loadedMediaAssets);

    if (editingPostId) {
      const post = resources.editingPost;
      if (!post) throw new Error("دریافت پست برای ویرایش ناموفق بود");

      setEditingPost(post);
      setForm({
        title: post.title,
        caption: post.caption,
        hashtags: post.hashtags,
        platform: post.platform || "rubika",
        timezone: composerTimezone,
        campaign_id: post.campaign_id ?? null,
        campaign: post.campaign || "",
        internal_note: post.internal_note || "",
        scheduled_at: post.scheduled_at
      });
      setShowOptionalDetails(Boolean(post.campaign_id || post.campaign || post.internal_note));
      const attachedAsset = loadedMediaAssets.find((asset) => asset.post_id === post.id);
      setSelectedMediaId(attachedAsset ? String(attachedAsset.id) : "");
    } else {
      const presetCampaign = presetCampaignId
        ? resources.campaigns.find((campaign) => String(campaign.id) === presetCampaignId) ?? null
        : null;
      const savedDraft = window.localStorage.getItem(composerDraftStorageKey);
      const restoredDraft = parseComposerDraft(savedDraft);
      if (savedDraft && !restoredDraft) {
        window.localStorage.removeItem(composerDraftStorageKey);
      }

      setEditingPost(null);
      const nextForm = restoredDraft?.form
        ? {
            ...emptyComposerForm,
            ...restoredDraft.form,
            scheduled_at: presetScheduledAt || restoredDraft.form.scheduled_at
          }
        : { ...emptyComposerForm, scheduled_at: presetScheduledAt };
      if (presetCampaign) {
        nextForm.campaign_id = presetCampaign.id;
        nextForm.campaign = presetCampaign.name;
      }
      setForm(nextForm);
      const restoredMediaId = restoredDraft?.selectedMediaId ?? "";
      setSelectedMediaId(
        loadedMediaAssets.some((asset) => String(asset.id) === restoredMediaId)
          ? restoredMediaId
          : ""
      );
      setShowOptionalDetails(Boolean(
        presetCampaign
        || restoredDraft?.form.campaign_id
        || restoredDraft?.form.campaign
        || restoredDraft?.form.internal_note
      ));
      if (restoredDraft?.savedAt) {
        setAutosaveState("restored");
        setAutosaveAt(restoredDraft.savedAt);
      }
    }

    setComposerReady(true);
    setLoading(false);
  }, [editingPostId, presetCampaignId, presetScheduledAt]);''',
        "loadData",
    )

    text = replace_once(
        text,
        '            const response = await fetch(`${apiUrl}/media/${asset.id}/file`, {\n'
        '              headers: { Authorization: `Bearer ${token()}` }\n'
        '            });\n'
        '            if (!response.ok) return null;\n'
        '            const blob = await response.blob();\n',
        '            const blob = await loadComposerMediaFile(asset.id);\n',
        "media preview",
    )

    text = replace_once(
        text,
        '      window.localStorage.setItem(composerDraftStorageKey, JSON.stringify({ form, selectedMediaId, savedAt }));',
        '      window.localStorage.setItem(\n'
        '        composerDraftStorageKey,\n'
        '        serializeComposerDraft({ form, selectedMediaId, savedAt })\n'
        '      );',
        "autosave serialization",
    )

    text = replace_once(
        text,
        '  function updateField(field: keyof typeof emptyComposerForm, value: typeof emptyComposerForm[keyof typeof emptyComposerForm]) {',
        '  function updateField(field: keyof ComposerForm, value: ComposerForm[keyof ComposerForm]) {',
        "updateField type",
    )

    text = replace_regex(
        text,
        r'  async function uploadSelectedFile\(\) \{.*?\n  \}\n\n  function openImageEditor',
        '''  async function uploadSelectedFile() {
    if (!selectedFile) return null;
    return uploadComposerMedia({ file: selectedFile });
  }

  function openImageEditor''',
        "upload selected file",
    )

    text = replace_once(
        text,
        '      const formData = new FormData();\n'
        '      formData.append("file", file);\n'
        '      formData.append("folder", editingImageSource.folder);\n'
        '      formData.append("tags", [editingImageSource.tags, "edited", "composer"].filter(Boolean).join(", "));\n'
        '      const response = await fetch(`${apiUrl}/media`, {\n'
        '        method: "POST",\n'
        '        headers: { Authorization: `Bearer ${token()}` },\n'
        '        body: formData\n'
        '      });\n'
        '      if (!response.ok) throw new Error("ذخیره نسخه ویرایش‌شده ناموفق بود");\n'
        '      const savedAsset = (await response.json()) as MediaAsset;\n',
        '      const savedAsset = await uploadComposerMedia({\n'
        '        file,\n'
        '        folder: editingImageSource.folder,\n'
        '        tags: [editingImageSource.tags, "edited", "composer"].filter(Boolean).join(", ")\n'
        '      });\n',
        "edited media upload",
    )

    text = replace_regex(
        text,
        r'  async function attachMedia\(assetId: number, postId: number \| null\) \{.*?\n  \}\n\n',
        "",
        "attachMedia function",
    )
    text = text.replace("attachMedia(", "attachComposerMedia(")

    text = replace_regex(
        text,
        r'  async function schedulePost\(postId: number, scheduledAt: string\) \{.*?\n  \}\n\n'
        r'  async function markReadyPost\(postId: number\) \{.*?\n  \}\n\n'
        r'  async function changePostStatus\(postId: number, status: string\) \{.*?\n  \}\n\n',
        "",
        "post action functions",
    )
    text = text.replace("schedulePost(", "scheduleComposerPost(")
    text = text.replace("markReadyPost(", "markComposerPostReady(")
    text = text.replace("changePostStatus(", "changeComposerPostStatus(")

    text = replace_regex(
        text,
        r'    if \(!canSaveDraft\) \{.*?\n    \}\n\n    setSavingAction\(action\);',
        '''    const validationMessage = getComposerValidationMessage({
      action,
      readiness,
      instagramSelected,
      instagramReady
    });
    if (validationMessage) {
      setError(validationMessage);
      showToast({
        title: !canSaveDraft
          ? "عنوان داخلی لازم است"
          : action === "ready"
            ? "محتوای پست کامل نیست"
            : "زمان‌بندی هنوز آماده نیست",
        description: validationMessage,
        tone: "warning"
      });
      return;
    }

    setSavingAction(action);''',
        "save validation",
    )

    text = replace_once(
        text,
        '      const endpoint = isEditing ? `${apiUrl}/posts/${editingPostId}` : `${apiUrl}/posts`;\n'
        '      const response = await fetch(endpoint, {\n'
        '        method: isEditing ? "PUT" : "POST",\n'
        '        headers: {\n'
        '          "Content-Type": "application/json",\n'
        '          Authorization: `Bearer ${token()}`\n'
        '        },\n'
        '        body: JSON.stringify({ ...form, timezone: composerTimezone })\n'
        '      });\n\n'
        '      if (!response.ok) throw new Error(isEditing ? "به‌روزرسانی پست ناموفق بود" : "ذخیره پیش‌نویس ناموفق بود");\n'
        '      const savedPost = (await response.json()) as Post;\n',
        '      const savedPost = await saveComposerPost({ form, editingPostId });\n',
        "save post request",
    )

    forbidden = (
        "const apiUrl =",
        "function token()",
        "loadWorkspaceOverview(",
        "loadCampaigns(",
        "loadChannelAccounts(",
        "approvalBlocksPublishing(",
        "normalizeChannels(",
        "async function attachMedia",
        "async function schedulePost",
        "async function markReadyPost",
        "async function changePostStatus",
    )
    for token in forbidden:
        if token in text:
            raise RuntimeError(f"Legacy Composer token remains after migration: {token}")

    PATH.write_text(text, encoding="utf-8")
    print("Composer route migrated to domain and repository modules.")


if __name__ == "__main__":
    main()
