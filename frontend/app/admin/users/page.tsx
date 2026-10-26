"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchAdminUsers, updateAdminUser, deleteAdminUser, createAdminUser, AdminUser } from "@/lib/api";

const S = {
  card: {
    background: "#0F1115",
    border: "1px solid #1E232B",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
  } as React.CSSProperties,
  th: {
    padding: "12px 16px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#6B7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    borderBottom: "1px solid #1E232B",
    background: "#16191E",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  td: {
    padding: "14px 16px",
    fontSize: "12px",
    color: "#F3F4F6",
    borderBottom: "1px solid #16191E",
    verticalAlign: "middle" as const,
  } as React.CSSProperties,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "customer">("all");
  const [toast, setToast] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Add User Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "customer" as "admin" | "customer",
    phone: "",
    address: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load users:", err);
      showToast("Failed to fetch user accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.address?.toLowerCase().includes(q)
      );
    });
  }, [users, roleFilter, search]);

  // Aggregate Stats
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const customerCount = users.filter((u) => u.role === "customer").length;
  const activeCount = users.filter((u) => u.status !== "Suspended").length;

  const handleRoleToggle = async (user: AdminUser) => {
    const nextRole: "admin" | "customer" = user.role === "admin" ? "customer" : "admin";
    if (user.email === "admin@krono.luxury" || user.username === "admin") {
      alert("Primary system administrator role cannot be demoted.");
      return;
    }

    if (!confirm(`Change ${user.name}'s role from ${user.role} to ${nextRole}?`)) return;

    setUpdatingId(user.id);
    try {
      const res = await updateAdminUser(user.id, { role: nextRole });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u))
        );
        showToast(`Role updated to ${nextRole} for ${user.name}`);
      } else {
        alert(res.message || "Failed to update role");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (user: AdminUser) => {
    const nextStatus = user.status === "Suspended" ? "Active" : "Suspended";
    if (user.email === "admin@krono.luxury" || user.username === "admin") {
      alert("Primary system administrator cannot be suspended.");
      return;
    }

    setUpdatingId(user.id);
    try {
      const res = await updateAdminUser(user.id, { status: nextStatus });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
        );
        showToast(`Status updated to ${nextStatus} for ${user.name}`);
      } else {
        alert(res.message || "Failed to update status");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (user.email === "admin@krono.luxury" || user.username === "admin") {
      alert("Primary system administrator cannot be deleted.");
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.email})?`)) {
      return;
    }

    setUpdatingId(user.id);
    try {
      const res = await deleteAdminUser(user.id);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        showToast(`User ${user.name} removed successfully.`);
      } else {
        alert(res.message || "Failed to delete user.");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!newUserData.name.trim() || !newUserData.email.trim() || !newUserData.password.trim()) {
      setAddError("Name, email, and password are required.");
      return;
    }

    setAddLoading(true);
    try {
      const res = await createAdminUser(newUserData);
      if (res.success && res.data) {
        setUsers((prev) => [res.data!, ...prev]);
        showToast(`User account created for ${res.data.name}`);
        setIsAddModalOpen(false);
        setNewUserData({
          name: "",
          email: "",
          username: "",
          password: "",
          role: "customer",
          phone: "",
          address: "",
        });
      } else {
        setAddError(res.message || "Failed to create user.");
      }
    } catch (err: any) {
      setAddError(err.message || "An error occurred.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "32px",
            zIndex: 9999,
            background: "#181B1F",
            border: "1px solid #2E333D",
            borderLeft: "3px solid #38BDF8",
            borderRadius: "8px",
            padding: "10px 18px",
            fontSize: "12.5px",
            fontWeight: 500,
            color: "#FFFFFF",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
          }}
        >
          {toast}
        </div>
      )}

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#F9FAFB",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            User Management
          </h1>
          <p style={{ fontSize: "12.5px", color: "#6B7280", margin: "4px 0 0" }}>
            View, manage, assign roles, and administer customer and staff accounts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#38BDF8",
            color: "#0B0F14",
            border: "none",
            borderRadius: "8px",
            padding: "9px 18px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(56, 189, 248, 0.3)",
          }}
        >
          <span>+ Add User</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={S.card}>
          <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 700, textTransform: "uppercase" }}>
            Total Registered Users
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#FFFFFF", marginTop: "8px" }}>
            {totalCount}
          </div>
          <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "4px" }}>
            Platform customer &amp; staff registry
          </div>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: "11px", color: "#38BDF8", fontWeight: 700, textTransform: "uppercase" }}>
            Administrators
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#38BDF8", marginTop: "8px" }}>
            {adminCount}
          </div>
          <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "4px" }}>
            Privileged management access
          </div>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: "11px", color: "#FBBF24", fontWeight: 700, textTransform: "uppercase" }}>
            Customers
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#FBBF24", marginTop: "8px" }}>
            {customerCount}
          </div>
          <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "4px" }}>
            Registered storefront clients
          </div>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: "11px", color: "#34D399", fontWeight: 700, textTransform: "uppercase" }}>
            Active Accounts
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#34D399", marginTop: "8px" }}>
            {activeCount}
          </div>
          <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "4px" }}>
            Healthy authentication status
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          ...S.card,
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "240px" }}>
          <input
            type="text"
            placeholder="Search by name, email, username, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "#16191E",
              border: "1px solid #282E38",
              borderRadius: "8px",
              padding: "9px 14px",
              fontSize: "12.5px",
              color: "#FFFFFF",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          {(["all", "customer", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "capitalize",
                cursor: "pointer",
                background: roleFilter === r ? "#38BDF8" : "#16191E",
                color: roleFilter === r ? "#0B0F14" : "#9CA3AF",
                border: "1px solid " + (roleFilter === r ? "#38BDF8" : "#282E38"),
              }}
            >
              {r === "all" ? "All Users" : `${r}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "860px" }}>
            <thead>
              <tr>
                <th style={S.th}>Client / User</th>
                <th style={S.th}>Email Address</th>
                <th style={S.th}>Role</th>
                <th style={S.th}>Account Status</th>
                <th style={S.th}>Contact &amp; Location</th>
                <th style={S.th}>Joined</th>
                <th style={{ ...S.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ ...S.td, textAlign: "center", padding: "40px", color: "#6B7280" }}>
                    Loading user accounts from vault database...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...S.td, textAlign: "center", padding: "40px", color: "#6B7280" }}>
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isPrimaryAdmin = u.email === "admin@krono.luxury" || u.username === "admin";
                  const isSuspended = u.status === "Suspended";

                  return (
                    <tr key={u.id} style={{ opacity: isSuspended ? 0.6 : 1 }}>
                      {/* Name & Avatar */}
                      <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              background: u.role === "admin" ? "#0369A1" : "#854D0E",
                              color: "#FFFFFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {(u.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#FFFFFF" }}>{u.name || "User"}</div>
                            <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "monospace" }}>
                              @{u.username || u.email.split("@")[0]}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={S.td}>
                        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#D1D5DB" }}>
                          {u.email}
                        </span>
                      </td>

                      {/* Role */}
                      <td style={S.td}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 9px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            background: u.role === "admin" ? "rgba(56, 189, 248, 0.14)" : "rgba(251, 191, 36, 0.12)",
                            color: u.role === "admin" ? "#38BDF8" : "#FBBF24",
                            border: "1px solid " + (u.role === "admin" ? "rgba(56, 189, 248, 0.3)" : "rgba(251, 191, 36, 0.25)"),
                          }}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={S.td}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 9px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 600,
                            background: isSuspended ? "rgba(239, 68, 68, 0.12)" : "rgba(52, 211, 153, 0.12)",
                            color: isSuspended ? "#F87171" : "#34D399",
                            border: "1px solid " + (isSuspended ? "rgba(239, 68, 68, 0.25)" : "rgba(52, 211, 153, 0.25)"),
                          }}
                        >
                          {isSuspended ? "Suspended" : "Active"}
                        </span>
                      </td>

                      {/* Contact & Address */}
                      <td style={S.td}>
                        <div style={{ fontSize: "11.5px", color: "#E5E7EB" }}>{u.phone || "No phone added"}</div>
                        <div style={{ fontSize: "10.5px", color: "#6B7280", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {u.address || "Sri Lanka"}
                        </div>
                      </td>

                      {/* Joined */}
                      <td style={S.td}>
                        <div style={{ fontSize: "11.5px", color: "#9CA3AF" }}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "Active"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ ...S.td, textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                          {/* Toggle Role Button */}
                          {!isPrimaryAdmin && (
                            <button
                              type="button"
                              onClick={() => handleRoleToggle(u)}
                              disabled={updatingId === u.id}
                              style={{
                                padding: "5px 9px",
                                background: "#16191E",
                                border: "1px solid #282E38",
                                borderRadius: "6px",
                                color: "#9CA3AF",
                                fontSize: "11px",
                                cursor: "pointer",
                              }}
                              title={`Switch to ${u.role === "admin" ? "Customer" : "Admin"}`}
                            >
                              {u.role === "admin" ? "Demote" : "Promote"}
                            </button>
                          )}

                          {/* Toggle Status Button */}
                          {!isPrimaryAdmin && (
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(u)}
                              disabled={updatingId === u.id}
                              style={{
                                padding: "5px 9px",
                                background: "#16191E",
                                border: "1px solid #282E38",
                                borderRadius: "6px",
                                color: isSuspended ? "#34D399" : "#F87171",
                                fontSize: "11px",
                                cursor: "pointer",
                              }}
                              title={isSuspended ? "Activate account" : "Suspend account"}
                            >
                              {isSuspended ? "Activate" : "Suspend"}
                            </button>
                          )}

                          {/* Delete Button */}
                          {!isPrimaryAdmin ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(u)}
                              disabled={updatingId === u.id}
                              style={{
                                padding: "5px 9px",
                                background: "#261315",
                                border: "1px solid #451A1D",
                                borderRadius: "6px",
                                color: "#EF4444",
                                fontSize: "11px",
                                cursor: "pointer",
                              }}
                              title="Delete user"
                            >
                              ✕
                            </button>
                          ) : (
                            <span style={{ fontSize: "10px", color: "#38BDF8", fontWeight: 700, padding: "4px 8px" }}>
                              PROTECTED
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              background: "#0F1115",
              border: "1px solid #282E38",
              borderRadius: "14px",
              padding: "24px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>Add New User Account</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#6B7280", fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {addError && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#F87171",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  marginBottom: "16px",
                }}
              >
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#9CA3AF", marginBottom: "4px", textTransform: "uppercase" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="e.g. Jean-Luc Picard"
                  style={{
                    width: "100%",
                    background: "#16191E",
                    border: "1px solid #282E38",
                    borderRadius: "8px",
                    padding: "9px 12px",
                    fontSize: "12.5px",
                    color: "#FFFFFF",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#9CA3AF", marginBottom: "4px", textTransform: "uppercase" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="user@krono.luxury"
                    style={{
                      width: "100%",
                      background: "#16191E",
                      border: "1px solid #282E38",
                      borderRadius: "8px",
                      padding: "9px 12px",
                      fontSize: "12.5px",
                      color: "#FFFFFF",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#9CA3AF", marginBottom: "4px", textTransform: "uppercase" }}>
                    Role *
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as any })}
                    style={{
                      width: "100%",
                      background: "#16191E",
                      border: "1px solid #282E38",
                      borderRadius: "8px",
                      padding: "9px 12px",
                      fontSize: "12.5px",
                      color: "#FFFFFF",
                      outline: "none",
                    }}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#9CA3AF", marginBottom: "4px", textTransform: "uppercase" }}>
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="At least 8 characters"
                  style={{
                    width: "100%",
                    background: "#16191E",
                    border: "1px solid #282E38",
                    borderRadius: "8px",
                    padding: "9px 12px",
                    fontSize: "12.5px",
                    color: "#FFFFFF",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#9CA3AF", marginBottom: "4px", textTransform: "uppercase" }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    placeholder="+94 77 123 4567"
                    style={{
                      width: "100%",
                      background: "#16191E",
                      border: "1px solid #282E38",
                      borderRadius: "8px",
                      padding: "9px 12px",
                      fontSize: "12.5px",
                      color: "#FFFFFF",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#9CA3AF", marginBottom: "4px", textTransform: "uppercase" }}>
                    Location / Address
                  </label>
                  <input
                    type="text"
                    value={newUserData.address}
                    onChange={(e) => setNewUserData({ ...newUserData, address: e.target.value })}
                    placeholder="Colombo, Sri Lanka"
                    style={{
                      width: "100%",
                      background: "#16191E",
                      border: "1px solid #282E38",
                      borderRadius: "8px",
                      padding: "9px 12px",
                      fontSize: "12.5px",
                      color: "#FFFFFF",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    background: "transparent",
                    border: "1px solid #282E38",
                    borderRadius: "8px",
                    padding: "9px 16px",
                    fontSize: "12.5px",
                    color: "#9CA3AF",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  style={{
                    background: "#38BDF8",
                    border: "none",
                    borderRadius: "8px",
                    padding: "9px 20px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#0B0F14",
                    cursor: "pointer",
                  }}
                >
                  {addLoading ? "Saving User..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
