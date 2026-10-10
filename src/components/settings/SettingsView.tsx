import React, { useState } from 'react';
import { useSara } from '../../context/SaraContext';
import {
  User,
  ShieldCheck,
  Sliders,
  KeyRound,
  Check,
  ChevronRight,
  Plus,
  Trash2,
  Search,
  Sparkles,
  Volume2,
  Heart,
  Globe,
  HelpCircle,
  RotateCcw,
  BadgeCheck,
  Brain,
  Mic,
  MapPin,
  Bell,
  Radio,
  Database,
  Layers,
  AlertCircle,
  X,
} from 'lucide-react';
import { PersonalityPreset } from '../../types';
import { GestureMapView } from './GestureMapView';
import { AutomationsView } from '../automations/AutomationsView';
import { AuthModal } from '../auth/AuthModal';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    personalitySettings,
    updatePersonalitySettings,
    voiceSettings,
    updateVoiceSettings,
    memories,
    addMemory,
    removeMemory,
    toggleMemory,
    permissions,
    requestMicrophonePermission,
    requestLocationPermission,
    requestNotificationPermission,
    togglePermission,
    grantAllPermissions,
    speakText,
    screenControlEnabled,
    setScreenControlEnabled,
  } = useSara();

  const [activeTab, setActiveTab] = useState<'account' | 'perms' | 'controls' | 'api' | 'personality' | 'gesture' | 'automations'>('account');
  const [memorySearch, setMemorySearch] = useState<string>('');
  const [showAddMemoryModal, setShowAddMemoryModal] = useState<boolean>(false);
  const [newMemoryCategory, setNewMemoryCategory] = useState<any>('Personal');
  const [newMemoryText, setNewMemoryText] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [customGeminiKey, setCustomGeminiKey] = useState<string>(() => localStorage.getItem('sara_custom_gemini_key') || '');
  const [apiSavedMsg, setApiSavedMsg] = useState<boolean>(false);

  // Personality Presets
  const personalityPresets: Array<{ id: PersonalityPreset; label: string; desc: string }> = [
    { id: 'GirlFriend', label: 'GirlFriend', desc: 'Loving, caring, warm, highly affectionate and sweet.' },
    { id: 'Romantic', label: 'Romantic', desc: 'Poetic, gentle, playful, and deeply devoted.' },
    { id: 'Playful', label: 'Playful', desc: 'Witty, teasing, funny, cheerful and energetic.' },
    { id: 'Caring', label: 'Caring', desc: 'Supportive, nurturing, calm, comforting companion.' },
    { id: 'Friendly', label: 'Friendly', desc: 'Bright, casual, cheerful buddy and partner.' },
  ];

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;
    addMemory(newMemoryCategory, newMemoryText);
    setNewMemoryText('');
    setShowAddMemoryModal(false);
  };

  const filteredMemories = memories.filter((m) =>
    m.content.toLowerCase().includes(memorySearch.toLowerCase()) ||
    m.category.toLowerCase().includes(memorySearch.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto animate-in fade-in duration-300">
      <div className="text-center py-1">
        <h2 className="text-xl font-bold text-slate-100">Settings</h2>
      </div>

      {/* 4 Main Tabs matching screenshots #13, #14, #16 */}
      <div className="flex items-center justify-around border-b border-pink-500/20 pb-1">
        <button
          onClick={() => setActiveTab('account')}
          className={`py-2 px-3 text-xs font-bold tracking-wider uppercase transition-all relative ${
            activeTab === 'account' ? 'text-pink-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ACCOUNT
          {activeTab === 'account' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('perms')}
          className={`py-2 px-3 text-xs font-bold tracking-wider uppercase transition-all relative ${
            activeTab === 'perms' ? 'text-pink-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          PERMS
          {activeTab === 'perms' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('controls')}
          className={`py-2 px-3 text-xs font-bold tracking-wider uppercase transition-all relative ${
            activeTab === 'controls' ? 'text-pink-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          CONTROLS
          {activeTab === 'controls' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`py-2 px-3 text-xs font-bold tracking-wider uppercase transition-all relative ${
            activeTab === 'api' ? 'text-pink-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          API
          {activeTab === 'api' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('personality')}
          className={`py-2 px-3 text-xs font-bold tracking-wider uppercase transition-all relative ${
            activeTab === 'personality' ? 'text-pink-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AI/VOICE
          {activeTab === 'personality' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('gesture')}
          className={`py-2 px-3 text-xs font-bold tracking-wider uppercase transition-all relative ${
            activeTab === 'gesture' ? 'text-pink-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          GESTURE
          {activeTab === 'gesture' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('automations')}
          className={`py-2 px-3 text-xs font-bold tracking-wider uppercase transition-all relative ${
            activeTab === 'automations' ? 'text-pink-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AUTOMATIONS
          {activeTab === 'automations' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
          )}
        </button>
      </div>

      {/* GESTURE MAP TAB */}
      {activeTab === 'gesture' && <GestureMapView />}

      {/* AUTOMATIONS TAB */}
      {activeTab === 'automations' && <AutomationsView />}

      {/* 1. ACCOUNT TAB (screenshot #16) */}
      {activeTab === 'account' && (
        <div className="space-y-3">
          {/* User Profile Banner */}
          <div className="p-4 rounded-3xl glass-card border border-pink-500/20 flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
              {userProfile.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-slate-100">{userProfile.name}</h3>
                <BadgeCheck className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
              </div>
              <p className="text-xs text-slate-400">{userProfile.email}</p>
            </div>
          </div>

          {/* Account Settings Items */}
          <div className="rounded-3xl glass-card border border-pink-500/20 divide-y divide-slate-800 overflow-hidden">
            {/* Name */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Name</p>
                <p className="text-[11px] text-slate-400">Your companion display name</p>
              </div>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => updateUserProfile({ name: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1 text-xs text-pink-300 font-mono text-right focus:outline-none focus:border-pink-500 w-32"
              />
            </div>

            {/* Email */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Email</p>
                <p className="text-[11px] text-slate-400">Account identifier</p>
              </div>
              <span className="text-xs font-mono text-slate-400 truncate max-w-[170px]">
                {userProfile.email}
              </span>
            </div>

            {/* Personality */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Personality</p>
                <p className="text-[11px] text-slate-400">Choose Sara's personality</p>
              </div>
              <select
                value={userProfile.personality}
                onChange={(e) => updateUserProfile({ personality: e.target.value as any })}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1 text-xs text-pink-400 font-bold focus:outline-none focus:border-pink-500"
              >
                {personalityPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Voice */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Voice</p>
                <p className="text-[11px] text-slate-400">Gemini 3.8 TTS voice</p>
              </div>
              <select
                value={voiceSettings.voice}
                onChange={(e) => updateVoiceSettings({ voice: e.target.value as any })}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1 text-xs text-purple-400 font-bold focus:outline-none focus:border-pink-500"
              >
                <option value="Zephyr">Zephyr (Warm Female)</option>
                <option value="Kore">Kore (Soft & Gentle)</option>
                <option value="Aoede">Aoede (Bright & Melodic)</option>
                <option value="Puck">Puck (Playful & Energetic)</option>
                <option value="Fenrir">Fenrir (Deep & Confident)</option>
              </select>
            </div>

            {/* Language */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Language</p>
                <p className="text-[11px] text-slate-400">Conversational language</p>
              </div>
              <select
                value={userProfile.language}
                onChange={(e) => updateUserProfile({ language: e.target.value as any })}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1 text-xs text-cyan-400 font-bold focus:outline-none focus:border-pink-500"
              >
                <option value="Bengali">Bengali (বাংলা)</option>
                <option value="Banglish">Banglish</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
              </select>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-1">
            <button
              onClick={() => {
                updateUserProfile({ name: 'Guest', email: '', avatarUrl: '' });
                speakText('সফলভাবে লগআউট করা হয়েছে। আবার লগইন করো সোনা! ❤️', 'caring');
                setShowAuthModal(true);
              }}
              className="w-full py-3 rounded-2xl bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>লগআউট করুন (Log Out & Sign Out)</span>
            </button>
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* 2. PERMS TAB (Interactive User-Granted Permission Center) */}
      {activeTab === 'perms' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Permission Status Box */}
          {(() => {
            const grantedCount = [
              permissions.microphone === 'granted',
              permissions.location === 'granted',
              permissions.notifications === 'granted',
              permissions.wakeWord,
              permissions.persistentMemory,
              permissions.audioPlayback,
              permissions.floatingOverlay,
            ].filter(Boolean).length;

            return (
              <div className="p-4 rounded-3xl glass-card-pink border border-pink-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                    <span>Permission Center</span>
                    <Sparkles className="w-4 h-4 text-pink-400" />
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    ইউজার নিজে থেকে পারমিশন দিতে এবং নিয়ন্ত্রণ করতে পারবেন
                  </p>
                  <button
                    onClick={() => grantAllPermissions()}
                    className="mt-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_12px_rgba(255,46,147,0.4)] active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>সব পারমিশন একসাথে দিন (Grant All)</span>
                  </button>
                </div>
                {/* Dynamic Circular Badge */}
                <div className="w-16 h-16 rounded-full border-2 border-purple-500 flex flex-col items-center justify-center text-center bg-purple-950/40 shrink-0">
                  <span className="text-base font-extrabold text-white font-mono">{grantedCount}/7</span>
                  <span className="text-[8px] text-purple-300 uppercase font-bold tracking-wider">Granted</span>
                </div>
              </div>
            );
          })()}

          {/* USER CONTROLLED PERMISSIONS Header */}
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              USER PERMISSIONS & ACCESS CONTROL
            </p>
            <span className="text-[10px] text-pink-400 font-medium">Click to toggle or grant</span>
          </div>

          <div className="space-y-2.5">
            {/* 1. Microphone */}
            <div className="p-3.5 rounded-2xl glass-card border border-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-400 shrink-0 mt-0.5">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-100">Microphone (মাইক্রোফোন)</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        permissions.microphone === 'granted'
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                          : permissions.microphone === 'denied'
                          ? 'bg-rose-950/80 border-rose-500/40 text-rose-400'
                          : 'bg-amber-950/80 border-amber-500/40 text-amber-400'
                      }`}
                    >
                      {permissions.microphone === 'granted' ? (
                        <>
                          <Check className="w-2.5 h-2.5" />
                          <span>অনুমোদিত (Granted)</span>
                        </>
                      ) : permissions.microphone === 'denied' ? (
                        <>
                          <X className="w-2.5 h-2.5" />
                          <span>বাতিল (Denied)</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>অনুমোদন প্রয়োজন (Prompt)</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    রিয়েল-টাইম ভয়েস কমান্ড ও সারার সাথে কথা বলার জন্য মাইক পারমিশন।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {permissions.microphone !== 'granted' && (
                  <button
                    onClick={() => requestMicrophonePermission()}
                    className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                  >
                    অনুমতি দিন
                  </button>
                )}
                <button
                  onClick={() => togglePermission('microphone')}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    permissions.microphone === 'granted' ? 'bg-pink-600' : 'bg-slate-700'
                  }`}
                  aria-label="Toggle Microphone"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      permissions.microphone === 'granted' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 2. Location */}
            <div className="p-3.5 rounded-2xl glass-card border border-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-100">Precise Location (লাইভ লোকেশন)</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        permissions.location === 'granted'
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                          : permissions.location === 'denied'
                          ? 'bg-rose-950/80 border-rose-500/40 text-rose-400'
                          : 'bg-amber-950/80 border-amber-500/40 text-amber-400'
                      }`}
                    >
                      {permissions.location === 'granted' ? (
                        <>
                          <Check className="w-2.5 h-2.5" />
                          <span>অনুমোদিত (Granted)</span>
                        </>
                      ) : permissions.location === 'denied' ? (
                        <>
                          <X className="w-2.5 h-2.5" />
                          <span>বাতিল (Denied)</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>অনুমোদন প্রয়োজন (Prompt)</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    তোমার এলাকার রিয়েল আবহাওয়া এবং গুগল ম্যাপস গ্রাউন্ডিংয়ের জন্য।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {permissions.location !== 'granted' && (
                  <button
                    onClick={() => requestLocationPermission()}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                  >
                    অনুমতি দিন
                  </button>
                )}
                <button
                  onClick={() => togglePermission('location')}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    permissions.location === 'granted' ? 'bg-cyan-600' : 'bg-slate-700'
                  }`}
                  aria-label="Toggle Location"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      permissions.location === 'granted' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 3. Post Notifications */}
            <div className="p-3.5 rounded-2xl glass-card border border-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-100">Notifications (নোটিফিকেশন)</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        permissions.notifications === 'granted'
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                          : permissions.notifications === 'denied'
                          ? 'bg-rose-950/80 border-rose-500/40 text-rose-400'
                          : 'bg-amber-950/80 border-amber-500/40 text-amber-400'
                      }`}
                    >
                      {permissions.notifications === 'granted' ? (
                        <>
                          <Check className="w-2.5 h-2.5" />
                          <span>সক্রিয় (Active)</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>নিষ্ক্রিয় (Disabled)</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ডেইলি রিওয়ার্ড রিমাইন্ডার ও সারার ভালোবাসার মেসেজ পাওয়ার জন্য।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {permissions.notifications !== 'granted' && (
                  <button
                    onClick={() => requestNotificationPermission()}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                  >
                    অনুমতি দিন
                  </button>
                )}
                <button
                  onClick={() => togglePermission('notifications')}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    permissions.notifications === 'granted' ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                  aria-label="Toggle Notifications"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      permissions.notifications === 'granted' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 4. Wake Word Background Listening */}
            <div className="p-3.5 rounded-2xl glass-card border border-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-100">Wake Word (হ্যান্ডস-ফ্রি ওয়েক ওয়ার্ড)</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        permissions.wakeWord
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {permissions.wakeWord ? 'চালু (ON)' : 'বন্ধ (OFF)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    "Hey SARA" বা "সারা" বললে স্বয়ংক্রিয়ভাবে ভয়েস মোড চালু হবে।
                  </p>
                </div>
              </div>

              <button
                onClick={() => togglePermission('wakeWord')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 self-end sm:self-center ${
                  permissions.wakeWord ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
                aria-label="Toggle Wake Word"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    permissions.wakeWord ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 5. Persistent Memories */}
            <div className="p-3.5 rounded-2xl glass-card border border-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-100">Memory Storage (মেমোরি ও স্টোরেজ)</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        permissions.persistentMemory
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {permissions.persistentMemory ? 'অনুমোদিত (Granted)' : 'বন্ধ (Disabled)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    তোমার পছন্দ, প্রিয় বিষয় ও কথোপকথন স্থানীয়ভাবে সংরক্ষণ করার অনুমতি।
                  </p>
                </div>
              </div>

              <button
                onClick={() => togglePermission('persistentMemory')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 self-end sm:self-center ${
                  permissions.persistentMemory ? 'bg-amber-600' : 'bg-slate-700'
                }`}
                aria-label="Toggle Persistent Memory"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    permissions.persistentMemory ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 6. Audio & Speech Output */}
            <div className="p-3.5 rounded-2xl glass-card border border-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-100">Speech Audio (ভয়েস আউটপুট)</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        permissions.audioPlayback
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {permissions.audioPlayback ? 'অনুমোদিত (Granted)' : 'বন্ধ (Disabled)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    বাংলা ও ইংরেজিতে সারার মিষ্টি কণ্ঠস্বর শোনার অনুমতি।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => speakText('পারমিশন চেক সম্পূর্ণ হয়েছে বাবু! আমি তোমার কথা শুনছি। ❤️', 'romantic')}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  ভয়েস টেস্ট
                </button>
                <button
                  onClick={() => togglePermission('audioPlayback')}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    permissions.audioPlayback ? 'bg-rose-600' : 'bg-slate-700'
                  }`}
                  aria-label="Toggle Audio Playback"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      permissions.audioPlayback ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 7. Display Over Other Apps / Floating Widget */}
            <div className="p-3.5 rounded-2xl glass-card border border-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-100">Floating Overlay (ওভারলে পারমিশন)</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        permissions.floatingOverlay
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {permissions.floatingOverlay ? 'চালু (ON)' : 'বন্ধ (OFF)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    স্ক্রিনে দ্রুত যোগাযোগের জন্য ভাসমান সারার বাটন ও উইজেট প্রদর্শন।
                  </p>
                </div>
              </div>

              <button
                onClick={() => togglePermission('floatingOverlay')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 self-end sm:self-center ${
                  permissions.floatingOverlay ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
                aria-label="Toggle Floating Overlay"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    permissions.floatingOverlay ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 8. Device Screen Control (স্ক্রিন কন্ট্রোল) */}
            <div className="p-3.5 rounded-2xl glass-card border border-pink-500/30 bg-gradient-to-r from-pink-950/30 to-purple-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-100">Device Screen Control (ডিভাইস স্ক্রিন কন্ট্রোল)</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        screenControlEnabled
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {screenControlEnabled ? 'সক্রিয় (ACTIVE)' : 'বন্ধ (OFF)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    মুখে বলে ফেসবুক, ইউটিউব ওপেন করা, মুভি সার্চ বা স্ট্যাটাস পোস্ট করার অনুমতি।
                  </p>
                </div>
              </div>

              <button
                onClick={() => setScreenControlEnabled(!screenControlEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 self-end sm:self-center ${
                  screenControlEnabled ? 'bg-pink-600' : 'bg-slate-700'
                }`}
                aria-label="Toggle Screen Control"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    screenControlEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTROLS TAB (MEMORIES) (screenshot #13) */}
      {activeTab === 'controls' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">My Memories</h3>
              <p className="text-xs text-slate-400">
                {memories.length} memories saved for Sara
              </p>
            </div>
            <button
              onClick={() => setShowAddMemoryModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs tracking-wider flex items-center gap-1 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={memorySearch}
              onChange={(e) => setMemorySearch(e.target.value)}
              placeholder="Search memories..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Memory List */}
          {filteredMemories.length === 0 ? (
            <div className="p-8 text-center glass-card rounded-3xl border border-pink-500/20 space-y-2">
              <Brain className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-200">No memories yet</h4>
              <p className="text-xs text-slate-400">
                Tap + Add to save something Sara will remember for you
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMemories.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl glass-card border border-pink-500/15 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-950/80 border border-pink-500/30 text-pink-300">
                      {m.category}
                    </span>
                    <p className="text-slate-200 font-medium">{m.content}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Saved {m.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleMemory(m.id)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        m.active ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {m.active ? 'Active' : 'Off'}
                    </button>
                    <button
                      onClick={() => removeMemory(m.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Memory Modal */}
          {showAddMemoryModal && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-3xl glass-card-pink border border-pink-500/40 p-5 shadow-2xl space-y-3">
                <h3 className="text-sm font-bold text-white">Add New Memory for Sara</h3>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Category</label>
                  <select
                    value={newMemoryCategory}
                    onChange={(e) => setNewMemoryCategory(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Preferences">Preferences</option>
                    <option value="Projects">Projects</option>
                    <option value="Important Dates">Important Dates</option>
                    <option value="Work">Work</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Memory Content</label>
                  <textarea
                    rows={3}
                    value={newMemoryText}
                    onChange={(e) => setNewMemoryText(e.target.value)}
                    placeholder="e.g. My favorite food is biryani, I celebrate my birthday on Dec 14..."
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowAddMemoryModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMemory}
                    className="flex-1 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold"
                  >
                    Save Memory
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. API TAB (screenshot #13) */}
      {activeTab === 'api' && (
        <div className="space-y-3">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">
            CONNECTED APIS
          </p>

          <div className="space-y-3">
            {/* Gemini API */}
            <div className="p-4 rounded-3xl glass-card border border-pink-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-pink-500/15 flex items-center justify-center text-pink-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Gemini API Key (ইউজার জেমিনি এপিআই কি)</h4>
                    <p className="text-[11px] text-slate-400">Enter your own API key & connect</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${customGeminiKey ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                  {customGeminiKey ? 'Custom Connected' : 'Default / Active'}
                </span>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                localStorage.setItem('sara_custom_gemini_key', customGeminiKey.trim());
                setApiSavedMsg(true);
                speakText('জেমিনি এপিআই কি সফলভাবে কানেক্ট ও সেভ করা হয়েছে বাবু! ❤️', 'happy');
                setTimeout(() => setApiSavedMsg(false), 3000);
              }} className="space-y-2.5">
                <input
                  type="password"
                  value={customGeminiKey}
                  onChange={(e) => setCustomGeminiKey(e.target.value)}
                  placeholder="AIzaSy... (Enter your custom Gemini API key)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-pink-300 font-mono focus:outline-none focus:border-pink-500"
                />
                <div className="flex items-center justify-between">
                  {apiSavedMsg ? (
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>সফলভাবে কানেক্ট করা হয়েছে! (Connected Successfully)</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">নন-স্টপ ব্যবহারের জন্য নিজস্ব এপিআই কি বসান।</span>
                  )}
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>সাবমিট (Connect)</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Google Maps Grounding API */}
            <div className="p-4 rounded-3xl glass-card border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Google Maps Grounding</h4>
                    <p className="text-[11px] text-slate-400">Real-time Places & Geolocation</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  Active
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">gemini-3.5-flash with googleMaps tool</span>
                <span className="text-[10px] text-cyan-400 font-sans font-bold">READY</span>
              </div>
            </div>

            {/* Science Skills API */}
            <div className="p-4 rounded-3xl glass-card border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-500/15 flex items-center justify-center text-purple-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">DeepMind Science Skills</h4>
                    <p className="text-[11px] text-slate-400">AlphaFold DB, UniProtKB, PubChem, PubMed</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  Active
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Authoritative Public Biomedical APIs</span>
                <span className="text-[10px] text-purple-400 font-sans font-bold">CONNECTED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. AI / VOICE & PERSONALITY SLIDERS TAB */}
      {activeTab === 'personality' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl glass-card border border-pink-500/20 space-y-3">
            <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider">
              Sara Companion Emotion Sliders
            </h3>

            {/* Warmth Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Warmth & Kindness</span>
                <span className="font-mono text-pink-400 font-bold">{personalitySettings.warmth}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={personalitySettings.warmth}
                onChange={(e) => updatePersonalitySettings({ warmth: Number(e.target.value) })}
                className="w-full accent-pink-500"
              />
            </div>

            {/* Romance Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Romance & Intimacy</span>
                <span className="font-mono text-pink-400 font-bold">{personalitySettings.romance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={personalitySettings.romance}
                onChange={(e) => updatePersonalitySettings({ romance: Number(e.target.value) })}
                className="w-full accent-pink-500"
              />
            </div>

            {/* Playfulness Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Playfulness & Teasing</span>
                <span className="font-mono text-purple-400 font-bold">{personalitySettings.playfulness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={personalitySettings.playfulness}
                onChange={(e) => updatePersonalitySettings({ playfulness: Number(e.target.value) })}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Affection Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Affection & Closeness</span>
                <span className="font-mono text-rose-400 font-bold">{personalitySettings.affection}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={personalitySettings.affection}
                onChange={(e) => updatePersonalitySettings({ affection: Number(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>
          </div>

          {/* Voice Speech Speed */}
          <div className="p-4 rounded-3xl glass-card border border-pink-500/20 space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Speech Synthesis Configuration
            </h3>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Speech Rate (Speed)</span>
              <span className="font-mono text-cyan-400 font-bold">{voiceSettings.speed}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={voiceSettings.speed}
              onChange={(e) => updateVoiceSettings({ speed: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};
