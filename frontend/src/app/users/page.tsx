"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, LayoutGrid, List, Search, Users, ShieldCheck, UserCheck, Archive } from "lucide-react";
import { User } from "@/features/users/components/types";
import { UserTable } from "@/features/users/components/UserTable";
import { UserCard } from "@/features/users/components/UserCard";
import { UserModal } from "@/features/users/components/UserModal";
import { StatCard } from "@/features/dashboard/components/StatCard";

const AVATAR_COLORS = ["#C9783A", "#5B8FA8", "#789658", "#866443", "#9B6A9B", "#6B8E7B", "#A67B5B", "#7B9EA8"];

type ViewMode = "list" | "grid";
type ModalState =
  | { kind: "add" }
  | { kind: "edit";     user: User }
  | { kind: "view";     user: User }
  | { kind: "password"; user: User }
  | null;

export default function UsersPage() {
  const [users,   setUsers]   = useState<User[]>([]);
  const [view,    setView]    = useState<ViewMode>("list");
  const [search,  setSearch]  = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | "Admin" | "Employee">("All");
  const [modal,   setModal]   = useState<ModalState>(null);
  const [toast,   setToast]   = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // ── helpers ──────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  // Auto-login
  useEffect(() => {
    async function autoLogin() {
      try {
        const response = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "admin@cafe.com", password: "Admin@123" }),
        });
        if (response.ok) {
          const data = await response.json();
          setToken(data.accessToken);
        }
      } catch (err) {
        console.error("Users page auto-login error:", err);
      }
    }
    autoLogin();
  }, []);

  // Fetch users from backend
  const fetchUsers = async (jwt: string) => {
    try {
      const res = await fetch("http://localhost:3000/users", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        const data = await res.json();
        const mapped: User[] = data.map((u: any, idx: number) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role === "ADMIN" ? "Admin" : "Employee",
          status: u.status === "ACTIVE" ? "Active" : "Archived",
          joinedAt: new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    if (token) fetchUsers(token);
  }, [token]);

  const handleSave = async (data: Omit<User, "id"> & { password?: string }) => {
    if (!token) return;
    const { password, ...userData } = data;

    if (modal?.kind === "add") {
      try {
        const res = await fetch("http://localhost:3000/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            password: password || "Password@123",
            role: userData.role === "Admin" ? "ADMIN" : "EMPLOYEE",
          }),
        });
        if (res.ok) {
          fetchUsers(token);
          showToast(`${userData.name} added`);
        } else {
          const err = await res.json();
          alert(`Error creating user: ${err.message || "Failed"}`);
        }
      } catch (err) {
        console.error(err);
      }
    } else if (modal?.kind === "edit") {
      try {
        const res = await fetch(`http://localhost:3000/users/${modal.user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            role: userData.role === "Admin" ? "ADMIN" : "EMPLOYEE",
          }),
        });
        if (res.ok) {
          fetchUsers(token);
          showToast(`${userData.name} updated`);
        }
      } catch (err) {
        console.error(err);
      }
    } else if (modal?.kind === "password") {
      try {
        const res = await fetch(`http://localhost:3000/users/${modal.user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password: password,
          }),
        });
        if (res.ok) {
          showToast(`Password updated for ${modal.user.name}`);
        }
      } catch (err) {
        console.error(err);
      }
    }
    setModal(null);
  };

  const handleArchive = async (id: string) => {
    if (!token) return;
    const u = users.find(x => x.id === id);
    if (!u) return;
    const newStatus = u.status === "Active" ? "ARCHIVED" : "ACTIVE";
    try {
      const res = await fetch(`http://localhost:3000/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchUsers(token);
        showToast(`${u.name} ${u.status === "Active" ? "archived" : "restored"}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    try {
      const res = await fetch(`http://localhost:3000/users/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchUsers(token);
        showToast(`${deleteTarget.name} deleted`);
      }
    } catch (err) {
      console.error(err);
    }
    setDeleteTarget(null);
  };

  // ── derived ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  }), [users, search, roleFilter]);

  const totalUsers    = users.length;
  const totalAdmins   = users.filter(u => u.role === "Admin").length;
  const totalActive   = users.filter(u => u.status === "Active").length;
  const totalArchived = users.filter(u => u.status === "Archived").length;

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto font-sans">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[20px] font-bold text-text-heading">Users &amp; Employees</h2>
        <div className="flex flex-wrap items-center gap-3">
          {/* View toggle */}
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
          {/* New user */}
          <button type="button" onClick={() => setModal({ kind: "add" })}
            className="h-[40px] px-5 rounded-[14px] bg-primary text-white text-[15px] font-semibold flex items-center gap-2 hover:brightness-105 hover:-translate-y-[1px] transition-all shadow-sm cursor-pointer">
            <Plus size={18} strokeWidth={2.5} />
            New User
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Total Users"    value={String(totalUsers)}    deltaText={`${totalActive} active`}   isPositive icon={Users}      iconTheme="brown"  />
        <StatCard title="Admins"         value={String(totalAdmins)}   deltaText="full access"               isPositive icon={ShieldCheck} iconTheme="orange" />
        <StatCard title="Active"         value={String(totalActive)}   deltaText="currently active"          isPositive icon={UserCheck}   iconTheme="green"  />
        <StatCard title="Archived"       value={String(totalArchived)} deltaText={totalArchived > 0 ? "deactivated" : "none archived"} isPositive={totalArchived === 0} icon={Archive} iconTheme="gold" />
      </section>

      {/* ── Search + Role filter ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-surface border border-border-custom rounded-[12px] pl-9 pr-4 py-2.5 text-[14px] font-medium text-text-heading placeholder:text-text-muted outline-none focus:border-primary transition-colors theme-transition" />
        </div>
        <div className="flex bg-surface rounded-[13px] p-1 gap-1 theme-transition">
          {(["All", "Admin", "Employee"] as const).map(r => (
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

      {/* ── Content ── */}
      <section key={view}>
        {view === "list" ? (
          <UserTable
            users={filtered}
            onView={u => setModal({ kind: "view", user: u })}
            onChangePassword={u => setModal({ kind: "password", user: u })}
            onArchive={handleArchive}
            onDelete={u => setDeleteTarget(users.find(x => x.id === u) ?? null)}
          />
        ) : (
          filtered.length === 0 ? (
            <div className="py-16 text-center text-[15px] font-medium text-text-muted">No users found.</div>
          ) : (
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
              {filtered.map(u => (
                <UserCard key={u.id} user={u}
                  onView={u => setModal({ kind: "view", user: u })}
                  onChangePassword={u => setModal({ kind: "password", user: u })}
                  onArchive={handleArchive}
                  onDelete={u => setDeleteTarget(users.find(x => x.id === u) ?? null)}
                />
              ))}
            </div>
          )
        )}
      </section>

      {/* ── Modal ── */}
      {modal && (
        <UserModal
          mode={modal.kind}
          user={"user" in modal ? modal.user : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border-custom rounded-[22px] w-full max-w-[380px] p-6 shadow-2xl flex flex-col gap-5 theme-transition">
            <div className="w-12 h-12 rounded-[16px] bg-danger/10 flex items-center justify-center text-2xl">🗑️</div>
            <div>
              <h3 className="text-[18px] font-bold text-text-heading">Delete User?</h3>
              <p className="text-[14px] text-text-muted mt-1.5 leading-relaxed">
                Permanently delete <span className="font-bold text-text-heading">{deleteTarget.name}</span>?
                Consider archiving instead to keep their history.
              </p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-surface hover:bg-border-custom text-text-heading text-[14px] font-bold py-3 rounded-[14px] transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleDelete}
                className="flex-1 bg-danger hover:brightness-95 text-white text-[14px] font-bold py-3 rounded-[14px] transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
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
