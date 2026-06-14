"use client";

import React, { useState, useEffect } from "react";
import { X, Search, Package, DollarSign, TrendingUp, Pencil, ChevronRight, Plus } from "lucide-react";
import { Category } from "./types";
import { PRODUCTS_BY_CATEGORY, Product } from "./categoryProducts";
import { ProductModal, ProductAvatar } from "./ProductModal";

interface CategoryDetailDrawerProps {
  category: Category;
  onClose: () => void;
  onEdit: (cat: Category) => void;
}

let pIdCounter = 1000;
const newPId = () => `np-${pIdCounter++}`;

export function CategoryDetailDrawer({ category, onClose, onEdit }: CategoryDetailDrawerProps) {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<"all" | "Active" | "Inactive">("all");
  const [visible, setVisible] = useState(false);

  // local product state — initialised from seed, mutable within the session
  const [products, setProducts] = useState<Product[]>(
    () => PRODUCTS_BY_CATEGORY[category.id] ?? []
  );

  // product modal state
  const [productModal, setProductModal] = useState<{
    mode: "add" | "edit";
    product: Product | null;
  } | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  // animate-in
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 280); };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const handleSaveProduct = (data: Omit<Product, "id">) => {
    if (productModal?.mode === "add") {
      setProducts(prev => [...prev, { id: newPId(), ...data }]);
      showToast(`"${data.name}" added`);
    } else if (productModal?.mode === "edit" && productModal.product) {
      const id = productModal.product.id;
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
      showToast(`"${data.name}" updated`);
    }
    setProductModal(null);
  };

  const handleDeleteProduct = () => {
    if (!productModal?.product) return;
    const name = productModal.product.name;
    setProducts(prev => prev.filter(p => p.id !== productModal.product!.id));
    setProductModal(null);
    showToast(`"${name}" deleted`);
  };

  // ── derived ───────────────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const activeCount   = products.filter(p => p.status === "Active").length;
  const inactiveCount = products.filter(p => p.status === "Inactive").length;
  const avgPrice      = products.length
    ? (products.reduce((s, p) => s + p.price, 0) / products.length).toFixed(2)
    : "0.00";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      />

      {/* Drawer panel */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-[520px] bg-background z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
        visible ? "translate-x-0" : "translate-x-full"
      }`}>

        {/* Colored top accent */}
        <div className="h-[6px] w-full shrink-0" style={{ backgroundColor: category.color }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom shrink-0 bg-surface theme-transition">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full text-[14px] font-bold text-white shadow-sm" style={{ backgroundColor: category.color }}>
              {category.name}
            </span>
            <span className="text-[13px] font-semibold text-text-muted">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setProductModal({ mode: "add", product: null })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-white text-[13px] font-bold transition-all hover:brightness-90"
              style={{ backgroundColor: category.color }}
            >
              <Plus size={13} strokeWidth={2.5} /> Add Product
            </button>
            <button
              onClick={() => onEdit(category)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-surface hover:bg-border-custom/30 text-text-body text-[13px] font-semibold transition-colors theme-transition"
            >
              <Pencil size={13} className="text-primary" /> Edit
            </button>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-[12px] flex items-center justify-center bg-surface hover:bg-border-custom/30 text-text-muted hover:text-text-heading transition-colors theme-transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-3 px-6 py-4 shrink-0 border-b border-border-custom bg-surface theme-transition">
          {[
            { icon: Package,    label: "Total",     value: String(products.length), color: category.color },
            { icon: TrendingUp, label: "Active",    value: String(activeCount),     color: "var(--success)"      },
            { icon: DollarSign, label: "Avg Price", value: `$${avgPrice}`,          color: "var(--primary)"      },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-surface rounded-[14px] p-3 flex flex-col gap-1 theme-transition">
                <div className="flex items-center gap-1.5">
                  <Icon size={13} style={{ color: s.color }} />
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{s.label}</span>
                </div>
                <span className="text-[20px] font-bold text-text-heading leading-none">{s.value}</span>
              </div>
            );
          })}
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-3 px-6 py-4 shrink-0 border-b border-border-custom">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full bg-surface border border-border-custom rounded-[11px] pl-8 pr-3 py-2 text-[13px] font-medium text-text-heading placeholder:text-text-muted outline-none focus:border-primary transition-colors theme-transition"
            />
          </div>
          <div className="flex bg-surface rounded-[11px] p-0.5 gap-0.5 theme-transition">
            {(["all", "Active", "Inactive"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1.5 rounded-[9px] text-[12px] font-semibold transition-all ${
                  filter === f ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-body"
                }`}
              >
                {f === "all" ? `All (${products.length})` : f === "Active" ? `✓ ${activeCount}` : `— ${inactiveCount}`}
              </button>
            ))}
          </div>
        </div>

        {/* Products list */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-muted gap-3">
              <span className="text-3xl">📦</span>
              <p className="text-[14px] font-bold text-text-heading">
                {search ? "No products match your search" : "No products yet"}
              </p>
              <p className="text-[12px]">
                {search ? "Try a different term" : "Click \u201cAdd Product\u201d to get started"}
              </p>
              {!search && (
                <button
                  onClick={() => setProductModal({ mode: "add", product: null })}
                  className="mt-1 flex items-center gap-2 text-white text-[13px] font-bold px-4 py-2.5 rounded-[12px] transition-all hover:brightness-90"
                  style={{ backgroundColor: category.color }}
                >
                  <Plus size={14} /> Add Product
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map(product => (
                <div
                  key={product.id}
                  onClick={() => setProductModal({ mode: "edit", product })}
                  className="bg-surface border border-border-custom rounded-[16px] p-4 flex items-center gap-4 hover:border-primary hover:-translate-y-0.5 transition-all duration-150 group cursor-pointer theme-transition"
                >
                  {/* Avatar */}
                  <ProductAvatar
                    image={product.image}
                    name={product.name}
                    categoryColor={category.color}
                    size={44}
                    fontSize={18}
                    radius={12}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-bold text-text-heading truncate">{product.name}</p>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        product.status === "Active"
                          ? "bg-success/10 text-success"
                          : "bg-surface text-text-muted"
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-text-muted font-medium mt-0.5 truncate">{product.description || "—"}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-text-muted bg-surface px-2 py-0.5 rounded-full theme-transition">
                        {product.unitOfMeasure}
                      </span>
                      <span className="text-[11px] font-semibold text-text-muted">
                        Tax {product.tax}%
                      </span>
                    </div>
                  </div>

                  {/* Price + arrow */}
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="text-[16px] font-bold text-text-heading">
                      ${product.price.toFixed(2)}
                    </p>
                    <ChevronRight size={14} className="text-border-custom group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-custom shrink-0 bg-surface flex items-center justify-between theme-transition">
          <span className="text-[12px] font-semibold text-text-muted">
            Showing <span className="text-text-heading font-bold">{filtered.length}</span> of{" "}
            <span className="text-text-heading font-bold">{products.length}</span> products
          </span>
          <span
            className="px-3 py-1 rounded-full text-white text-[11px] font-bold"
            style={{ backgroundColor: category.color }}
          >
            {category.revenue} revenue
          </span>
        </div>
      </div>

      {/* Product Add / Edit Modal */}
      {productModal && (
        <ProductModal
          mode={productModal.mode}
          initial={productModal.product}
          categoryColor={category.color}
          categoryName={category.name}
          onSave={handleSaveProduct}
          onDelete={productModal.mode === "edit" ? handleDeleteProduct : undefined}
          onClose={() => setProductModal(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-text-heading text-white text-[13px] font-semibold px-5 py-3 rounded-full shadow-xl flex items-center gap-2 animate-fade-in">
          <span style={{ color: category.color }}>✓</span> {toast}
        </div>
      )}
    </>
  );
}
