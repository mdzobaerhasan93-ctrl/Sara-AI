import React, { useState } from 'react';
import {
  X,
  Play,
  Sparkles,
  Bot,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  ArrowRight,
  Smartphone,
  Plus,
  Send,
  Loader2,
  Mic,
  Camera,
  MessageCircle,
  Tv,
  Globe,
  Settings,
  Share2
} from 'lucide-react';
import { useSara } from '../../context/SaraContext';
import { AppInventoryService, AppDefinition, InAppAction } from '../../services/AppInventoryService';
import { AIAgentService } from '../../services/AIAgentService';
import { dispatchDirectAppAction } from '../../services/DirectAppExecution';

interface DirectAppControllerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoice?: () => void;
}

export const DirectAppControllerModal: React.FC<DirectAppControllerModalProps> = ({
  isOpen,
  onClose,
  onOpenVoice,
}) => {
  const { speakText, addActivityLog, screenControlEnabled, permissions, availableApps, registerCustomApp } = useSara();

  const apps = availableApps;
  const [selectedApp, setSelectedApp] = useState<AppDefinition>(apps[0] || null);
  const [selectedAction, setSelectedAction] = useState<InAppAction | null>(null);
  const [customPayload, setCustomPayload] = useState<string>('');
  const [customVoicePrompt, setCustomVoicePrompt] = useState<string>('');

  // Live in-app execution state
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionSteps, setExecutionSteps] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [executionSuccess, setExecutionSuccess] = useState<boolean>(false);
  const [executionPending, setExecutionPending] = useState<boolean>(false);
  const [executionFailed, setExecutionFailed] = useState<boolean>(false);
  const [executionMessage, setExecutionMessage] = useState<string>('');

  // New Custom App Registration Modal
  const [showAddAppModal, setShowAddAppModal] = useState<boolean>(false);
  const [newAppName, setNewAppName] = useState<string>('');
  const [newAppPkg, setNewAppPkg] = useState<string>('');
  const [newAppCategory, setNewAppCategory] = useState<AppDefinition['category']>('social');
  const hasNativeAccessibilityBridge = typeof window !== 'undefined' && typeof (window as any).AndroidBridge?.performAccessibilityAction === 'function';

  if (!isOpen) return null;

  // Dispatch only through a native bridge; never simulate device actions as completed.
  const handleExecuteAction = async (app: AppDefinition, action: InAppAction, payload?: string) => {
    const finalPayload = payload || customPayload || action.defaultPayload || '';
    setIsExecuting(true);
    setExecutionSuccess(false);
    setExecutionPending(false);
    setExecutionFailed(false);
    setExecutionMessage('');
    setCurrentStepIndex(-1);
    setExecutionSteps(['Checking native Android bridge availability…']);

    const bridge = typeof window !== 'undefined' ? (window as any).AndroidBridge : undefined;
    const result = await dispatchDirectAppAction(bridge, {
      packageName: app.packageName,
      actionId: action.id,
      payload: finalPayload,
    });

    setIsExecuting(false);
    setCurrentStepIndex(-1);
    setExecutionMessage(result.message);

    if (result.status === 'SUCCESS') {
      setExecutionSuccess(true);
      setExecutionPending(false);
      setExecutionFailed(false);
      setExecutionSteps([
        'Native bridge dispatched the requested action.',
        'Native bridge explicitly confirmed completion.',
      ]);
      const confirmation = `বাবু, ${app.bengaliName}-এ "${action.bengaliName}" কাজটি native bridge থেকে সম্পন্ন হওয়ার confirmation পেয়েছি। ❤️`;
      speakText(confirmation, 'happy');
      addActivityLog({
        title: `In-App Control Completed: ${app.name} -> ${action.name}`,
        type: 'action',
        service: 'Android Accessibility Bridge',
        status: 'SUCCESS',
        details: `Native bridge confirmed completion for action ID ${action.id}. Message contents were not stored in this log.`,
      });
      return;
    }

    if (result.status === 'PENDING') {
      setExecutionSuccess(false);
      setExecutionPending(true);
      setExecutionFailed(false);
      setExecutionSteps([
        'Command was handed to the native bridge.',
        'Waiting for explicit completion confirmation.',
      ]);
      speakText('সোনা, native bridge কমান্ডটি গ্রহণ করেছে, কিন্তু কাজ সম্পন্ন হওয়ার confirmation পাওয়া যায়নি। target app দেখে নিশ্চিত হও।', 'caring');
      addActivityLog({
        title: `In-App Control Pending: ${app.name} -> ${action.name}`,
        type: 'action',
        service: 'Android Accessibility Bridge',
        status: 'PENDING',
        details: `Native bridge did not explicitly verify completion for action ID ${action.id}. No success claim was made.`,
      });
      return;
    }

    setExecutionSuccess(false);
    setExecutionPending(false);
    setExecutionFailed(true);
    setExecutionSteps([
      'Native Android bridge is unavailable or rejected the request.',
      'No successful app action was confirmed.',
    ]);
    const failure = `বাবু, ${app.bengaliName}-এ কাজটি চালানো যায়নি। ${result.message}`;
    speakText(failure, 'caring');
    addActivityLog({
      title: `In-App Control Not Executed: ${app.name} -> ${action.name}`,
      type: 'action',
      service: 'Android Accessibility Bridge',
      status: 'FAILED',
      details: `No successful app action was confirmed for action ID ${action.id}. ${result.message}`,
    });
  };

  // Handle custom voice/text instruction
  const handleRunCustomPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVoicePrompt.trim()) return;
    const prompt = customVoicePrompt;
    setCustomVoicePrompt('');

    // Check if it's an AI Agent Command (e.g. YouTube movie search, Facebook post comment)
    if (AIAgentService.isAgentCommand(prompt)) {
      setIsExecuting(true);
      setExecutionSuccess(false);
      speakText(`সোনা, আমি "${prompt}" নির্দেশ অনুযায়ী এআই এজেন্ট রান করছি ❤️`, 'excited');
      
      const agentRes = await AIAgentService.executeCommand(prompt, (step) => {
        setExecutionSteps((prev) => [...prev, `${step.title}: ${step.detail}`]);
      });

      setExecutionSteps(agentRes.steps.map((s) => `${s.title}: ${s.detail}`));
      setExecutionSuccess(agentRes.success);
      setExecutionPending(false);
      setExecutionFailed(!agentRes.success);
      setExecutionMessage(agentRes.message);
      setIsExecuting(false);
      speakText(agentRes.message, agentRes.success ? 'happy' : 'caring');
      return;
    }

    const parsed = AppInventoryService.parseCommand(prompt);
    if (parsed.app) {
      const targetAction = parsed.action || parsed.app.actions[0];
      handleExecuteAction(parsed.app, targetAction, prompt);
    } else {
      speakText(`সোনা, আমি "${prompt}" নির্দেশটি এআই এজেন্টের মাধ্যমে প্রসেস করছি ❤️`, 'caring');
      setIsExecuting(true);
      setExecutionSuccess(false);
      const agentRes = await AIAgentService.executeCommand(prompt, (step) => {
        setExecutionSteps((prev) => [...prev, `${step.title}: ${step.detail}`]);
      });
      setExecutionSteps(agentRes.steps.map((s) => `${s.title}: ${s.detail}`));
      setExecutionSuccess(agentRes.success);
      setExecutionPending(false);
      setExecutionFailed(!agentRes.success);
      setExecutionMessage(agentRes.message);
      setIsExecuting(false);
      speakText(agentRes.message, agentRes.success ? 'happy' : 'caring');
    }
  };

  // Register user's custom phone app
  const handleSaveCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppPkg.trim()) return;

    const newApp: AppDefinition = {
      id: newAppName.toLowerCase().replace(/\s+/g, '_'),
      name: newAppName,
      bengaliName: newAppName,
      packageName: newAppPkg,
      launchUri: `${newAppName.toLowerCase()}://`,
      webFallbackUrl: '',
      category: newAppCategory,
      iconColor: '#EC4899',
      accentBg: 'from-pink-600/30 to-purple-600/20',
      actions: [
        {
          id: 'launch_and_control',
          name: 'Direct Open & Accessibility Control',
          bengaliName: 'অ্যাপে ঢুকে অটোমেশন করো',
          description: 'অ্যাপের ভেতর এক্সেসিবিলিটি কন্ট্রোল পরিচালনা করো',
          steps: [
            `Launching ${newAppPkg} via Android bridge`,
            'Injecting UI hierarchy accessibility listener',
            'Executing AI touch and navigation automation',
            'Task finished successfully!'
          ]
        }
      ]
    };

    registerCustomApp(newApp);
    setSelectedApp(newApp);
    setShowAddAppModal(false);
    setNewAppName('');
    setNewAppPkg('');
    speakText(`আপনার নতুন অ্যাপ '${newApp.name}' কন্ট্রোল সিস্টেমে যুক্ত করা হয়েছে! ❤️`, 'happy');
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#09071c] border border-pink-500/35 rounded-3xl shadow-[0_0_50px_rgba(255,46,147,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 border-b border-pink-500/20 bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-[#09071c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,46,147,0.5)]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-cyan-300">
                  সরাসরি অ্যাপ কন্ট্রোলার ও অটোমেশন
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 ${hasNativeAccessibilityBridge ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasNativeAccessibilityBridge ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  {hasNativeAccessibilityBridge ? 'NATIVE BRIDGE FOUND' : 'NATIVE BRIDGE UNAVAILABLE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Native Android bridge থাকলেই supported device actions পাঠানো যাবে; browser preview-তে app control চলে না।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddAppModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-xs font-bold flex items-center gap-1 transition-all"
              title="নতুন অ্যাপ যোগ করুন"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>অ্যাপ যোগ</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Natural Language Voice Prompt Input */}
        <div className="px-4 py-2.5 bg-slate-900/50 border-b border-pink-500/15">
          <form onSubmit={handleRunCustomPrompt} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={customVoicePrompt}
                onChange={(e) => setCustomVoicePrompt(e.target.value)}
                placeholder="যেমন: ইনস্টাগ্রামে রিলস দেখে কমেন্ট করো, বা ফেসবুকে পোস্ট দাও..."
                className="w-full pl-9 pr-3 py-2 rounded-2xl bg-slate-950/80 border border-pink-500/30 focus:border-pink-400 focus:outline-none text-xs text-slate-200 placeholder:text-slate-500"
              />
              <Sparkles className="w-4 h-4 text-pink-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,46,147,0.4)] active:scale-95 transition-all"
            >
              <span>চালাও</span>
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* 1. App Selection Chips Horizontal Scroll */}
          <div>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>ফোনে থাকা অ্যাপস নির্বাচন করুন:</span>
              <span className="text-pink-400 lowercase font-normal">{apps.length} টি অ্যাপ যুক্ত আছে</span>
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {apps.map((app) => {
                const isSelected = selectedApp.id === app.id;
                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      setSelectedApp(app);
                      setSelectedAction(app.actions[0] || null);
                      setCustomPayload('');
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all shrink-0 text-left ${
                      isSelected
                        ? 'bg-pink-600/30 border-pink-400 text-white shadow-[0_0_15px_rgba(255,46,147,0.3)] scale-102'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: app.iconColor, color: '#fff' }}
                    >
                      {app.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">{app.bengaliName}</p>
                      <p className="text-[9px] text-slate-400">{app.category}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Selected App Direct In-App Actions */}
          {selectedApp && (
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-pink-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-extrabold text-base shadow-md"
                    style={{ backgroundColor: selectedApp.iconColor }}
                  >
                    {selectedApp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{selectedApp.bengaliName} ({selectedApp.name})</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {selectedApp.packageName}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      নিচের action-টি native bridge-এ dispatch করার চেষ্টা হবে; completion কেবল explicit confirmation পেলে success দেখাবে।
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    AppInventoryService.launchAppSafely(selectedApp);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <span>সরাসরি লঞ্চ</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Action List */}
              <div className="space-y-2 pt-1">
                {selectedApp.actions.map((act) => {
                  const isActSelected = selectedAction?.id === act.id;
                  return (
                    <div
                      key={act.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isActSelected
                          ? 'bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-900 border-pink-500/50'
                          : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          onClick={() => setSelectedAction(act)}
                          className="cursor-pointer flex-1"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-pink-300">{act.bengaliName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({act.name})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{act.description}</p>
                        </div>

                        <button
                          onClick={() => handleExecuteAction(selectedApp, act)}
                          disabled={isExecuting}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,46,147,0.4)] active:scale-95 disabled:opacity-50 transition-all"
                        >
                          {isExecuting && selectedAction?.id === act.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                          <span>কন্ট্রোল করো</span>
                        </button>
                      </div>

                      {/* Custom Input Field if action requires payload */}
                      {act.requiresInput && isActSelected && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-2">
                          <input
                            type="text"
                            value={customPayload}
                            onChange={(e) => setCustomPayload(e.target.value)}
                            placeholder={act.inputPlaceholder || 'কাস্টম বার্তা বা ইনপুট লিখুন...'}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-pink-500/30 focus:border-pink-400 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
                          />
                          <button
                            onClick={() => handleExecuteAction(selectedApp, act, customPayload)}
                            disabled={isExecuting}
                            className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold"
                          >
                            পাঠাও
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Live In-App Execution HUD & Accessibility Stream */}
          {(isExecuting || executionSuccess || executionPending || executionFailed) && (
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0c0924] to-[#12071f] border border-pink-500/40 shadow-[0_0_25px_rgba(255,46,147,0.2)] animate-in zoom-in-95 space-y-3">
              <div className="flex items-center justify-between border-b border-pink-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isExecuting ? 'bg-pink-500 animate-ping' : executionSuccess ? 'bg-emerald-400' : executionPending ? 'bg-amber-400' : 'bg-rose-400'}`} />
                  <span className="text-xs font-bold text-pink-300">
                    {isExecuting ? 'Native bridge availability যাচাই হচ্ছে…' : executionSuccess ? 'Native bridge completion confirm করেছে' : executionPending ? 'Bridge-এ পাঠানো হয়েছে; completion unverified' : 'অ্যাকশন চালানো হয়নি'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300">
                  {selectedApp.packageName}
                </span>
              </div>

              {/* Execution Steps */}
              <div className="space-y-2">
                {executionSteps.map((step, idx) => {
                  const isDone = executionSuccess;
                  const isCurrent = isExecuting && idx === 0;

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 text-xs transition-all ${
                        isDone
                          ? 'text-emerald-300'
                          : isCurrent
                          ? 'text-pink-300 font-bold scale-101'
                          : executionFailed
                            ? 'text-rose-300'
                            : executionPending
                              ? 'text-amber-200'
                              : 'text-slate-500'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
                        ) : executionFailed ? (
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px]">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <span className="font-mono text-[11px] leading-relaxed">{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Native accessibility capability status */}
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Shield className={`w-4 h-4 shrink-0 mt-0.5 ${hasNativeAccessibilityBridge ? 'text-emerald-400' : 'text-rose-400'}`} />
            <div>
              <p className="font-bold text-slate-300">Native Android bridge status</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {hasNativeAccessibilityBridge
                  ? 'Bridge detected. An action is not considered complete unless the bridge returns an explicit success and completion acknowledgement.'
                  : 'বর্তমান environment-এ native Android accessibility bridge পাওয়া যায়নি। এখানে অন্য app-এর ভিতরে tap, type, comment বা message action চালানো হবে না।'}
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-pink-500/20 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hasNativeAccessibilityBridge ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span className="text-[11px] text-slate-300 font-semibold">
              {hasNativeAccessibilityBridge ? 'Native bridge detected' : 'Browser-only mode · device control unavailable'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>

      {/* Add Custom App Dialog */}
      {showAddAppModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e0a24] border border-pink-500/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-pink-300">ফোনের নতুন অ্যাপ যুক্ত করুন</h3>
              <button
                onClick={() => setShowAddAppModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomApp} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">অ্যাপের নাম:</label>
                <input
                  type="text"
                  required
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="যেমন: Bkash, Telegram, CapCut..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Package Name / URI Scheme:</label>
                <input
                  type="text"
                  required
                  value={newAppPkg}
                  onChange={(e) => setNewAppPkg(e.target.value)}
                  placeholder="যেমন: com.bKash.customerapp বা tg://"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">ক্যাটাগরি:</label>
                <select
                  value={newAppCategory}
                  onChange={(e) => setNewAppCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="social">Social</option>
                  <option value="video">Video</option>
                  <option value="chat">Chat</option>
                  <option value="productivity">Productivity</option>
                  <option value="camera">Camera</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAppModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
