"use client";

import React, { useState } from "react";
import { Product, ProductViewMode, ProductFormData } from "@/lib/product-types";
import { ProductTable } from "@/features/products/components/ProductTable";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductModal } from "@/features/products/components/ProductModal";
import { ProductsToolbar } from "@/features/products/components/ProductsToolbar";
import { useAsyncData } from "@/hooks/use-async-data";
import { useToast } from "@/components/toast/use-toast";
import { toastApiError } from "@/components/toast/toast-utils";
import { categoriesApi, mapProductToUI, productsApi } from "@/lib/api";

export default function ProductsPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsyncData(
    async () => {
      const [apiProducts, apiCategories] = await Promise.all([
        productsApi.getProducts(),
        categoriesApi.getCategories(),
      ]);
      return {
        products: apiProducts.map(mapProductToUI),
        categories: apiCategories.map((c) => ({ id: c.id, name: c.name })),
      };
    },
    [],
    { toastOnError: true }
  );

  const products = data?.products ?? [];
  const categories = data?.categories ?? [];

  const [viewMode, setViewMode] = useState<ProductViewMode>("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const handleToggleActive = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    try {
      await productsApi.updateProduct(id, { isActive: !product.active });
      toast.success(`"${product.name}" ${product.active ? "deactivated" : "activated"}`);
      reload();
    } catch (err) {
      toastApiError(toast, err);
    }
  };

  const handleDelete = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productsApi.deleteProduct(id);
      toast.success(`"${product?.name ?? "Product"}" deleted`);
      reload();
    } catch (err) {
      toastApiError(toast, err);
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleNewClick = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productForm: ProductFormData) => {
    setSaving(true);
    try {
      const payload = {
        name: productForm.name,
        categoryId: productForm.categoryId,
        price: productForm.price,
        unitOfMeasure: productForm.uom,
        taxRate: parseFloat(productForm.tax) || 0,
        isActive: productForm.active,
      };
      if (productForm.id) {
        await productsApi.updateProduct(productForm.id, payload);
        toast.success(`"${productForm.name}" updated`);
      } else {
        await productsApi.createProduct(payload);
        toast.success(`"${productForm.name}" created`);
      }
      setIsModalOpen(false);
      reload();
    } catch (err) {
      toastApiError(toast, err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto font-sans">
      {error && (
        <div className="flex items-center justify-between bg-danger/10 text-danger rounded-[12px] px-4 py-3 text-[13px] font-semibold">
          <span>{error}</span>
          <button type="button" onClick={reload} className="underline">Retry</button>
        </div>
      )}

      <ProductsToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewProduct={handleNewClick}
      />

      <section key={viewMode} className="mt-1">
        {loading ? (
          <div className="text-center py-16 text-text-muted">Loading products...</div>
        ) : viewMode === "grid" ? (
          <ProductGrid
            products={products}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        ) : (
          <ProductTable
            products={products}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        )}
      </section>

      {isModalOpen && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => !saving && setIsModalOpen(false)}
          onSave={handleSaveProduct}
          product={selectedProduct}
          categories={categories}
        />
      )}
    </div>
  );
}
