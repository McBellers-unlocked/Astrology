"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Stats {
  users: {
    total: number;
    today: number;
    thisWeek: number;
    premiumActive: number;
    tierBreakdown: Array<{ tier: string; count: number }>;
    statusBreakdown: Array<{ status: string; count: number }>;
    withBirthChart: number;
    withBigThree: number;
    signupsByDay: Array<{ date: string; count: number }>;
    signDistribution: Array<{ sign: string; count: number }>;
  };
  revenue: {
    estimatedMRR: number;
    stellarActive: number;
    cosmicActive: number;
  };
  email: {
    subscribers: number;
    unsubscribed: number;
    subscriberSources: Array<{ source: string; count: number }>;
    nurtureStats: Array<{ email_key: string; count: number }>;
  };
  social: {
    totalReplies: number;
    repliesToday: number;
  };
  utm: Array<{ source: string; count: number }>;
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

function BarChart({ data, maxBars = 30 }: { data: Array<{ label: string; value: number }>; maxBars?: number }) {
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
          {items.length <= 14 && (
            <span className="text-[10px] text-gray-500 truncate w-full text-center">
              {d.label.slice(5)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Stats>("/admin/stats")
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="text-red-400 text-center py-12">{error}</div>;
  }
  if (!stats) {
    return <div className="text-purple-300 text-center py-12">Loading dashboard...</div>;
  }

  const conversionRate = stats.users.total > 0
    ? ((stats.users.premiumActive / stats.users.total) * 100).toFixed(1)
    : "0";

  const chartAdoption = stats.users.total > 0
    ? ((stats.users.withBirthChart / stats.users.total) * 100).toFixed(0)
    : "0";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KPICard label="Total Users" value={stats.users.total} sub={`+${stats.users.today} today`} />
        <KPICard label="This Week" value={`+${stats.users.thisWeek}`} />
        <KPICard label="Premium Active" value={stats.users.premiumActive} sub={`${conversionRate}% conversion`} />
        <KPICard label="Est. MRR" value={`$${stats.revenue.estimatedMRR}`} />
        <KPICard label="Email Subs" value={stats.email.subscribers} sub={`${stats.email.unsubscribed} unsub'd`} />
        <KPICard label="Social Replies" value={stats.social.totalReplies} sub={`${stats.social.repliesToday} today`} />
      </div>

      {/* Signups chart + Tier breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-[#1a1230] border border-purple-500/20 rounded-xl p-5">
          <h2 className="text-gray-300 text-sm font-medium mb-4">Signups (Last 30 Days)</h2>
          {stats.users.signupsByDay.length > 0 ? (
            <BarChart
              data={stats.users.signupsByDay.map((d) => ({
                label: d.date,
                value: d.count,
              }))}
            />
          ) : (
            <div className="text-gray-500 text-sm h-32 flex items-center justify-center">No data yet</div>
          )}
        </div>

        <div className="bg-[#1a1230] border border-purple-500/20 rounded-xl p-5">
          <h2 className="text-gray-300 text-sm font-medium mb-4">Subscription Tiers</h2>
          <div className="space-y-3">
            {stats.users.tierBreakdown.map((t) => (
              <div key={t.tier} className="flex items-center justify-between">
                <span className="text-gray-400 text-sm capitalize">{t.tier}</span>
                <span className="text-white font-medium">{t.count}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-purple-500/10 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Stellar</span>
              <span className="text-purple-300">{stats.revenue.stellarActive} active</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Cosmic</span>
              <span className="text-purple-300">{stats.revenue.cosmicActive} active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Adoption + UTM + Sun Signs */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-[#1a1230] border border-purple-500/20 rounded-xl p-5">
          <h2 className="text-gray-300 text-sm font-medium mb-4">Feature Adoption</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Birth chart generated</span>
              <span className="text-white">{stats.users.withBirthChart} ({chartAdoption}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Full Big Three</span>
              <span className="text-white">{stats.users.withBigThree}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1230] border border-purple-500/20 rounded-xl p-5">
          <h2 className="text-gray-300 text-sm font-medium mb-4">UTM Sources</h2>
          {stats.utm.length > 0 ? (
            <div className="space-y-2">
              {stats.utm.map((u) => (
                <div key={u.source} className="flex justify-between">
                  <span className="text-gray-400 text-sm">{u.source}</span>
                  <span className="text-white">{u.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No UTM data yet</div>
          )}
        </div>

        <div className="bg-[#1a1230] border border-purple-500/20 rounded-xl p-5">
          <h2 className="text-gray-300 text-sm font-medium mb-4">Sun Sign Distribution</h2>
          {stats.users.signDistribution.length > 0 ? (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {stats.users.signDistribution.map((s) => (
                <div key={s.sign} className="flex justify-between text-sm">
                  <span className="text-gray-400 capitalize">{s.sign}</span>
                  <span className="text-white">{s.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Nurture Sequence + Email Sources */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[#1a1230] border border-purple-500/20 rounded-xl p-5">
          <h2 className="text-gray-300 text-sm font-medium mb-4">Nurture Sequence</h2>
          {stats.email.nurtureStats.length > 0 ? (
            <div className="space-y-2">
              {stats.email.nurtureStats.map((n) => (
                <div key={n.email_key} className="flex justify-between">
                  <span className="text-gray-400 text-sm">{n.email_key}</span>
                  <span className="text-white">{n.count} sent</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No nurture emails sent yet</div>
          )}
        </div>

        <div className="bg-[#1a1230] border border-purple-500/20 rounded-xl p-5">
          <h2 className="text-gray-300 text-sm font-medium mb-4">Subscriber Sources</h2>
          {stats.email.subscriberSources.length > 0 ? (
            <div className="space-y-2">
              {stats.email.subscriberSources.map((s) => (
                <div key={s.source} className="flex justify-between">
                  <span className="text-gray-400 text-sm">{s.source}</span>
                  <span className="text-white">{s.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No subscriber data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
