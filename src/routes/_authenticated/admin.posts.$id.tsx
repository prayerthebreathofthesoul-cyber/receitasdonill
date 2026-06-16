import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { upsertPost, adminGetPost, adminListCategories } from "@/lib/admin.functions";
import { PostForm } from "@/components/admin/PostForm";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/posts/$id")({
  component: EditPost,
});

function EditPost() {
  const { id } = Route.useParams();
  const getFn = useServerFn(adminGetPost);
  const upsert = useServerFn(upsertPost);
  const catsFn = useServerFn(adminListCategories);

  const { data: post } = useQuery({ queryKey: ["admin-post", id], queryFn: () => getFn({ data: { id } }) });
  const { data: categories } = useQuery({ queryKey: ["admin-categories"], queryFn: () => catsFn() });

  if (!post) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Editar receita</h1>
      <PostForm
        initial={post as any}
        categories={categories ?? []}
        onSubmit={async (values) => {
          try {
            await upsert({ data: { ...values, id } });
            toast.success("Receita atualizada");
          } catch (e: any) { toast.error(e.message); }
        }}
      />
    </div>
  );
}
