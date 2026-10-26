"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { fetchAdminUsers, updateAdminUser, deleteAdminUser, AdminUser } from "@/lib/api";

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
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [toast, setToast] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  // Exclude administrators: show ONLY customer data
  const customerUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.role !== "admin" &&
        u.email?.toLowerCase() !== "admin@krono.luxury" &&
        u.username?.toLowerCase() !== "admin"
    );
  }, [users]);

  // Filtered Users (Customers only)
  const filteredUsers = useMemo(() => {
    return customerUsers.filter((u) => {
      if (statusFilter === "active" && u.status === "Suspended") return false;
      if (statusFilter === "suspended" && u.status !== "Suspended") return false;
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
  }, [customerUsers, statusFilter, search]);

  // Aggregate Stats (Customers Only)
  const totalCount = customerUsers.length;
  const activeCount = customerUsers.filter((u) => u.status !== "Suspended").length;
  const suspendedCount = customerUsers.filter((u) => u.status === "Suspended").length;

  const handleStatusToggle = async (user: AdminUser) => {
    if (user.role === "admin") {
      alert("Administrator accounts cannot be modified from customer management.");
      return;
    }
    const nextStatus = user.status === "Suspended" ? "Active" : "Suspended";

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
    if (user.role === "admin") {
      alert("Administrator accounts cannot be deleted here.");
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete customer "${user.name}" (${user.email})?`)) {
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
            Customer Management
          </h1>
          <p style={{ fontSize: "12.5px", color: "#6B7280", margin: "4px 0 0" }}>
            View, manage, and administer registered storefront customer accounts.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={S.card}>
          <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 700, textTransform: "uppercase" }}>
            Total Customers
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#FFFFFF", marginTop: "8px" }}>
            {totalCount}
          </div>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: "11px", color: "#34D399", fontWeight: 700, textTransform: "uppercase" }}>
            Active Accounts
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#34D399", marginTop: "8px" }}>
            {activeCount}
          </div>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: "11px", color: "#F87171", fontWeight: 700, textTransform: "uppercase" }}>
            Suspended Accounts
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#F87171", marginTop: "8px" }}>
            {suspendedCount}
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
          {([
            { key: "all", label: "All Customers" },
            { key: "active", label: "Active" },
            { key: "suspended", label: "Suspended" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                background: statusFilter === tab.key ? "#38BDF8" : "#16191E",
                color: statusFilter === tab.key ? "#0B0F14" : "#9CA3AF",
                border: "1px solid " + (statusFilter === tab.key ? "#38BDF8" : "#282E38"),
              }}
            >
              {tab.label}
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
                <th style={S.th}>Customer</th>
                <th style={S.th}>Email Address</th>
                <th style={S.th}>Account Status</th>
                <th style={S.th}>Contact &amp; Location</th>
                <th style={S.th}>Joined</th>
                <th style={{ ...S.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ ...S.td, textAlign: "center", padding: "40px", color: "#6B7280" }}>
                    Loading customers…
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...S.td, textAlign: "center", padding: "40px", color: "#6B7280" }}>
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSuspended = u.status === "Suspended";

                  return (
                    <tr key={u.id} style={{ opacity: isSuspended ? 0.6 : 1 }}>
                      {/* Customer Name */}
                      <td style={S.td}>
                        <div>
                          <div style={{ fontWeight: 600, color: "#FFFFFF" }}>{u.name || "Customer"}</div>
                          <div style={{ fontSize: "11px", color: "#6B7280", fontFamily: "monospace" }}>
                            @{u.username || u.email.split("@")[0]}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={S.td}>
                        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#D1D5DB" }}>
                          {u.email}
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
                          {/* Toggle Status Button */}
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

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(u)}
                            disabled={updatingId === u.id}
                            style={{
                              padding: "5px 12px",
                              background: "rgba(239, 68, 68, 0.12)",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              borderRadius: "6px",
                              color: "#F87171",
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                            title="Permanently delete customer account"
                          >
                            Delete
                          </button>
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
    </div>
  );
}
