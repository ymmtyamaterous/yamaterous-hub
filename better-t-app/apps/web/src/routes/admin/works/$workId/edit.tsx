import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { ReleaseNoteManager } from "@/components/release-note-manager";
import { WorkForm, type WorkFormValues } from "@/components/work-form";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/works/$workId/edit")({
  component: EditWorkPage,
});

function EditWorkPage() {
  const { workId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: works = [] } = useQuery(orpc.works.adminList.queryOptions());
  const work = works.find((w) => w.id === workId);

  const updateMutation = useMutation(
    orpc.works.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.works.adminList.queryOptions());
        toast.success("作品を更新しました");
        navigate({ to: "/admin/works" });
      },
      onError: () => toast.error("更新に失敗しました"),
    }),
  );

  const handleSubmit = async (values: WorkFormValues) => {
    await updateMutation.mutateAsync({
      id: workId,
      title: values.title,
      description: values.description,
      thumbnailUrl: values.thumbnailUrl || null,
      siteUrl: values.siteUrl || null,
      repositoryUrl: values.repositoryUrl || null,
      isPublished: values.isPublished,
      sortOrder: values.sortOrder,
      tagIds: values.tagIds,
    });
  };

  if (!work) {
    return (
      <div
        style={{
          fontFamily: "var(--sc-font-mono)",
          color: "var(--sc-muted)",
        }}
      >
        作品が見つかりません
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
        // EDIT WORK
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
        作品を編集
      </h1>
      <WorkForm
        initialValues={{
          title: work.title,
          description: work.description,
          thumbnailUrl: work.thumbnailUrl ?? "",
          siteUrl: work.siteUrl ?? "",
          repositoryUrl: work.repositoryUrl ?? "",
          isPublished: work.isPublished,
          sortOrder: work.sortOrder,
          tagIds: work.tags.map((t) => t.id),
        }}
        onSubmit={handleSubmit}
        submitLabel="更新する"
        isSubmitting={updateMutation.isPending}
      />
      <ReleaseNoteManager workId={workId} />
    </div>
  );
}
