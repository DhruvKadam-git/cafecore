"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, Search, Tag, Package, TrendingUp, Layers } from "lucide-react";
import { Category } from "@/features/categories/components/types";
import { CategoryCard } from "@/features/categories/components/CategoryCard";
import { CategoryModal } from "@/features/categories/components/CategoryModal";
import { DeleteConfirmModal } from "@/features/categories/components/DeleteConfirmModal";
import { CategoryDetailDrawer } from "@/features/categories/components/CategoryDetailDrawer";

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_CATEGORIES: Category[] = [
  { id: "1", name: "Espresso",   color: "#C9783A", image: null, productCount: 8,  revenue: "$2,958", createdAt: "Jan 12, 2026" },
  { id: "2", name: "Cold Brew",  color: "#5B8FA8", image: null, productCount: 5,  revenue: "$1,690", createdAt: "Jan 14, 2026" },
  { id: "3", name: "Pastries",   color: "#D6A144", image: null, productCount: 11, revenue: "$1,521", createdAt: "Jan 15, 2026" },
  { id: "4", name: "Sandwiches", color: "#789658", image: null, productCount: 7,  revenue: "$1,268", createdAt: "Feb 2, 2026"  },
  { id: "5", name: "Tea",        color: "#9B6A9B", image: null, productCount: 6,  revenue: "$1,014", createdAt: "Feb 10, 2026" },
  { id: "6", name: "Drinks",     color: "#4A7C8A", image: null, productCount: 9,  revenue: "$876",   createdAt: "Mar 1, 2026"  },
  { id: "7", name: "Snacks",     color: "#D55C4C", image: null, productCount: 4,  revenue: "$543",   createdAt: "Mar 18, 2026" },
  { id: "8", name: "Seasonal",   color: "#866443", image: null, productCount: 3,  revenue: "$321",   createdAt: "Apr 5, 2026"  },
];

type SortKey = "name" | "products" | "revenue";

let idCounter = SEED_CATEGORIES.length + 1;
const newId = () => String(idCounter++);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [categories, setCategories]   = useState<Category[]>([]);
  const [search, setSearch]           = useState("");
  const [sort, setSort]               = useState<SortKey>("name");
  const [modal, setModal]             = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget]   = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [viewTarget, setViewTarget]   = useState<Category | null>(null);
  const [toast, setToast]             = useState<string | null>(null);
  const [token, setToken]             = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);

  // Auto-login to obtain JWT token
  useEffect(() => {
    async function autoLogin() {
      try {
        const response = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "admin@cafe.com",
            password: "Admin@123",
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setToken(data.accessToken);
        }
      } catch (err) {
        console.error("Categories auto-login error:", err);
      }
    }
    autoLogin();
  }, []);

  const refreshData = async (jwt: string) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${jwt}` };
      const [catsRes, productsRes, reportRes] = await Promise.all([
        fetch("http://localhost:3000/categories?limit=100", { headers }),
        fetch("http://localhost:3000/products?limit=100", { headers }),
        fetch("http://localhost:3000/reports/categories?startDate=2026-01-01&endDate=2026-12-31", { headers }),
      ]);

      if (catsRes.ok && productsRes.ok && reportRes.ok) {
        const catsData = await catsRes.json();
        const productsData = await productsRes.json();
        const reportData = await reportRes.json();

        const activeCats = catsData.data || [];
        const activeProds = productsData.data || [];
        const reportCats = reportData.categories || [];

        const mapped: Category[] = activeCats.map((cat: any) => {
          const productCount = activeProds.filter((p: any) => p.categoryId === cat.id).length;
          const matchedReport = reportCats.find((c: any) => c.name.toLowerCase() === cat.name.toLowerCase());
          const revenueValue = matchedReport ? matchedReport.revenue : 0;
          
          const date = new Date(cat.createdAt);
          const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

          return {
            id: cat.id,
            name: cat.name,
            color: cat.color || "#4A7C8A",
            image: cat.imageUrl 
              ? (cat.imageUrl.startsWith("http") ? cat.imageUrl : `http://localhost:3000${cat.imageUrl}`)
              : null,
            productCount,
            revenue: `$${revenueValue.toLocaleString()}`,
            createdAt: formattedDate,
          };
        });

        setCategories(mapped);
      }
    } catch (err) {
      console.error("Error fetching categories data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshData(token);
    }
  }, [token]);

  // ── helpers ─────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const openAdd  = () => { setEditTarget(null); setModal("add"); };
  const openEdit = (cat: Category) => { setEditTarget(cat); setModal("edit"); setViewTarget(null); };
  const closeModal = () => { setModal(null); setEditTarget(null); };

  const handleSave = async (data: { name: string; color: string; image: string | null; imageFile: File | null }) => {
    if (!token) return;
    try {
      let imageUrl = data.image ? (data.image.startsWith("http") ? data.image.replace("http://localhost:3000", "") : data.image) : null;

      if (data.imageFile) {
        const formData = new FormData();
        formData.append("image", data.imageFile);

        const uploadRes = await fetch("http://localhost:3000/categories/upload-image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.imageUrl;
        } else {
          console.error("Failed to upload category image");
        }
      }

      if (modal === "add") {
        const response = await fetch("http://localhost:3000/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: data.name,
            color: data.color,
            imageUrl: imageUrl || undefined,
          }),
        });

        if (response.ok) {
          showToast(`"${data.name}" category created`);
          refreshData(token);
        } else {
          const errData = await response.json();
          showToast(`Error: ${errData.message || "Failed to create category"}`);
        }
      } else if (modal === "edit" && editTarget) {
        const response = await fetch(`http://localhost:3000/categories/${editTarget.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: data.name,
            color: data.color,
            imageUrl: imageUrl,
          }),
        });

        if (response.ok) {
          showToast(`"${data.name}" updated`);
          refreshData(token);
        } else {
          const errData = await response.json();
          showToast(`Error: ${errData.message || "Failed to update category"}`);
        }
      }
    } catch (err) {
      console.error("Error saving category:", err);
      showToast("Error saving category");
    }
    closeModal();
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    try {
      const response = await fetch(`http://localhost:3000/categories/${deleteTarget.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showToast(`"${deleteTarget.name}" deleted`);
        refreshData(token);
      } else {
        const errData = await response.json();
        showToast(`Error: ${errData.message || "Failed to delete category"}`);
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      showToast("Error deleting category");
    }
    setDeleteTarget(null);
  };

  // ── derived data ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = categories.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === "name")     list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "products") list = [...list].sort((a, b) => b.productCount - a.productCount);
    if (sort === "revenue")  list = [...list].sort((a, b) => {
      const n = (s: string) => parseFloat(s.replace(/[$,k]/g, "")) * (s.includes("k") ? 1000 : 1);
      return n(b.revenue) - n(a.revenue);
    });
    return list;
  }, [categories, search, sort]);

  const totalProducts = categories.reduce((s, c) => s + c.productCount, 0);

  const stats = [
    { label: "Total Categories", value: String(categories.length), icon: Tag,       theme: "orange" as const },
    { label: "Total Products",   value: String(totalProducts),     icon: Package,   theme: "brown"  as const },
    { label: "Top Category",     value: [...categories].sort((a,b)=>b.productCount-a.productCount)[0]?.name ?? "—",
                                                                    icon: TrendingUp,theme: "gold"   as const },
    { label: "Avg Products",     value: categories.length ? String(Math.round(totalProducts / categories.length)) : "0",
                                                                    icon: Layers,    theme: "green"  as const },
  ];

  const iconThemeMap = {
    orange: { bg: "bg-primary/10", text: "text-primary" },
    brown:  { bg: "bg-sidebar-bg/10", text: "text-sidebar-bg" },
    gold:   { bg: "bg-gold/10", text: "text-gold" },
    green:  { bg: "bg-success/10", text: "text-success" },
  };

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto">

      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[13px] text-text-muted">
            {categories.length} categories · colors appear everywhere in the POS
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary hover:brightness-105 text-white text-[14px] font-bold px-5 py-2.5 rounded-[14px] transition-all hover:-translate-y-0.5 shadow-sm active:scale-[0.97]"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Category
        </button>
      </div>

      {/* ── Stat cards ── */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => {
          const theme = iconThemeMap[s.theme];
          const Icon  = s.icon;
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

      {/* ── Search + Sort bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[340px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="w-full bg-surface border border-border-custom rounded-[12px] pl-9 pr-4 py-2.5 text-[14px] font-medium text-text-heading placeholder:text-text-muted outline-none focus:border-primary transition-colors theme-transition"
          />
        </div>

        {/* Sort */}
        <div className="flex bg-surface rounded-[13px] p-1 gap-1 ml-auto theme-transition">
          {(["name", "products", "revenue"] as SortKey[]).map(key => (
            <button
              type="button"
              key={key}
              onClick={() => setSort(key)}
              className={`px-3.5 py-1.5 rounded-[10px] text-[13px] font-semibold transition-all capitalize ${
                sort === key
                  ? "bg-white text-primary shadow-sm"
                  : "text-text-muted hover:text-text-body"
              }`}
            >
              {key === "products" ? "Products ↓" : key === "revenue" ? "Revenue ↓" : "A → Z"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category cards grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted gap-3">
          <div className="w-16 h-16 rounded-[20px] bg-surface flex items-center justify-center theme-transition">
            <Tag size={28} className="text-border-custom" />
          </div>
          <p className="text-[15px] font-bold text-text-heading">
            {search ? "No categories match your search" : "No categories yet"}
          </p>
          <p className="text-[13px]">
            {search ? "Try a different name" : "Click \u201cNew Category\u201d to get started"}
          </p>
          {!search && (
            <button
              type="button"
              onClick={openAdd}
              className="mt-2 flex items-center gap-2 bg-primary hover:brightness-105 text-white text-[14px] font-bold px-5 py-2.5 rounded-[14px] transition-colors"
            >
              <Plus size={15} /> New Category
            </button>
          )}
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* Add-new shortcut card */}
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

          {filtered.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onView={setViewTarget}
              onEdit={openEdit}
              onDelete={id => {
                const found = categories.find(c => c.id === id);
                if (found) setDeleteTarget(found);
              }}
            />
          ))}
        </section>
      )}

      {/* ── Color legend strip ── */}
      {categories.length > 0 && (
        <div className="bg-surface border border-border-custom rounded-[18px] px-5 py-4 theme-transition">
          <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-3">
            All Category Colors
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <div key={c.id} className="flex items-center gap-2 bg-surface rounded-full px-3 py-1.5 theme-transition">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-[12px] font-semibold text-text-body">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {(modal === "add" || modal === "edit") && (
        <CategoryModal
          mode={modal}
          initial={editTarget}
          existingNames={categories.map(c => c.name)}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          categoryName={deleteTarget.name}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Category detail drawer ── */}
      {viewTarget && (
        <CategoryDetailDrawer
          category={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={cat => { setViewTarget(null); openEdit(cat); }}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-text-heading text-white text-[13px] font-semibold px-5 py-3 rounded-full shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="text-primary">✓</span> {toast}
        </div>
      )}
    </div>
  );
}
