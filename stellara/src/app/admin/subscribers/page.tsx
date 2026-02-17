"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.get<{ subscribers: Subscriber[]; pagination: Pagination }>(
        `/admin/subscribers?page=${page}&limit=50`,
      );
      setSubscribers(data.subscribers);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers(1);
  }, [fetchSubscribers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Email Subscribers</h1>
        <span className="text-gray-500 text-sm">{pagination.total} total</span>
      </div>

      <div className="bg-[#1a1230] border border-purple-500/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-500/20 text-left">
                <th className="py-3 px-4 text-gray-400 text-xs font-medium uppercase">Email</th>
                <th className="py-3 px-4 text-gray-400 text-xs font-medium uppercase">Source</th>
                <th className="py-3 px-4 text-gray-400 text-xs font-medium uppercase">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-gray-500">Loading...</td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-gray-500">No subscribers yet</td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.id} className="border-b border-purple-500/10">
                    <td className="py-3 px-4 text-white text-sm">{sub.email}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm">{sub.source ?? "—"}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(sub.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-purple-500/10">
            <button
              onClick={() => fetchSubscribers(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-500 text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => fetchSubscribers(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
