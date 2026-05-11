import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { GripVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/works/")({
  component: AdminWorksPage,
});

type Work = {
  id: string;
  title: string;
  isPublished: boolean;
  sortOrder: number;
  tags: { id: string; name: string }[];
};

function SortableWorkRow({
  work,
  isDragging,
  isSorting,
  onToggle,
  onDelete,
}: {
  work: Work;
  isDragging: boolean;
  isSorting: boolean;
  onToggle: (id: string, isPublished: boolean) => void;
  onDelete: (id: string, title: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: work.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "rgba(200,0,90,0.04)" : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={{ ...style, borderBottom: "1px solid rgba(200,0,90,0.06)" }}
    >
      {/* ドラッグハンドル */}
      <td style={{ padding: "0.75rem 0.5rem 0.75rem 1rem", width: "36px" }}>
        <button
          type="button"
          {...attributes}
          {...listeners}
          style={{
            display: "flex",
            alignItems: "center",
            cursor: isSorting ? "not-allowed" : "grab",
            color: "var(--sc-muted)",
            background: "none",
            border: "none",
            padding: "2px",
            opacity: isSorting ? 0.3 : 1,
          }}
          disabled={isSorting}
          title={isSorting ? "フィルター中は並び替えできません" : "ドラッグで並び替え"}
        >
          <GripVertical size={16} />
        </button>
      </td>
      <td
        style={{
          padding: "0.75rem 1rem",
          fontFamily: "var(--sc-font-jp)",
          fontSize: "14px",
          color: "var(--sc-text)",
        }}
        className="dark:!text-neutral-200"
      >
        <div>{work.title}</div>
        {work.tags.length > 0 && (
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginTop: "0.3rem" }}>
            {work.tags.map((t) => (
              <span
                key={t.id}
                style={{
                  fontFamily: "var(--sc-font-mono)",
                  fontSize: "10px",
                  padding: "1px 6px",
                  borderRadius: "2px",
                  background: "rgba(0,180,180,0.1)",
                  color: "var(--sc-cyber)",
                  border: "1px solid rgba(0,180,180,0.2)",
                }}
              >
                {t.name}
              </span>
            ))}
          </div>
        )}
      </td>
      <td style={{ padding: "0.75rem 1rem" }}>
        <button
          type="button"
          onClick={() => onToggle(work.id, !work.isPublished)}
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "11px",
            padding: "2px 10px",
            borderRadius: "2px",
            border: "none",
            cursor: "pointer",
            color: work.isPublished ? "#fff" : "var(--sc-muted)",
            background: work.isPublished ? "var(--sc-sakura)" : "rgba(0,0,0,0.06)",
            transition: "all 0.15s",
          }}
        >
          {work.isPublished ? "公開中" : "非公開"}
        </button>
      </td>
      <td
        style={{
          padding: "0.75rem 1rem",
          fontFamily: "var(--sc-font-mono)",
          fontSize: "13px",
          color: "var(--sc-muted)",
        }}
        className="dark:!text-neutral-400"
      >
        {work.sortOrder}
      </td>
      <td style={{ padding: "0.75rem 1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link
            to="/admin/works/$workId/edit"
            params={{ workId: work.id }}
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "11px",
              letterSpacing: "0.06em",
              color: "var(--sc-cyber)",
              textDecoration: "none",
              padding: "3px 10px",
              border: "1px solid var(--sc-cyber)",
              borderRadius: "2px",
            }}
            className="hover:!bg-blue-50"
          >
            編集
          </Link>
          <button
            type="button"
            onClick={() => onDelete(work.id, work.title)}
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "11px",
              letterSpacing: "0.06em",
              color: "var(--sc-cyber3)",
              background: "transparent",
              border: "1px solid var(--sc-cyber3)",
              borderRadius: "2px",
              padding: "3px 10px",
              cursor: "pointer",
            }}
            className="hover:!bg-red-50"
          >
            削除
          </button>
        </div>
      </td>
    </tr>
  );
}

function AdminWorksPage() {
  const queryClient = useQueryClient();
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(undefined);
  const [localWorks, setLocalWorks] = useState<Work[] | null>(null);

  const { data: fetchedWorks = [], isLoading } = useQuery(
    orpc.works.adminList.queryOptions({ input: { tagId: selectedTagId } }),
  );
  const { data: tags = [] } = useQuery(orpc.tags.list.queryOptions());

  const works: Work[] = localWorks ?? fetchedWorks;

  const sensors = useSensors(useSensor(PointerSensor));

  const deleteMutation = useMutation(
    orpc.works.delete.mutationOptions({
      onSuccess: () => {
        setLocalWorks(null);
        queryClient.invalidateQueries(orpc.works.adminList.queryOptions());
        toast.success("作品を削除しました");
      },
      onError: () => toast.error("削除に失敗しました"),
    }),
  );

  const toggleMutation = useMutation(
    orpc.works.update.mutationOptions({
      onSuccess: () => {
        setLocalWorks(null);
        queryClient.invalidateQueries(orpc.works.adminList.queryOptions());
      },
      onError: () => toast.error("更新に失敗しました"),
    }),
  );

  const reorderMutation = useMutation(
    orpc.works.reorder.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.works.adminList.queryOptions());
        toast.success("表示順を更新しました");
      },
      onError: () => {
        setLocalWorks(null);
        toast.error("並び替えに失敗しました");
      },
    }),
  );

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    deleteMutation.mutate({ id });
  };

  const handleToggle = (id: string, isPublished: boolean) => {
    toggleMutation.mutate({ id, isPublished });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = works.findIndex((w) => w.id === active.id);
    const newIndex = works.findIndex((w) => w.id === over.id);
    const reordered = arrayMove(works, oldIndex, newIndex);
    setLocalWorks(reordered);

    reorderMutation.mutate({
      updates: reordered.map((w, i) => ({ id: w.id, sortOrder: i + 1 })),
    });
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
        // CONTENT MANAGEMENT
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--sc-font-jp)",
            fontWeight: 900,
            fontSize: "1.8rem",
            color: "var(--sc-text)",
          }}
          className="dark:!text-neutral-100"
        >
          作品管理
        </h1>
        <Link
          to="/admin/works/new"
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "12px",
            letterSpacing: "0.1em",
            color: "#fff",
            background: "var(--sc-sakura)",
            padding: "0.5rem 1.2rem",
            borderRadius: "2px",
            textDecoration: "none",
            fontWeight: 700,
            boxShadow: "0 2px 12px rgba(200,0,90,0.3)",
          }}
        >
          + 新しい作品を追加
        </Link>
      </div>

      {/* タグフィルター */}
      {tags.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <button
            type="button"
            onClick={() => { setSelectedTagId(undefined); setLocalWorks(null); }}
            style={{
              fontFamily: "var(--sc-font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              padding: "0.3rem 0.8rem",
              borderRadius: "2px",
              border: `1px solid ${selectedTagId === undefined ? "var(--sc-sakura)" : "rgba(200,0,90,0.2)"}`,
              background: selectedTagId === undefined ? "var(--sc-sakura)" : "transparent",
              color: selectedTagId === undefined ? "#fff" : "var(--sc-muted)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            すべて
          </button>
          {tags.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setSelectedTagId(t.id === selectedTagId ? undefined : t.id); setLocalWorks(null); }}
              style={{
                fontFamily: "var(--sc-font-mono)",
                fontSize: "11px",
                letterSpacing: "0.08em",
                padding: "0.3rem 0.8rem",
                borderRadius: "2px",
                border: `1px solid ${selectedTagId === t.id ? "var(--sc-cyber)" : "rgba(200,0,90,0.2)"}`,
                background: selectedTagId === t.id ? "var(--sc-cyber)" : "transparent",
                color: selectedTagId === t.id ? "#fff" : "var(--sc-muted)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {selectedTagId && (
        <div
          style={{
            fontFamily: "var(--sc-font-mono)",
            fontSize: "11px",
            color: "var(--sc-cyber)",
            marginBottom: "0.75rem",
            letterSpacing: "0.06em",
          }}
        >
          ※ タグフィルター中は並び替えができません
        </div>
      )}

      <div
        style={{
          background: "rgba(253,246,239,0.9)",
          border: "1px solid rgba(200,0,90,0.12)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
        className="dark:!bg-neutral-800/80 dark:!border-pink-900/20"
      >
        {isLoading ? (
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
        ) : works.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              fontFamily: "var(--sc-font-mono)",
              fontSize: "13px",
              color: "var(--sc-muted)",
            }}
          >
            作品がまだありません
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid rgba(200,0,90,0.1)",
                    background: "rgba(200,0,90,0.03)",
                  }}
                >
                  {["", "タイトル", "状態", "表示順", "操作"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        fontFamily: "var(--sc-font-mono)",
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        color: "var(--sc-muted)",
                        fontWeight: 600,
                      }}
                      className="dark:!text-neutral-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <SortableContext
                  items={works.map((w) => w.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {works.map((w) => (
                    <SortableWorkRow
                      key={w.id}
                      work={w}
                      isDragging={false}
                      isSorting={!!selectedTagId}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        )}
      </div>
    </div>
  );
}
