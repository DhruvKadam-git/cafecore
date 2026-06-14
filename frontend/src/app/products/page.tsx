"use client";

import React, { useState, useEffect } from "react";
import { Product, ProductViewMode, ProductFormData } from "@/lib/product-types";
import { ProductTable } from "@/features/products/components/ProductTable";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductModal } from "@/features/products/components/ProductModal";
import { ProductsToolbar } from "@/features/products/components/ProductsToolbar";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [viewMode, setViewMode] = useState<ProductViewMode>("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        console.error("Products auto-login error:", err);
      }
    }
    autoLogin();
  }, []);

  const refreshData = async (jwt: string) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${jwt}` };
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("http://localhost:3000/products?limit=100", { headers }),
        fetch("http://localhost:3000/categories?limit=100", { headers }),
      ]);

      if (productsRes.ok && categoriesRes.ok) {
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        const activeCategories = categoriesData.data || [];
        setCategories(activeCategories);

        const mapped: Product[] = (productsData.data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          category: p.category ? p.category.name : "Uncategorized",
          categoryId: p.categoryId,
          uom: p.unitOfMeasure || "Cup",
          tax: p.taxRate ? `${Number(p.taxRate)}%` : "8%",
          active: p.isActive,
          imageUrl: p.imageUrl 
            ? (p.imageUrl.startsWith("http") ? p.imageUrl : `http://localhost:3000${p.imageUrl}`)
            : "",
          sizes: ["Small", "Large"],
          defaultSize: "Small",
          color: p.category?.color, // support dynamic category color
        }));

        setProducts(mapped);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshData(token);
    }
  }, [token]);

  const handleToggleActive = async (id: string) => {
    if (!token) return;
    const prod = products.find((p) => p.id === id);
    if (!prod) return;

    try {
      const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !prod.active,
        }),
      });

      if (response.ok) {
        refreshData(token);
      } else {
        console.error("Failed to toggle product active status");
      }
    } catch (err) {
      console.error("Error toggling product status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`http://localhost:3000/products/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          refreshData(token);
        } else {
          console.error("Failed to delete product");
        }
      } catch (err) {
        console.error("Error deleting product:", err);
      }
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

  const handleViewModeChange = (mode: ProductViewMode) => {
    setViewMode(mode);
  };

  const handleSaveProduct = async (productForm: any) => {
    if (!token) return;
    try {
      let imageUrl = productForm.imageFile ? "" : (selectedProduct?.imageUrl || "");
      if (imageUrl.startsWith("http://localhost:3000")) {
        imageUrl = imageUrl.replace("http://localhost:3000", "");
      }

      if (productForm.imageFile) {
        const formData = new FormData();
        formData.append("image", productForm.imageFile);

        const uploadRes = await fetch("http://localhost:3000/products/upload-image", {
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
          console.error("Failed to upload product image");
        }
      }

      const taxRateValue = parseFloat(productForm.tax.replace("%", "")) || 0;

      if (productForm.id) {
        const response = await fetch(`http://localhost:3000/products/${productForm.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: productForm.name,
            price: productForm.price,
            unitOfMeasure: productForm.uom,
            taxRate: taxRateValue,
            categoryId: productForm.categoryId,
            imageUrl: imageUrl || undefined,
            isActive: productForm.active,
          }),
        });

        if (response.ok) {
          refreshData(token);
        } else {
          const err = await response.json();
          alert(`Error: ${err.message || "Failed to update product"}`);
        }
      } else {
        const response = await fetch("http://localhost:3000/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: productForm.name,
            price: productForm.price,
            unitOfMeasure: productForm.uom,
            taxRate: taxRateValue,
            categoryId: productForm.categoryId,
            imageUrl: imageUrl || undefined,
            isKdsVisible: true,
          }),
        });

        if (response.ok) {
          refreshData(token);
        } else {
          const err = await response.json();
          alert(`Error: ${err.message || "Failed to create product"}`);
        }
      }
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto font-sans">
      <ProductsToolbar
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onNewProduct={handleNewClick}
      />

      <section key={viewMode} className="mt-1">
        {viewMode === "grid" ? (
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
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
          product={selectedProduct}
          categories={categories}
        />
      )}
    </div>
  );
}
