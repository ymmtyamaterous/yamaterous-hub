import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { WorkForm, type WorkFormValues } from "@/components/work-form";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/works/new")({
  component: NewWorkPage,
});

function NewWorkPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    orpc.works.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.works.adminList.queryOptions());
        toast.success("作品を追加しました");
        navigate({ to: "/admin/works" });
      },
      onError: () => toast.error("作品の追加に失敗しました"),
    }),
  );

  const handleSubmit = async (values: WorkFormValues) => {
    await createMutation.mutateAsync({
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
        // NEW WORK
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
        新しい作品を追加
      </h1>
      <WorkForm
        onSubmit={handleSubmit}
        submitLabel="作品を追加"
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
