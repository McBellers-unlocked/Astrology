"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface PostResult {
  timestamp: string;
  scheduledFor: string;
  type: "horoscope" | "engagement" | "thread";
  sign?: string;
  success: boolean;
  tweetId?: string;
  error?: string;
}

interface TypeBreakdown {
  total: number;
  success: number;
}

interface SocialData {
  posts: {
    today: PostResult[];
    totalToday: number;
    successToday: number;
    failedToday: number;
    byType: Record<string, TypeBreakdown>;
  };
  replies: {
    total: number;
    today: number;
    successfulToday: number;
    failedToday: number;
    repliesByDay: Array<{ date: string; count: number }>;
    topAuthors: Array<{ username: string; count: number }>;
    recentReplies: Array<{
      original_tweet_id: string;
      author_username: string;
      reply_tweet_id: string | null;
      reply_text: string;
      created_at: string;
    }>;
  };
}

function KPICard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#1a1230] border border-purple-500/20 rounded-xl p-5">
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className="text-white text-3xl font-bold">{value}</div>
      {sub && <div className="text-gray-500 text-sm mt-1">{sub}</div>}
    </div>
  );
}

function BarChart({ data, maxBars = 7 }: { data: Array<{ label: string; value: number }>; maxBars?: number }) {
  const items = data.slice(-maxBars);
  const max = Math.max(...items.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {items.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-purple-500/60 rounded-t min-h-[2px] transition-all"
            style={{ height: `${(d.value / max) * 100}%` }}
          />
          <span className="text-[10px] text-gray-500 truncate w-full text-center">
            {d.label.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

function TypeProgressBar({ label, success, total }: { label: string; success: number; total: number }) {
  const pct = total > 0 ? (success / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-sm w-28 capitalize">{label}</span>
      <div className="flex-1 bg-purple-500/10 rounded-full h-2">
        <div className="bg-purple-500/60 rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-white text-sm w-14 text-right">{success}/{total}</span>
    </div>
  );
}

const TYPE_BADGES: Record<string, { bg: string; text: string }> = {
  horoscope: { bg: "bg-purple-500/20", text: "text-purple-400" },
  engagement: { bg: "bg-blue-500/20", text: "text-blue-400" },
  thread: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
};

export default function AdminSocialPage() {
  const [data, setData] = useState<SocialData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<SocialData>("/admin/social")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="text-red-400 text-center py-12">{error}</div>;
  }
  if (!data) {
    return <div className="text-purple-300 text-center py-12">Loading social data...</div>;
  }

  const postRate =
    data.posts.totalToday > 0
      ? ((data.posts.successToday / data.posts.totalToday) * 100).toFixed(0)
      : "—";

  const topAuthor = data.replies.topAuthors[0];

  const sortedPosts = [...data.posts.today].sort((a, b) =>
    a.scheduledFor.localeCompare(b.scheduledFor),
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Social</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard label="Posts Today" value={`${data.posts.totalToday}/34`} sub="expected 34" />
        <KPICard label="Post Success" value={`${postRate}%`} sub={`${data.posts.failedToday} failed`} />
        <KPICard label="Replies Today" value={`${data.replies.today}/40`} sub="budget 40/day" />
        <KPICard label="Replies Sent" value={data.replies.successfulToday} sub={`${data.replies.failedToday} pending`} />
        <KPICard label="Total Replies" value={data.replies.total} sub="all time" />
        <KPICard
          label="Top Author"
          value={topAuthor ? `@${topAuthor.username}` : "—"}
          sub={topAuthor ? `${topAuthor.count} replies` : undefined}
        />
      </div>

      {/* Post breakdown + Reply chart */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-[#1a1230] border border-purple-500/20 rounded-xl p-5">
          <h2 className="text-gray-300 text-sm font-medium mb-4">Post Results by Type</h2>
          <div className="space-y-4">
            {(["horoscope", "engagement", "thread"] as const).map((type) => {
              const b = data.posts.byType[type] ?? { total: 0, success: 0 };
              return <TypeProgressBar key={type} label={type} success={b.success} total={b.total} />;
            })}
          </div>
        </div>

        <div className="bg-[#1a1230] border border-purple-500/20 rounded-xl p-5">
          <h2 className="text-gray-300 text-sm font-medium mb-4">Replies (Last 7 Days)</h2>
          {data.replies.repliesByDay.length > 0 ? (
            <BarChart
              data={data.replies.repliesByDay.map((d) => ({ label: d.date, value: d.count }))}
            />
          ) : (
            <div className="text-gray-500 text-sm h-32 flex items-center justify-center">No data yet</div>
          )}
        </div>
      </div>

      {/* Today's Post Results Table */}
      <div className="bg-[#1a1230] border border-purple-500/20 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-purple-500/20">
          <h2 className="text-gray-300 text-sm font-medium">Today&apos;s Post Results</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-500/20 text-left">
                <th className="py-3 px-4 text-gray-400 text-xs font-medium uppercase">Time</th>
                <th className="py-3 px-4 text-gray-400 text-xs font-medium uppercase">Type</th>
                <th className="py-3 px-4 text-gray-400 text-xs font-medium uppercase">Sign</th>
                <th className="py-3 px-4 text-gray-400 text-xs font-medium uppercase">Status</th>
                <th className="py-3 px-4 text-gray-400 text-xs font-medium uppercase">Detail</th>
              </tr>
            </thead>
            <tbody>
              {sortedPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No posts recorded today
                  </td>
                </tr>
              ) : (
                sortedPosts.map((p, i) => {
                  const badge = TYPE_BADGES[p.type] ?? TYPE_BADGES.engagement;
                  return (
                    <tr key={i} className="border-b border-purple-500/10">
                      <td className="py-3 px-4 text-gray-400 text-xs font-mono">
                        {p.scheduledFor}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                          {p.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm capitalize">
                        {p.sign ?? "—"}
                      </td>
                      <td className="py-3 px-4">
                        {p.success ? (
                          <span className="text-green-400 text-xs">&#10003; sent</span>
                        ) : (
                          <span className="text-red-400 text-xs">&#10007; failed</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {p.success && p.tweetId ? (
                          <a
                            href={`https://twitter.com/i/status/${p.tweetId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 text-xs font-mono"
                          >
                            {p.tweetId}
                          </a>
                        ) : p.error ? (
                          <span className="text-red-400 text-xs" title={p.error}>
                            {p.error.slice(0, 60)}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Engagement Replies Table */}
      <div className="bg-[#1a1230] border border-purple-500/20 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-purple-500/20">
          <h2 className="text-gray-300 text-sm font-medium">Recent Engagement Replies</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-500/20 text-left">
                <th className="py-3 px-4 text-gray-400 text-xs font-medium uppercase">Time</th>
                <th className="py-3 px-4 text-gray-400 text-xs font-medium uppercase">Author</th>
                <th className="py-3 px-4 text-gray-400 text-xs font-medium uppercase">Reply Text</th>
                <th className="py-3 px-4 text-gray-400 text-xs font-medium uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.replies.recentReplies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    No engagement replies yet
                  </td>
                </tr>
              ) : (
                data.replies.recentReplies.map((r, i) => (
                  <tr key={i} className="border-b border-purple-500/10">
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(r.created_at).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`https://twitter.com/${r.author_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 text-sm"
                      >
                        @{r.author_username}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm max-w-md">
                      <span title={r.reply_text}>
                        {r.reply_text.length > 80
                          ? r.reply_text.slice(0, 80) + "…"
                          : r.reply_text}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {r.reply_tweet_id ? (
                        <span className="text-green-400 text-xs">sent</span>
                      ) : (
                        <span className="text-gray-500 text-xs">pending</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
