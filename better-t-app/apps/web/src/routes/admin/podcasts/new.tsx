import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/podcasts/new")({
  component: NewPodcastPage,
});

function NewPodcastPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // 音声ファイルアップロード状態
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioFileSize, setAudioFileSize] = useState<number | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: categories = [] } = useQuery(orpc.categories.list.queryOptions());

  const createMutation = useMutation(
    orpc.podcasts.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.podcasts.adminList.queryOptions());
        toast.success("エピソードを作成しました");
        navigate({ to: "/admin/podcasts" });
      },
      onError: (err: { message?: string }) =>
        toast.error(err?.message ?? "エピソードの作成に失敗しました"),
    }),
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(
        value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .replace(/-+/g, "-")
          .slice(0, 100),
      );
    }
  };

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
    setAudioUrl("");
    setUploadProgress(null);

    // ブラウザ側で再生時間を取得
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
        setAudioUrl(data.url);
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
    if (!audioUrl) {
      toast.error("音声ファイルをアップロードしてください");
      return;
    }
    createMutation.mutate({
      title,
      slug,
      description,
      audioUrl,
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
        // NEW EPISODE
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
        新しいエピソードを作成
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
              onChange={(e) => handleTitleChange(e.target.value)}
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
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="my-episode-slug"
              pattern="[a-z0-9\-]+"
              title="小文字英数字とハイフンのみ"
              required
              className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
            />
          </div>

          {/* 説明 */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>説明（省略可）</label>
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="エピソードの説明"
              className="dark:!bg-neutral-700/50 dark:!text-neutral-100 dark:!border-pink-900/30"
            />
          </div>

          {/* 音声ファイルアップロード */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>音声ファイル * (.mp3 / .m4a)</label>
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
                  {audioFile ? audioFile.name : "ファイルを選択..."}
                </button>
              </div>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!audioFile || isUploading || !!audioUrl}
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "12px",
                  padding: "0.5rem 1.2rem",
                  border: "none",
                  borderRadius: "2px",
                  background:
                    !audioFile || isUploading || !!audioUrl
                      ? "rgba(200,0,90,0.3)"
                      : "var(--sc-cyber)",
                  color: "#fff",
                  cursor:
                    !audioFile || isUploading || !!audioUrl
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {isUploading ? "アップロード中..." : audioUrl ? "完了" : "アップロード"}
              </button>
            </div>

            {/* プログレスバー */}
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
                      background: audioUrl ? "var(--sc-sakura)" : "var(--sc-cyber)",
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
                  {audioUrl
                    ? `✓ アップロード完了${audioDuration !== null ? `　再生時間: ${Math.floor(audioDuration / 60)}分${audioDuration % 60}秒` : ""}`
                    : `${uploadProgress}%`}
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
                        background: checked
                          ? "rgba(200,0,90,0.08)"
                          : "transparent",
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
              作成と同時に公開する
            </label>
          </div>
        </div>

        {/* 送信ボタン */}
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
            disabled={createMutation.isPending}
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "12px",
              padding: "0.6rem 1.8rem",
              border: "none",
              borderRadius: "2px",
              background: createMutation.isPending
                ? "rgba(200,0,90,0.4)"
                : "var(--sc-sakura)",
              color: "#fff",
              cursor: createMutation.isPending ? "not-allowed" : "pointer",
              fontWeight: 700,
              boxShadow: "0 2px 12px rgba(200,0,90,0.3)",
            }}
          >
            {createMutation.isPending ? "作成中..." : "エピソードを作成"}
          </button>
        </div>
      </form>
    </div>
  );
}
