import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { upsertPost, adminListCategories } from "@/lib/admin.functions";
import { PostForm } from "@/components/admin/PostForm";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/posts/nova")({
  component: NewPost,
});

function NewPost() {
  const navigate = useNavigate();
  const upsert = useServerFn(upsertPost);
  const catsFn = useServerFn(adminListCategories);
  const { data: categories } = useQuery({ queryKey: ["admin-categories"], queryFn: () => catsFn() });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Nova receita</h1>
      <PostForm
        categories={categories ?? []}
        onSubmit={async (values) => {
          try {
            const r = await upsert({ data: values });
            toast.success("Receita criada");
            navigate({ to: "/admin/posts/$id", params: { id: r.id } });
          } catch (e: any) { toast.error(e.message); }
        }}
      />
    </div>
  );
}
