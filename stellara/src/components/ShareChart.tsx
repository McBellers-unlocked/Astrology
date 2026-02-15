'use client';

import { useState } from 'react';
import { Share2, Twitter, Link2, Check, MessageCircle } from 'lucide-react';

interface ShareChartProps {
  /** User's Sun sign */
  sunSign: string;
  /** User's Moon sign */
  moonSign: string;
  /** User's Rising sign */
  risingSign: string;
  /** User's name (optional) */
  name?: string;
}

export default function ShareChart({ sunSign, moonSign, risingSign, name }: ShareChartProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareText = name
    ? `${name}'s Big Three: ☀️ ${sunSign} Sun, 🌙 ${moonSign} Moon, ⬆️ ${risingSign} Rising — Discover yours free at Stellara`
    : `My Big Three: ☀️ ${sunSign} Sun, 🌙 ${moonSign} Moon, ⬆️ ${risingSign} Rising — Discover yours free at Stellara`;

  const shareUrl = 'https://stellera.co/birth-chart';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = `${shareText}\n${shareUrl}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl border border-celestial-500/15 bg-space-800/70 px-4 py-2.5 text-sm text-dust-300 transition-all hover:border-celestial-400/30 hover:text-celestial-200"
      >
        <Share2 className="h-4 w-4" />
        Share My Chart
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-celestial-700/20 bg-space-800/95 shadow-lg shadow-space-900/60 backdrop-blur-xl">
            <div className="p-1.5">
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-dust-300 transition-colors hover:bg-celestial-700/15 hover:text-celestial-200"
                onClick={() => setOpen(false)}
              >
                <Twitter className="h-4 w-4" />
                Share on X / Twitter
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-dust-300 transition-colors hover:bg-celestial-700/15 hover:text-celestial-200"
                onClick={() => setOpen(false)}
              >
                <MessageCircle className="h-4 w-4" />
                Share on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => {
                  handleCopyLink();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-dust-300 transition-colors hover:bg-celestial-700/15 hover:text-celestial-200"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-aurora-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
