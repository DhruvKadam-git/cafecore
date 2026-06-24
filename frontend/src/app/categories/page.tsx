"use client";

import React, { useState, useMemo } from "react";
import { Plus, Search, Tag, Package, TrendingUp, Layers } from "lucide-react";
import { Category } from "@/features/categories/components/types";
import { CategoryCard } from "@/features/categories/components/CategoryCard";
import { CategoryModal } from "@/features/categories/components/CategoryModal";
import { DeleteConfirmModal } from "@/features/categories/components/DeleteConfirmModal";
import { CategoryDetailDrawer } from "@/features/categories/components/CategoryDetailDrawer";
import { useAsyncData } from "@/hooks/use-async-data";
import { useToast } from "@/components/toast/use-toast";
import { toastApiError } from "@/components/toast/toast-utils";
import { categoriesApi, mapCategoryToUI, productsApi } from "@/lib/api";

type SortKey = "name" | "products" | "revenue";

export default function CategoriesPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsyncData(
    async () => {
      const [cats, products] = await Promise.all([
        categoriesApi.getCategories(),
        productsApi.getProducts(),
      ]);
      return cats.map((cat) => {
        const count = products.filter((p) => p.categoryId === cat.id || p.category?.id === cat.id).length;
        return mapCategoryToUI(cat, count);
      });
    },
    [],
    { toastOnError: true }
  );

  const categories = data ?? [];

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [viewTarget, setViewTarget] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditTarget(null); setModal("add"); };
  const openEdit = (cat: Category) => { setEditTarget(cat); setModal("edit"); setViewTarget(null); };
  const closeModal = () => { setModal(null); setEditTarget(null); };

  const handleSave = async (data: { name: string; color: string; image: string | null }) => {
    setSaving(true);
    try {
      const payload = { name: data.name, color: data.color };
      if (modal === "add") {
        await categoriesApi.createCategory(payload);
        toast.success(`"${data.name}" category created`);
      } else if (modal === "edit" && editTarget) {
        await categoriesApi.updateCategory(editTarget.id, payload);
        toast.success(`"${data.name}" updated`);
      }
      closeModal();
      reload();
    } catch (err) {
      toastApiError(toast, err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await categoriesApi.deleteCategory(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toastApiError(toast, err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    let list = categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "products") list = [...list].sort((a, b) => b.productCount - a.productCount);
    if (sort === "revenue") list = [...list].sort((a, b) => {
      const n = (s: string) => parseFloat(s.replace(/[$,k]/g, "")) * (s.includes("k") ? 1000 : 1);
      return n(b.revenue) - n(a.revenue);
    });
    return list;
  }, [categories, search, sort]);

  const totalProducts = categories.reduce((s, c) => s + c.productCount, 0);

  const stats = [
    { label: "Total Categories", value: String(categories.length), icon: Tag, theme: "orange" as const },
    { label: "Total Products", value: String(totalProducts), icon: Package, theme: "brown" as const },
    { label: "Top Category", value: [...categories].sort((a, b) => b.productCount - a.productCount)[0]?.name ?? "—", icon: TrendingUp, theme: "gold" as const },
    { label: "Avg Products", value: categories.length ? String(Math.round(totalProducts / categories.length)) : "0", icon: Layers, theme: "green" as const },
  ];

  const iconThemeMap = {
    orange: { bg: "bg-primary/10", text: "text-primary" },
    brown: { bg: "bg-sidebar-bg/10", text: "text-sidebar-bg" },
    gold: { bg: "bg-gold/10", text: "text-gold" },
    green: { bg: "bg-success/10", text: "text-success" },
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto">
      {error && (
        <div className="flex items-center justify-between bg-danger/10 text-danger rounded-[12px] px-4 py-3 text-[13px] font-semibold">
          <span>{error}</span>
          <button type="button" onClick={reload} className="underline">Retry</button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13px] text-text-muted">
          {categories.length} categories · colors appear everywhere in the POS
        </p>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary hover:brightness-105 text-white text-[14px] font-bold px-5 py-2.5 rounded-[14px] transition-all hover:-translate-y-0.5 shadow-sm active:scale-[0.97]"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Category
        </button>
      </div>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => {
          const theme = iconThemeMap[s.theme];
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-surface border border-border-custom rounded-[18px] p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] theme-transition"
            >
              <div className={`w-[48px] h-[48px] rounded-[14px] flex items-center justify-center shrink-0 ${theme.bg} ${theme.text}`}>
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{s.label}</p>
                <p className="text-[22px] font-bold text-text-heading leading-none mt-0.5">{s.value}</p>
              </div>
            </div>
          );
        })}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[340px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="w-full bg-surface border border-border-custom rounded-[12px] pl-9 pr-4 py-2.5 text-[14px] font-medium text-text-heading placeholder:text-text-muted outline-none focus:border-primary transition-colors theme-transition"
          />
        </div>
        <div className="flex bg-surface rounded-[13px] p-1 gap-1 ml-auto theme-transition">
          {(["name", "products", "revenue"] as SortKey[]).map((key) => (
            <button
              type="button"
              key={key}
              onClick={() => setSort(key)}
              className={`px-3.5 py-1.5 rounded-[10px] text-[13px] font-semibold transition-all capitalize ${
                sort === key ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-body"
              }`}
            >
              {key === "products" ? "Products ↓" : key === "revenue" ? "Revenue ↓" : "A → Z"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-text-muted">Loading categories...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted gap-3">
          <div className="w-16 h-16 rounded-[20px] bg-surface flex items-center justify-center theme-transition">
            <Tag size={28} className="text-border-custom" />
          </div>
          <p className="text-[15px] font-bold text-text-heading">
            {search ? "No categories match your search" : "No categories yet"}
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <button
            type="button"
            onClick={openAdd}
            className="bg-surface border-2 border-dashed border-border-custom rounded-[20px] flex flex-col items-center justify-center gap-3 min-h-[220px] hover:border-primary hover:bg-primary/10 transition-all duration-200 group theme-transition"
          >
            <div className="w-12 h-12 rounded-full bg-surface group-hover:bg-primary/10 flex items-center justify-center transition-colors theme-transition">
              <Plus size={22} className="text-text-muted group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[14px] font-bold text-text-muted group-hover:text-primary transition-colors">
              Add Category
            </span>
          </button>
          {filtered.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onView={setViewTarget}
              onEdit={openEdit}
              onDelete={(id) => {
                const found = categories.find((c) => c.id === id);
                if (found) setDeleteTarget(found);
              }}
            />
          ))}
        </section>
      )}

      {(modal === "add" || modal === "edit") && (
        <CategoryModal
          mode={modal}
          initial={editTarget}
          existingNames={categories.map((c) => c.name)}
          onSave={handleSave}
          onClose={() => !saving && closeModal()}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          categoryName={deleteTarget.name}
          onConfirm={handleDelete}
          onClose={() => !saving && setDeleteTarget(null)}
        />
      )}

      {viewTarget && (
        <CategoryDetailDrawer
          category={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={(cat) => { setViewTarget(null); openEdit(cat); }}
        />
      )}

    </div>
  );
}
