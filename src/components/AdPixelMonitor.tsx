import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, ChevronDown, ChevronUp, Radio, Target, ExternalLink } from 'lucide-react';
import { PixelEvent } from '../types';

interface AdPixelMonitorProps {
  events: PixelEvent[];
}

export const AdPixelMonitor: React.FC<AdPixelMonitorProps> = ({ events }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed: Record<string, string> = {};
    params.forEach((val, key) => {
      parsed[key] = val;
    });
    setUtmParams(parsed);
  }, []);

  const latestEvent = events[0];

  return (
    <div className="fixed bottom-16 lg:bottom-4 left-4 z-30">
      {isOpen ? (
        <div className="w-80 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 p-3.5 text-xs">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Ad Trackers & Conversion Pixel</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Active Pixels Status */}
          <div className="py-2 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                Meta / Facebook Pixel
              </span>
              <span className="text-emerald-400 font-semibold">Active & Listening</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-pink-500 inline-block"></span>
                Instagram Reels Ads
              </span>
              <span className="text-emerald-400 font-semibold">Ready</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                Google Ads Conversion
              </span>
              <span className="text-emerald-400 font-semibold">Connected</span>
            </div>
          </div>

          {/* UTM Campaign Source */}
          <div className="pt-2 border-t border-slate-800 text-[11px]">
            <span className="text-slate-400 block mb-1">Detected UTM Campaign:</span>
            {Object.keys(utmParams).length > 0 ? (
              <div className="bg-slate-950 p-1.5 rounded font-mono text-[10px] text-amber-300 truncate">
                {JSON.stringify(utmParams)}
              </div>
            ) : (
              <div className="text-slate-500 italic">
                Direct Visit (Test with: ?utm_source=facebook&utm_campaign=festive)
              </div>
            )}
          </div>

          {/* Latest Event Stream */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-slate-400 text-[11px] block mb-1">Real-Time Event Stream:</span>
            <div className="max-h-28 overflow-y-auto space-y-1">
              {events.slice(0, 5).map((ev) => (
                <div 
                  key={ev.id}
                  className="flex items-center justify-between p-1 bg-slate-800/80 rounded text-[10px]"
                >
                  <span className="font-semibold text-amber-300">{ev.eventName}</span>
                  <span className="text-slate-400 font-mono truncate max-w-[120px]">
                    {ev.productTitle || ev.source}
                  </span>
                  <span className="text-emerald-400 tabular-nums">
                    {ev.value ? `₹${ev.value}` : 'Logged'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-[11px] font-semibold border border-slate-700/80 shadow-lg hover:bg-slate-800 backdrop-blur-xs transition-colors cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Ad Pixel Active</span>
          {latestEvent && (
            <span className="text-amber-400 font-mono text-[10px]">
              [{latestEvent.eventName}]
            </span>
          )}
        </button>
      )}
    </div>
  );
};
