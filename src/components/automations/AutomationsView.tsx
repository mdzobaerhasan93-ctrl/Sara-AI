import React, { useState } from 'react';
import { useSara } from '../../context/SaraContext';
import { Zap, Clock, Plus, Play, Trash2, X, Sparkles, Bot } from 'lucide-react';

export const AutomationsView: React.FC = () => {
  const { automations, toggleAutomation, addAutomation, deleteAutomation, runAutomation } = useSara();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [schedule, setSchedule] = useState<string>('10:00 PM Daily');
  const [action, setAction] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !action.trim()) return;
    setIsSubmitting(true);
    addAutomation(name.trim(), schedule.trim(), action.trim());
    setName('');
    setAction('');
    setIsSubmitting(false);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto px-4 md:px-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-6 h-6 text-pink-400" />
            <span>AI Automations & Routine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sara manages your schedules, alarms, reminders & background routines in real-time.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(255,46,147,0.4)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New AI Automation</span>
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card border border-pink-500/40 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-[0_0_40px_rgba(255,46,147,0.3)] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-pink-400 font-bold">
                <Sparkles className="w-5 h-5" />
                <span>Create AI Automation Task</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  টাস্কের নাম (Task Name)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: রাতের এলার্ম ও ঘুমের তাগাদা"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  সময় বা শিডিউল (Schedule)
                </label>
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="যেমন: 10:00 PM Daily বা Every 3 Hours"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  এআই নির্দেশনা ও বিবরণ (AI Action Prompt)
                </label>
                <textarea
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="যেমন: আমাকে রাত ১০ টায় এলার্ম সেট করে ডেকে দিও এবং আজকের সারসংক্ষেপ শুনিও।"
                  required
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-pink-500 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(255,46,147,0.4)]"
                >
                  {isSubmitting ? 'সেভ হচ্ছে...' : 'তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Automations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automations.map((auto) => (
          <div
            key={auto.id}
            className="p-5 rounded-3xl glass-card border border-pink-500/20 space-y-3 flex flex-col justify-between hover:border-pink-500/40 transition-all shadow-lg"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                      auto.enabled ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{auto.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span className="font-mono text-cyan-400">{auto.schedule}</span>
                    </div>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => toggleAutomation(auto.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    auto.enabled ? 'bg-pink-600' : 'bg-slate-700'
                  }`}
                  aria-label="Toggle automation"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      auto.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                {auto.action}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <span className="text-[10px] text-slate-400 font-mono">
                {auto.lastRun ? `Last: ${auto.lastRun}` : 'Not run yet'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteAutomation(auto.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete Automation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => runAutomation(auto.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Play className="w-3 h-3" />
                  <span>Run Now</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
