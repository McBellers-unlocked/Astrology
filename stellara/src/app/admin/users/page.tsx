"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  subscription_tier: string;
  subscription_status: string;
  subscription_end_date: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  email_unsubscribed: number;
  is_admin: number;
  nurtureEmails: string[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const TIER_COLORS: Record<string, string> = {
  free: "text-gray-400",
  stellar: "text-purple-400",
  cosmic: "text-yellow-400",
};

const STATUS_BADGES: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-green-500/20", text: "text-green-400" },
  trialing: { bg: "bg-blue-500/20", text: "text-blue-400" },
  canceled: { bg: "bg-red-500/20", text: "text-red-400" },
  none: { bg: "bg-gray-500/20", text: "text-gray-400" },
};

function UserRow({ user, onSelect }: { user: User; onSelect: () => void }) {
  const badge = STATUS_BADGES[user.subscription_status] ?? STATUS_BADGES.none;
  const tierColor = TIER_COLORS[user.subscription_tier] ?? "text-gray-400";
  const bigThree = [user.sun_sign, user.moon_sign, user.rising_sign]
    .filter(Boolean)
    .map((s) => (s as string).charAt(0).toUpperCase() + (s as string).slice(1))
    .join(" / ");
  const createdDate = new Date(user.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <tr
      className="border-b border-purple-500/10 hover:bg-purple-500/5 cursor-pointer transition-colors"
      onClick={onSelect}
    >
      <td className="py-3 px-3">
        <div className="text-white text-sm font-medium">{user.name}</div>
        <div className="text-gray-500 text-xs">{user.email}</div>
      </td>
      <td className="py-3 px-3">
        <span className={`text-sm font-medium capitalize ${tierColor}`}>{user.subscription_tier}</span>
      </td>
      <td className="py-3 px-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
          {user.subscription_status}
        </span>
      </td>
      <td className="py-3 px-3 text-gray-400 text-sm">{bigThree || "—"}</td>
      <td className="py-3 px-3 text-gray-500 text-xs">{user.utm_source ?? "—"}</td>
      <td className="py-3 px-3 text-gray-500 text-xs">{createdDate}</td>
      <td className="py-3 px-3 text-gray-500 text-xs">{user.nurtureEmails.length}/7</td>
    </tr>
  );
}

interface UserDetail {
  id: string;
  email: string;
  name: string;
  created_at: string;
  subscription_tier: string;
  subscription_status: string;
  subscription_end_date: string | null;
  stripe_customer_id: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  email_unsubscribed: number;
  is_admin: number;
}

interface NurtureEmail {
  email_key: string;
  sent_at: string;
}

function UserDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [data, setData] = useState<{ user: UserDetail; nurtureEmails: NurtureEmail[] } | null>(null);

  useEffect(() => {
    api.get<{ user: UserDetail; nurtureEmails: NurtureEmail[] }>(`/admin/user/${userId}`).then(setData);
  }, [userId]);

  if (!data) return null;
  const u = data.user;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[#1a1230] border border-purple-500/20 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-white text-lg font-bold">{u.name}</h2>
            <div className="text-gray-400 text-sm">{u.email}</div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">&times;</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Tier</span>
              <div className="text-white capitalize">{u.subscription_tier}</div>
            </div>
            <div>
              <span className="text-gray-500">Status</span>
              <div className="text-white">{u.subscription_status}</div>
            </div>
            <div>
              <span className="text-gray-500">Joined</span>
              <div className="text-white">{new Date(u.created_at as string).toLocaleString()}</div>
            </div>
            <div>
              <span className="text-gray-500">Stripe ID</span>
              <div className="text-white text-xs font-mono">{(u.stripe_customer_id as string) || "—"}</div>
            </div>
          </div>

          <div className="border-t border-purple-500/10 pt-3">
            <h3 className="text-gray-300 text-sm font-medium mb-2">Birth Chart</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Sun</span>
                <div className="text-white capitalize">{u.sun_sign ?? "—"}</div>
              </div>
              <div>
                <span className="text-gray-500">Moon</span>
                <div className="text-white capitalize">{u.moon_sign ?? "—"}</div>
              </div>
              <div>
                <span className="text-gray-500">Rising</span>
                <div className="text-white capitalize">{u.rising_sign ?? "—"}</div>
              </div>
            </div>
            {u.birth_date && (
              <div className="text-gray-400 text-xs mt-2">
                Born: {u.birth_date} {u.birth_time && `at ${u.birth_time}`}{" "}
                {u.birth_location && `in ${u.birth_location}`}
              </div>
            )}
          </div>

          <div className="border-t border-purple-500/10 pt-3">
            <h3 className="text-gray-300 text-sm font-medium mb-2">UTM Attribution</h3>
            <div className="text-sm text-gray-400">
              {u.utm_source ? (
                <span>
                  {u.utm_source} / {u.utm_medium} / {u.utm_campaign}
                </span>
              ) : (
                "No UTM data"
              )}
            </div>
          </div>

          <div className="border-t border-purple-500/10 pt-3">
            <h3 className="text-gray-300 text-sm font-medium mb-2">
              Nurture Sequence ({data.nurtureEmails.length}/7)
            </h3>
            {data.nurtureEmails.length > 0 ? (
              <div className="space-y-1">
                {data.nurtureEmails.map((n) => (
                  <div key={n.email_key} className="flex justify-between text-xs">
                    <span className="text-gray-400">{n.email_key}</span>
                    <span className="text-gray-500">{new Date(n.sent_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No emails sent yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 });
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (search) params.set("search", search);
      if (tierFilter) params.set("tier", tierFilter);
      const data = await api.get<{ users: User[]; pagination: Pagination }>(
        `/admin/users?${params.toString()}`,
      );
      setUsers(data.users);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [search, tierFilter]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Users</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#1a1230] border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 w-64"
        />
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-[#1a1230] border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/50"
        >
          <option value="">All tiers</option>
          <option value="free">Free</option>
          <option value="stellar">Stellar</option>
          <option value="cosmic">Cosmic</option>
        </select>
        <div className="ml-auto text-gray-500 text-sm self-center">
          {pagination.total} users total
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1230] border border-purple-500/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-500/20 text-left">
                <th className="py-3 px-3 text-gray-400 text-xs font-medium uppercase">User</th>
                <th className="py-3 px-3 text-gray-400 text-xs font-medium uppercase">Tier</th>
                <th className="py-3 px-3 text-gray-400 text-xs font-medium uppercase">Status</th>
                <th className="py-3 px-3 text-gray-400 text-xs font-medium uppercase">Big Three</th>
                <th className="py-3 px-3 text-gray-400 text-xs font-medium uppercase">Source</th>
                <th className="py-3 px-3 text-gray-400 text-xs font-medium uppercase">Joined</th>
                <th className="py-3 px-3 text-gray-400 text-xs font-medium uppercase">Nurture</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onSelect={() => setSelectedUser(user.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-purple-500/10">
            <button
              onClick={() => fetchUsers(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-500 text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => fetchUsers(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* User detail modal */}
      {selectedUser && (
        <UserDetailModal userId={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
