import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { env } from "@better-t-app/env/web";

interface HeaderImageFieldProps {
  value: string;
  onChange: (value: string) => void;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

export function HeaderImageField({
  value,
  onChange,
  inputStyle,
  labelStyle,
}: HeaderImageFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${env.VITE_SERVER_URL}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error((error as { error?: string }).error ?? "Upload failed");
      }

      const data = (await response.json()) as { url: string };
      onChange(`${env.VITE_SERVER_URL}${data.url}`);
      toast.success("ヘッダー画像をアップロードしました");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "アップロードに失敗しました");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <label style={labelStyle}>ヘッダー画像（省略可）</label>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {value && (
          <div style={{ position: "relative", width: "100%", maxWidth: "360px" }}>
            <img
              src={value}
              alt="ヘッダー画像のプレビュー"
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
                border: "1px solid rgba(200,0,90,0.2)",
                borderRadius: "3px",
                display: "block",
              }}
            />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="ヘッダー画像を削除"
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                background: "rgba(200,0,90,0.85)",
                border: "none",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontFamily: "var(--sc-font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              padding: "0.4rem 0.85rem",
              border: "1px solid rgba(200,0,90,0.3)",
              borderRadius: "2px",
              background: "transparent",
              color: "var(--sc-sakura)",
              cursor: isUploading ? "not-allowed" : "pointer",
              opacity: isUploading ? 0.5 : 1,
            }}
          >
            <ImagePlus size={13} />
            {isUploading ? "アップロード中..." : "画像を選択"}
          </button>
          <span style={{ fontFamily: "var(--sc-font-mono)", fontSize: "10px", color: "var(--sc-muted)" }}>
            jpeg / png / gif / webp · 5MB以内
          </span>
        </div>
        <input
          style={{ ...inputStyle, fontSize: "12px" }}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type="url"
          placeholder="または画像URLを直接入力..."
        />
      </div>
    </div>
  );
}