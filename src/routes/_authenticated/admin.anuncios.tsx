import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListAds, upsertAd, deleteAd } from "@/lib/admin.functions";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, Save, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/anuncios")({
  component: AdsPage,
});

const POSITIONS = [
  "home-after-hero",
  "home-mid",
  "home-before-footer",
  "category-top",
  "article-after-intro",
  "article-mid",
  "article-before-related",
  "sidebar",
];

type AdForm = {
  id?: string;
  name: string;
  position: string;
  device: string;
  code: string;
  is_active: boolean;
};

const emptyForm: AdForm = {
  name: "",
  position: POSITIONS[0],
  device: "all",
  code: "",
  is_active: true,
};

function AdsPage() {
  const listFn = useServerFn(adminListAds);
  const upFn = useServerFn(upsertAd);
  const delFn = useServerFn(deleteAd);
  const qc = useQueryClient();

  const { data: ads, isLoading } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: () => listFn(),
  });

  const [form, setForm] = useState<AdForm>(emptyForm);

  const isEditing = Boolean(form.id);

  function resetForm() {
    setForm(emptyForm);
  }

  function handleEdit(ad: any) {
    setForm({
      id: ad.id,
      name: ad.name || "",
      position: ad.position || POSITIONS[0],
      device: ad.device || "all",
      code: ad.code || "",
      is_active: Boolean(ad.is_active),
    });

    setTimeout(() => {
      document.getElementById("ad-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload: AdForm = {
      ...form,
      name: form.name.trim(),
      code: form.code.trim(),
      device: form.device || "all",
    };

    if (!payload.name) {
      toast.error("Informe o nome interno do bloco.");
      return;
    }

    if (!payload.position) {
      toast.error("Selecione uma posição.");
      return;
    }

    if (!payload.code) {
      toast.error("Cole o código do bloco de anúncio.");
      return;
    }

    try {
      await upFn({ data: payload });

      toast.success(
        isEditing
          ? "Bloco de anúncio atualizado com sucesso."
          : "Bloco de anúncio criado com sucesso."
      );

      resetForm();

      await qc.invalidateQueries({ queryKey: ["admin-ads"] });
      await qc.invalidateQueries({ queryKey: ["ad-slot"] });
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar o bloco de anúncio.");
    }
  }

  async function handleDelete(ad: any) {
    const confirmed = confirm(
      `Excluir o bloco "${ad.name}"? Essa ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    try {
      await delFn({ data: { id: ad.id } });

      toast.success("Bloco de anúncio excluído.");

      if (form.id === ad.id) {
        resetForm();
      }

      await qc.invalidateQueries({ queryKey: ["admin-ads"] });
      await qc.invalidateQueries({ queryKey: ["ad-slot"] });
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir o bloco de anúncio.");
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">
        Anúncios Adsterra
      </h1>

      <section className="mt-6">
        <h2 className="font-display text-xl font-bold">
          Blocos de anúncio
        </h2>

        <p className="text-sm text-muted-foreground">
          Posições disponíveis: {POSITIONS.join(", ")}.
        </p>

        <form
          id="ad-form"
          onSubmit={handleSubmit}
          className="mt-3 grid gap-2 rounded-lg border border-border bg-card p-4 sm:grid-cols-2"
        >
          {isEditing && (
            <div className="sm:col-span-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
              Editando bloco: <strong>{form.name}</strong>
            </div>
          )}

          <input
            required
            placeholder="Nome interno"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className={inputCls}
          />

          <select
            value={form.position}
            onChange={(e) =>
              setForm({
                ...form,
                position: e.target.value,
              })
            }
            className={inputCls}
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <textarea
            required
            placeholder='Cole aqui o código completo da Adsterra: <script async="async" data-cfasync="false" src="..."></script><div id="container-..."></div>'
            value={form.code}
            onChange={(e) =>
              setForm({
                ...form,
                code: e.target.value,
              })
            }
            rows={6}
            className={textareaCls}
          />

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({
                    ...form,
                    is_active: e.target.checked,
                  })
                }
              />
              Ativo
            </label>

            <select
              value={form.device}
              onChange={(e) =>
                setForm({
                  ...form,
                  device: e.target.value,
                })
              }
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos os dispositivos</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
            )}

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  Salvar alterações
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Criar bloco
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 space-y-3">
          {isLoading && (
            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              Carregando blocos de anúncio...
            </div>
          )}

          {!isLoading && ads?.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              Nenhum bloco de anúncio cadastrado ainda.
            </div>
          )}

          {ads?.map((a: any) => (
            <div
              key={a.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold">
                  {a.name}{" "}
                  <span className="text-xs text-muted-foreground">
                    [{a.position}]
                  </span>
                </p>

                <p className="text-xs text-muted-foreground">
                  {a.is_active ? "Ativo" : "Inativo"} · {a.device || "all"}
                </p>
              </div>

              <div className="flex shrink-0 items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(a)}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-primary bg-primary/10 px-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
                  title="Editar bloco"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(a)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  title="Excluir bloco"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";


const textareaCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring sm:col-span-2";
