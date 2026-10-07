"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { SortableDataTable } from "@/components/admin/sortable-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AdminCharityRow } from "@/lib/admin/queries";
import {
  deleteCharityAction,
  saveCharityAction,
} from "@/lib/admin/charities-actions";

type AdminCharitiesPanelProps = {
  charities: AdminCharityRow[];
};

const emptyForm = {
  id: undefined as string | undefined,
  name: "",
  slug: "",
  description: "",
  imageUrls: "",
  isFeatured: false,
};

export function AdminCharitiesPanel({ charities }: AdminCharitiesPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminCharityRow | null>(null);

  function openCreate() {
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(row: AdminCharityRow) {
    setForm({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description ?? "",
      imageUrls: row.images.join("\n"),
      isFeatured: row.isFeatured,
    });
    setFormOpen(true);
  }

  function saveCharity() {
    startTransition(async () => {
      const result = await saveCharityAction({
        ...form,
        isFeatured: form.isFeatured,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setFormOpen(false);
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleteTarget) {
      return;
    }
    startTransition(async () => {
      const result = await deleteCharityAction({ charityId: deleteTarget.id });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4">
        <Button type="button" size="sm" onClick={openCreate}>
          Add charity
        </Button>
      </div>

      <SortableDataTable
        rows={charities}
        getRowId={(row) => row.id}
        emptyMessage="No charities yet."
        columns={[
          {
            id: "name",
            header: "Name",
            sortable: true,
            sortValue: (row) => row.name,
            cell: (row) => row.name,
          },
          {
            id: "slug",
            header: "Slug",
            sortable: true,
            sortValue: (row) => row.slug,
            cell: (row) => row.slug,
          },
          {
            id: "featured",
            header: "Featured",
            sortable: true,
            sortValue: (row) => (row.isFeatured ? 1 : 0),
            cell: (row) => (
              <StatusPill value={row.isFeatured ? "active" : "draft"} />
            ),
          },
          {
            id: "supporters",
            header: "Supporters",
            sortable: true,
            sortValue: (row) => row.supporterCount,
            cell: (row) => row.supporterCount,
          },
          {
            id: "media",
            header: "Media",
            sortable: true,
            sortValue: (row) => row.images.length,
            cell: (row) => `${row.images.length} image(s)`,
          },
          {
            id: "actions",
            header: "",
            cell: (row) => (
              <div className="flex gap-1">
                <Button type="button" size="sm" variant="secondary" onClick={() => openEdit(row)}>
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteTarget(row)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit charity" : "New charity"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              placeholder="slug-name"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
            <textarea
              className="min-h-24 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-navy"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
            <textarea
              className="min-h-20 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-navy"
              placeholder="Image URLs (one per line)"
              value={form.imageUrls}
              onChange={(e) =>
                setForm((f) => ({ ...f, imageUrls: e.target.value }))
              }
            />
            <label className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isFeatured: e.target.checked }))
                }
              />
              Featured on homepage
            </label>
            <Button type="button" disabled={isPending} onClick={saveCharity}>
              Save charity
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name ?? "charity"}?`}
        description="This permanently removes the charity. Members linked to it will block deletion."
        confirmLabel="Delete charity"
        pending={isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
