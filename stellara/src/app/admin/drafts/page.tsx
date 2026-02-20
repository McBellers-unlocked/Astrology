"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface Draft {
  id: number;
  type: string;
  text: string;
  sign: string | null;
  thread_tweets: string | null;
  reply_to_tweet_id: string | null;
  reply_to_username: string | null;
  reply_to_text: string | null;
  source_type: string | null;
  status: string;
  posted_tweet_id: string | null;
  created_at: string;
  acted_at: string | null;
  has_image: number;
}

const TYPE_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  horoscope: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Horoscope" },
  engagement: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Engagement" },
  thread: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Thread" },
  reply: { bg: "bg-green-500/20", text: "text-green-400", label: "Reply" },
  quote_tweet: { bg: "bg-orange-500/20", text: "text-orange-400", label: "Quote Tweet" },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.stellera.co";

export default function AdminDraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [filter, setFilter] = useState<"pending" | "posted" | "skipped">("pending");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState<number | null>(null);

  const fetchDrafts = useCallback(() => {
    setLoading(true);
    api
      .get<{ drafts: Draft[] }>(`/admin/drafts?status=${filter}`)
      .then((data) => {
        setDrafts(data.drafts);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  async function handlePost(id: number) {
    setActing((prev) => new Set(prev).add(id));
    try {
      await api.post<{ success: boolean; tweetId?: string }>(`/admin/drafts/${id}/post`);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Failed to post: ${msg}`);
    } finally {
      setActing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleSkip(id: number) {
    setActing((prev) => new Set(prev).add(id));
    try {
      await api.post<{ success: boolean }>(`/admin/drafts/${id}/skip`);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Failed to skip: ${msg}`);
    } finally {
      setActing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  function handleCopyText(draft: Draft) {
    let fullText = draft.text;
    if (draft.thread_tweets) {
      const tweets = JSON.parse(draft.thread_tweets) as string[];
      fullText = tweets.join("\n\n---\n\n");
    }
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(draft.id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function handleDownloadImage(draft: Draft) {
    const url = `${API_URL}/admin/drafts/${draft.id}/image`;
    const filename = `stellera-${draft.type}-${draft.sign || "post"}-${draft.id}.png`;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const pendingCount = filter === "pending" ? drafts.length : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          Draft Queue
          {pendingCount !== null && pendingCount > 0 && (
            <span className="ml-2 text-sm font-normal text-purple-400">
              ({pendingCount} pending)
            </span>
          )}
        </h1>
        <div className="flex gap-2">
          {(["pending", "posted", "skipped"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                filter === s
                  ? "bg-purple-500/30 text-purple-300 border border-purple-500/40"
                  : "bg-[#1a1230] text-gray-400 border border-purple-500/20 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-red-400 text-center py-8">{error}</div>}

      {loading && !error && (
        <div className="text-purple-300 text-center py-12">Loading drafts...</div>
      )}

      {!loading && !error && drafts.length === 0 && (
        <div className="text-gray-500 text-center py-16 bg-[#1a1230] border border-purple-500/20 rounded-xl">
          No {filter} drafts
        </div>
      )}

      {!loading && !error && drafts.length > 0 && (
        <div className="space-y-4">
          {drafts.map((draft) => {
            const badge = TYPE_BADGES[draft.type] ?? TYPE_BADGES.engagement;
            const isActing = acting.has(draft.id);
            const threadTweets = draft.thread_tweets
              ? (JSON.parse(draft.thread_tweets) as string[])
              : null;

            return (
              <div
                key={draft.id}
                className="bg-[#1a1230] border border-purple-500/20 rounded-xl p-5 space-y-3"
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                    {draft.sign && (
                      <span className="text-xs text-gray-500 capitalize">{draft.sign}</span>
                    )}
                    {draft.source_type && (
                      <span className="text-xs text-gray-600">{draft.source_type}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600">
                    {new Date(draft.created_at + "Z").toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Reply context */}
                {draft.reply_to_username && draft.reply_to_text && (
                  <div className="bg-[#0f0a1a] rounded-lg px-4 py-3 border border-purple-500/10">
                    <div className="text-xs text-gray-500 mb-1">
                      Replying to{" "}
                      <a
                        href={`https://twitter.com/${draft.reply_to_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        @{draft.reply_to_username}
                      </a>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {draft.reply_to_text.length > 200
                        ? draft.reply_to_text.slice(0, 200) + "..."
                        : draft.reply_to_text}
                    </div>
                  </div>
                )}

                {/* Tweet text */}
                <div className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                  {draft.text}
                </div>

                {/* Thread tweets (if thread) */}
                {threadTweets && threadTweets.length > 1 && (
                  <div className="space-y-2 pl-4 border-l-2 border-purple-500/20">
                    {threadTweets.slice(1).map((tweet, i) => (
                      <div key={i} className="text-gray-400 text-sm whitespace-pre-wrap">
                        <span className="text-gray-600 text-xs mr-2">{i + 2}.</span>
                        {tweet}
                      </div>
                    ))}
                  </div>
                )}

                {/* Image preview */}
                {draft.has_image === 1 && (
                  <div>
                    <img
                      src={`${API_URL}/admin/drafts/${draft.id}/image`}
                      alt="Draft image"
                      className="rounded-lg max-h-48 border border-purple-500/10"
                    />
                  </div>
                )}

                {/* Posted info */}
                {draft.status === "posted" && draft.posted_tweet_id && (
                  <div className="text-xs text-green-400">
                    Posted:{" "}
                    <a
                      href={`https://twitter.com/i/status/${draft.posted_tweet_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 font-mono"
                    >
                      {draft.posted_tweet_id}
                    </a>
                    {draft.acted_at && (
                      <span className="text-gray-600 ml-2">
                        {new Date(draft.acted_at + "Z").toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                )}

                {/* Skipped info */}
                {draft.status === "skipped" && draft.acted_at && (
                  <div className="text-xs text-gray-500">
                    Skipped{" "}
                    {new Date(draft.acted_at + "Z").toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1 flex-wrap">
                  {draft.status === "pending" && (
                    <>
                      <button
                        onClick={() => handlePost(draft.id)}
                        disabled={isActing}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isActing ? "Posting..." : "Post"}
                      </button>
                      <button
                        onClick={() => handleSkip(draft.id)}
                        disabled={isActing}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-600/20 text-gray-400 border border-gray-500/30 hover:bg-gray-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Skip
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleCopyText(draft)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 transition-colors"
                  >
                    {copied === draft.id ? "Copied!" : "Copy Text"}
                  </button>
                  {draft.has_image === 1 && (
                    <button
                      onClick={() => handleDownloadImage(draft)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
                    >
                      Download Image
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
