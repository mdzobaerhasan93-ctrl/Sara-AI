import React, { useState } from 'react';
import { useSara } from '../../context/SaraContext';
import { Zap, Clock, Plus, Play, Pause, Trash2, CheckCircle2 } from 'lucide-react';

export const AutomationsView: React.FC = () => {
  const { automations, toggleAutomation, addActivityLog, speakText } = useSara();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [schedule, setSchedule] = useState<string>('09:00 AM Daily');
  const [action, setAction] = useState<string>('');

  const handleRunNow = (auto: typeof automations[0]) => {
    addActivityLog({
      title: `Automation triggered: ${auto.name}`,
      type: 'automation',
      service: 'Automation Hub',
      status: 'SUCCESS',
      details: auto.action,
    });
    speakText(`অটোমেশন সম্পন্ন হয়েছে: ${auto.name} ❤️`, 'happy');
  };

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Automations</h2>
          <p className="text-xs text-slate-400">Sara's automated routines and scheduled companion tasks</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {automations.map((auto) => (
          <div
            key={auto.id}
            className="p-4 rounded-3xl glass-card border border-pink-500/20 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
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
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    auto.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-300 pl-1">{auto.action}</p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-[10px] text-slate-400 font-mono">
                {auto.lastRun ? `Last run: ${auto.lastRun}` : 'Not run yet'}
              </span>
              <button
                onClick={() => handleRunNow(auto)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Play className="w-3 h-3" />
                <span>Run Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
