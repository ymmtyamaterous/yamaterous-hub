import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/podcasts/$episodeId/edit")({
  component: EditPodcastPage,
});

function EditPodcastPage() {
  const { episodeId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: episode, isLoading } = useQuery(
    orpc.podcasts.adminGet.queryOptions({ input: { id: episodeId } }),
  );
  const { data: categories = [] } = useQuery(orpc.categories.list.queryOptions());

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // 音声ファイル状態
  const [audioUrl, setAudioUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileSize, setAudioFileSize] = useState<number | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newAudioUrl, setNewAudioUrl] = useState("");

  useEffect(() => {
    if (episode) {
      setTitle(episode.title);
      setSlug(episode.slug);
      setDescription(episode.description);
      setIsPublished(episode.isPublished);
      setSelectedCategoryIds(episode.categories.map((c) => c.id));
      setAudioUrl(episode.audioUrl);
      setAudioDuration(episode.duration);
    }
  }, [episode]);

  const updateMutation = useMutation(
    orpc.podcasts.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.podcasts.adminList.queryOptions());
        queryClient.invalidateQueries(
          orpc.podcasts.adminGet.queryOptions({ input: { id: episodeId } }),
        );
        toast.success("エピソードを更新しました");
        navigate({ to: "/admin/podcasts" });
      },
      onError: (err: { message?: string }) =>
        toast.error(err?.message ?? "エピソードの更新に失敗しました"),
    }),
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = new Set(["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/m4a"]);
    if (!allowed.has(file.type)) {
      toast.error("mp3 または m4a ファイルを選択してください");
      e.target.value = "";
      return;
    }

    setAudioFile(file);
    setNewAudioUrl("");
    setUploadProgress(null);

    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      setAudioDuration(Math.round(audio.duration));
      URL.revokeObjectURL(url);
    });
  };

  const handleUpload = () => {
    if (!audioFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", audioFile);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      setIsUploading(false);
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText) as {
          url: string;
          fileSize: number;
          mimeType: string;
        };
        setNewAudioUrl(data.url);
        setAudioFileSize(data.fileSize);
        setAudioMimeType(data.mimeType);
        toast.success("音声ファイルをアップロードしました");
      } else {
        const err = JSON.parse(xhr.responseText) as { error?: string };
        toast.error(err.error ?? "アップロードに失敗しました");
        setUploadProgress(null);
      }
    });

    xhr.addEventListener("error", () => {
      setIsUploading(false);
      setUploadProgress(null);
      toast.error("アップロードに失敗しました");
    });

    xhr.open("POST", "/api/upload/audio");
    xhr.withCredentials = true;
    xhr.send(formData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      toast.error("タイトルとスラッグは必須です");
      return;
    }
    updateMutation.mutate({
      id: episodeId,
      title,
      slug,
      description,
      audioUrl: newAudioUrl || audioUrl,
      duration: audioDuration ?? undefined,
      fileSize: audioFileSize ?? undefined,
      mimeType: audioMimeType ?? undefined,
      isPublished,
      categoryIds: selectedCategoryIds,
    });
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--sc-font-jp)",
    fontSize: "14px",
    padding: "0.5rem 0.75rem",
    border: "1px solid rgba(200,0,90,0.2)",
    borderRadius: "3px",
    background: "rgba(253,246,239,0.8)",
    color: "var(--sc-text)",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--sc-font-mono)",
    fontSize: "11px",
    letterSpacing: "0.1em",
    color: "var(--sc-muted)",
    marginBottom: "0.3rem",
    display: "block",
  };

  if (isLoading) {
    return (
      <div
        style={{
          padding: "2rem",
          fontFamily: "var(--sc-font-mono)",
          fontSize: "13px",
          color: "var(--sc-muted)",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!episode) {
    return (
      <div
        style={{
          padding: "2rem",
          fontFamily: "var(--sc-font-mono)",
          fontSize: "13px",
          color: "var(--sc-muted)",
        }}
      >
        エピソードが見つかりません
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          fontFamily: "var(--sc-font-mono)",
          fontSize: "10px",
          letterSpacing: "0.2em",
          color: "var(--sc-cyber)",
          marginBottom: "0.5rem",
        }}
      >
        // EDIT EPISODE
      </div>
      <h1
        style={{
          fontFamily: "var(--sc-font-jp)",
          fontWeight: 900,
          fontSize: "1.8rem",
          color: "var(--sc-text)",
          marginBottom: "2rem",
        }}
        className="dark:!text-neutral-100"
      >
        エピソードを編集
      </h1>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: "rgba(253,246,239,0.9)",
            border: "1px solid rgba(200,0,90,0.12)",
            borderRadius: "4px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
          className="dark:!bg-neutral-800/80 dark:!border-pink-900/20"
        >
          {/* タイトル */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>タイトル *</label>
            <input
              style={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="エピソードのタイトル"
              required
              className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
            />
          </div>

          {/* スラッグ */}
          <div>
            <label style={labelStyle}>スラッグ * (URL: /podcast/スラッグ)</label>
            <input
              style={inputStyle}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-episode-slug"
              pattern="[a-z0-9\-]+"
              title="小文字英数字とハイフンのみ"
              required
              className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
            />
          </div>

          {/* 説明 */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>説明</label>
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="エピソードの説明"
              className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
            />
          </div>

          {/* 現在の音声ファイル */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>現在の音声ファイル</label>
            <div
              style={{
                padding: "0.5rem 0.75rem",
                border: "1px solid rgba(200,0,90,0.1)",
                borderRadius: "3px",
                background: "rgba(200,0,90,0.03)",
                marginBottom: "0.75rem",
              }}
            >
              <audio
                controls
                src={audioUrl}
                style={{ width: "100%", height: "36px" }}
              />
              <div
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "10px",
                  color: "var(--sc-muted)",
                  marginTop: "0.25rem",
                  wordBreak: "break-all",
                }}
              >
                {audioUrl}
              </div>
            </div>

            <label style={labelStyle}>音声ファイルを差し替える（省略可）</label>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/mpeg,audio/mp4,audio/x-m4a,.mp3,.m4a"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    ...inputStyle,
                    cursor: "pointer",
                    textAlign: "left",
                    color: audioFile ? "var(--sc-text)" : "var(--sc-muted)",
                  }}
                  className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
                >
                  {audioFile ? audioFile.name : "新しいファイルを選択..."}
                </button>
              </div>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!audioFile || isUploading || !!newAudioUrl}
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "12px",
                  padding: "0.5rem 1.2rem",
                  border: "none",
                  borderRadius: "2px",
                  background:
                    !audioFile || isUploading || !!newAudioUrl
                      ? "rgba(200,0,90,0.3)"
                      : "var(--sc-cyber)",
                  color: "#fff",
                  cursor:
                    !audioFile || isUploading || !!newAudioUrl
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {isUploading ? "アップロード中..." : newAudioUrl ? "完了" : "アップロード"}
              </button>
            </div>

            {uploadProgress !== null && (
              <div style={{ marginTop: "0.5rem" }}>
                <div
                  style={{
                    height: "4px",
                    background: "rgba(200,0,90,0.1)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${uploadProgress}%`,
                      background: newAudioUrl ? "var(--sc-sakura)" : "var(--sc-cyber)",
                      transition: "width 0.2s",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: "var(--sc-font-mono)",
                    fontSize: "10px",
                    color: "var(--sc-muted)",
                    marginTop: "0.25rem",
                  }}
                >
                  {newAudioUrl ? "✓ 差し替え完了" : `${uploadProgress}%`}
                </div>
              </div>
            )}
          </div>

          {/* カテゴリ選択 */}
          {categories.length > 0 && (
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>カテゴリ（複数選択可）</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {categories.map((cat) => {
                  const checked = selectedCategoryIds.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.3rem 0.75rem",
                        border: checked
                          ? "1px solid var(--sc-sakura)"
                          : "1px solid rgba(200,0,90,0.2)",
                        borderRadius: "20px",
                        background: checked ? "rgba(200,0,90,0.08)" : "transparent",
                        cursor: "pointer",
                        fontFamily: "var(--sc-font-jp)",
                        fontSize: "12px",
                        color: checked ? "var(--sc-sakura)" : "var(--sc-muted)",
                        userSelect: "none",
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedCategoryIds((prev) =>
                            e.target.checked
                              ? [...prev, cat.id]
                              : prev.filter((id) => id !== cat.id),
                          );
                        }}
                        style={{ display: "none" }}
                      />
                      {cat.name}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* 公開設定 */}
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              style={{ accentColor: "var(--sc-sakura)", width: "16px", height: "16px" }}
            />
            <label
              htmlFor="isPublished"
              style={{ ...labelStyle, marginBottom: 0, cursor: "pointer", fontSize: "13px" }}
            >
              公開する
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/podcasts" })}
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              padding: "0.6rem 1.5rem",
              border: "1px solid rgba(200,0,90,0.2)",
              borderRadius: "2px",
              background: "transparent",
              color: "var(--sc-muted)",
              cursor: "pointer",
            }}
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              padding: "0.6rem 1.8rem",
              border: "none",
              borderRadius: "2px",
              background: updateMutation.isPending
                ? "rgba(200,0,90,0.4)"
                : "var(--sc-sakura)",
              color: "#fff",
              cursor: updateMutation.isPending ? "not-allowed" : "pointer",
              fontWeight: 700,
              boxShadow: "0 2px 12px rgba(200,0,90,0.3)",
            }}
          >
            {updateMutation.isPending ? "更新中..." : "エピソードを更新"}
          </button>
        </div>
      </form>
    </div>
  );
}
