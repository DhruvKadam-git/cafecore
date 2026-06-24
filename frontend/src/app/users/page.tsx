"use client";

import React, { useState, useMemo } from "react";
import { Plus, LayoutGrid, List, Search, Users, ShieldCheck, UserCheck, Archive } from "lucide-react";
import { User } from "@/features/users/components/types";
import { UserTable } from "@/features/users/components/UserTable";
import { UserCard } from "@/features/users/components/UserCard";
import { UserModal } from "@/features/users/components/UserModal";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { useAsyncData } from "@/hooks/use-async-data";
import { useToast } from "@/components/toast/use-toast";
import { toastApiError } from "@/components/toast/toast-utils";
import { mapUserToUI, usersApi } from "@/lib/api";

type ViewMode = "list" | "grid";
type ModalState =
  | { kind: "add" }
  | { kind: "edit"; user: User }
  | { kind: "view"; user: User }
  | { kind: "password"; user: User }
  | null;

export default function UsersPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsyncData(
    async () => {
      const apiUsers = await usersApi.getUsers();
      return apiUsers.map(mapUserToUI);
    },
    [],
    { toastOnError: true }
  );

  const users = data ?? [];

  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | "Admin" | "Employee">("All");
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (data: Omit<User, "id"> & { password?: string }) => {
    setSaving(true);
    try {
      const { password, ...userData } = data;
      const payload = {
        name: userData.name,
        email: userData.email,
        role: userData.role === "Admin" ? "ADMIN" : "EMPLOYEE",
        status: userData.status === "Active" ? "ACTIVE" : userData.status === "Archived" ? "ARCHIVED" : "INACTIVE",
        ...(password ? { password } : {}),
      };
      if (modal?.kind === "add") {
        await usersApi.createUser(payload);
        toast.success(`${userData.name} added`);
      } else if (modal?.kind === "edit") {
        await usersApi.updateUser(modal.user.id, payload);
        toast.success(`${userData.name} updated`);
      } else if (modal?.kind === "password") {
        await usersApi.updateUser(modal.user.id, { password });
        toast.success(`Password updated for ${modal.user.name}`);
      }
      setModal(null);
      reload();
    } catch (err) {
      toastApiError(toast, err);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    try {
      const nextStatus = u.status === "Active" ? "ARCHIVED" : "ACTIVE";
      await usersApi.updateUser(id, { status: nextStatus });
      toast.success(`${u.name} ${u.status === "Active" ? "archived" : "restored"}`);
      reload();
    } catch (err) {
      toastApiError(toast, err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await usersApi.deleteUser(deleteTarget.id);
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toastApiError(toast, err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  }), [users, search, roleFilter]);

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "Admin").length;
  const totalActive = users.filter((u) => u.status === "Active").length;
  const totalArchived = users.filter((u) => u.status === "Archived").length;

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto font-sans">
      {error && (
        <div className="flex items-center justify-between bg-danger/10 text-danger rounded-[12px] px-4 py-3 text-[13px] font-semibold">
          <span>{error}</span>
          <button type="button" onClick={reload} className="underline">Retry</button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[20px] font-bold text-text-heading">Users &amp; Employees</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative z-10 flex items-stretch h-[40px] p-1 bg-surface border border-border-custom rounded-[14px] select-none min-w-[160px] theme-transition">
            {([
              { mode: "grid" as ViewMode, label: "Grid", Icon: LayoutGrid },
              { mode: "list" as ViewMode, label: "List", Icon: List },
            ]).map(({ mode, label, Icon }) => (
              <button key={mode} type="button" onClick={() => setView(mode)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] text-[14px] font-semibold transition-all duration-200 cursor-pointer ${
                  view === mode ? "bg-primary text-white shadow-sm" : "text-text-body hover:text-text-heading"
                }`}>
                <Icon size={17} strokeWidth={1.75} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setModal({ kind: "add" })}
            className="h-[40px] px-5 rounded-[14px] bg-primary text-white text-[15px] font-semibold flex items-center gap-2 hover:brightness-105 hover:-translate-y-[1px] transition-all shadow-sm cursor-pointer">
            <Plus size={18} strokeWidth={2.5} />
            New User
          </button>
        </div>
      </div>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Total Users" value={String(totalUsers)} deltaText={`${totalActive} active`} isPositive icon={Users} iconTheme="brown" />
        <StatCard title="Admins" value={String(totalAdmins)} deltaText="full access" isPositive icon={ShieldCheck} iconTheme="orange" />
        <StatCard title="Active" value={String(totalActive)} deltaText="currently active" isPositive icon={UserCheck} iconTheme="green" />
        <StatCard title="Archived" value={String(totalArchived)} deltaText={totalArchived > 0 ? "deactivated" : "none archived"} isPositive={totalArchived === 0} icon={Archive} iconTheme="gold" />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-surface border border-border-custom rounded-[12px] pl-9 pr-4 py-2.5 text-[14px] font-medium text-text-heading placeholder:text-text-muted outline-none focus:border-primary transition-colors theme-transition" />
        </div>
        <div className="flex bg-surface rounded-[13px] p-1 gap-1 theme-transition">
          {(["All", "Admin", "Employee"] as const).map((r) => (
            <button key={r} type="button" onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-1.5 rounded-[10px] text-[13px] font-semibold transition-all ${
                roleFilter === r ? "bg-input text-primary shadow-sm" : "text-text-muted hover:text-text-body"
              }`}>
              {r}
            </button>
          ))}
        </div>
        <span className="text-[13px] text-text-muted font-medium ml-auto">
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <section key={view}>
        {loading ? (
          <div className="py-16 text-center text-text-muted">Loading users...</div>
        ) : view === "list" ? (
          <UserTable
            users={filtered}
            onView={(u) => setModal({ kind: "view", user: u })}
            onChangePassword={(u) => setModal({ kind: "password", user: u })}
            onArchive={handleArchive}
            onDelete={(u) => setDeleteTarget(users.find((x) => x.id === u) ?? null)}
          />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-[15px] font-medium text-text-muted">No users found.</div>
        ) : (
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
            {filtered.map((u) => (
              <UserCard key={u.id} user={u}
                onView={(u) => setModal({ kind: "view", user: u })}
                onChangePassword={(u) => setModal({ kind: "password", user: u })}
                onArchive={handleArchive}
                onDelete={(id) => setDeleteTarget(users.find((x) => x.id === id) ?? null)}
              />
            ))}
          </div>
        )}
      </section>

      {modal && (
        <UserModal
          mode={modal.kind}
          user={"user" in modal ? modal.user : null}
          onSave={handleSave}
          onClose={() => !saving && setModal(null)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border-custom rounded-[22px] w-full max-w-[380px] p-6 shadow-2xl flex flex-col gap-5 theme-transition">
            <div className="w-12 h-12 rounded-[16px] bg-danger/10 flex items-center justify-center text-2xl">🗑️</div>
            <div>
              <h3 className="text-[18px] font-bold text-text-heading">Delete User?</h3>
              <p className="text-[14px] text-text-muted mt-1.5 leading-relaxed">
                Permanently delete <span className="font-bold text-text-heading">{deleteTarget.name}</span>?
              </p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-surface hover:bg-border-custom text-text-heading text-[14px] font-bold py-3 rounded-[14px] transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={saving}
                className="flex-1 bg-danger hover:brightness-95 disabled:opacity-60 text-white text-[14px] font-bold py-3 rounded-[14px] transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
