import React, { useState } from 'react';
import { useSara } from '../../context/SaraContext';
import { Hand, Zap, Sparkles, Check, ChevronRight } from 'lucide-react';

export const GestureMapView: React.FC = () => {
  const { gestureMappings, updateGestureMapping } = useSara();
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const gestures = [
    { key: 'wave', name: 'Waving Hand 👋', description: 'When you wave hello at the camera' },
    { key: 'heart', name: 'Heart Hands 💖', description: 'When you make a heart shape with hands' },
    { key: 'thumbs_up', name: 'Thumbs Up 👍', description: 'When you give a thumbs up approval' },
    { key: 'peace', name: 'Peace Sign ✌️', description: 'When you show a V / peace sign' },
  ];

  const automationOptions = [
    { id: 'open_chat', label: 'Open Chat & Speak Greeting' },
    { id: 'romantic_mode', label: 'Trigger Romantic Speech & Love Effect' },
    { id: 'toggle_lights', label: 'Toggle Smart Home Lights / Automations' },
    { id: 'open_wardrobe', label: 'Open Avatar Wardrobe' },
  ];

  const handleSelectMapping = (gestureKey: string, automationId: string) => {
    updateGestureMapping(gestureKey, automationId);
    setSavedNotice(`Updated binding for ${gestureKey}!`);
    setTimeout(() => setSavedNotice(null), 2500);
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl glass-card-pink border border-pink-500/30 p-5 flex items-center justify-between relative overflow-hidden shadow-[0_0_25px_rgba(255,46,147,0.2)]">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-pink-600/30 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Hand className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-100">Gesture Map & Automation</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-sm">
            Bind specific MediaPipe camera gestures to custom app automations and companion reactions.
          </p>
        </div>
        {savedNotice && (
          <div className="bg-pink-600 text-white text-xs px-3.5 py-1.5 rounded-full shadow border border-pink-400 animate-bounce">
            {savedNotice}
          </div>
        )}
      </div>

      {/* Mappings List */}
      <div className="space-y-3">
        {gestures.map((gesture) => {
          const currentBinding = gestureMappings[gesture.key] || 'open_chat';
          return (
            <div
              key={gesture.key}
              className="p-4 rounded-2xl glass-card border border-pink-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-100">{gesture.name}</span>
                  <span className="text-[10px] bg-pink-600/20 text-pink-300 px-2 py-0.5 rounded-md border border-pink-500/30 font-medium">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-400">{gesture.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={currentBinding}
                  onChange={(e) => handleSelectMapping(gesture.key, e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-pink-500 transition-all cursor-pointer"
                >
                  {automationOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
