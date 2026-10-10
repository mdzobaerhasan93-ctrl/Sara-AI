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
} from 'lucide-react';
import { PersonalityPreset } from '../../types';

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
  } = useSara();

  const [activeTab, setActiveTab] = useState<'account' | 'perms' | 'controls' | 'api' | 'personality'>('account');
  const [memorySearch, setMemorySearch] = useState<string>('');
  const [showAddMemoryModal, setShowAddMemoryModal] = useState<boolean>(false);
  const [newMemoryCategory, setNewMemoryCategory] = useState<any>('Personal');
  const [newMemoryText, setNewMemoryText] = useState<string>('');

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
      </div>

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
        </div>
      )}

      {/* 2. PERMS TAB (screenshots #13 & #14) */}
      {activeTab === 'perms' && (
        <div className="space-y-4">
          {/* Permission Status Box */}
          <div className="p-4 rounded-3xl glass-card-pink border border-pink-500/30 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">Permission Status</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                All permissions granted — Sara is fully operational ✓
              </p>
            </div>
            {/* 7/7 Circular Badge */}
            <div className="w-14 h-14 rounded-full border-2 border-purple-500 flex flex-col items-center justify-center text-center bg-purple-950/40">
              <span className="text-sm font-bold text-white">7/7</span>
              <span className="text-[8px] text-purple-300 uppercase">Granted</span>
            </div>
          </div>

          {/* REQUIRED PERMISSIONS Header */}
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">
            REQUIRED PERMISSIONS
          </p>

          <div className="space-y-2">
            {/* CORE: Default Assistant */}
            <div className="p-3 rounded-2xl glass-card border border-pink-500/15 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200">Default Assistant</p>
                <p className="text-[11px] text-slate-400">Set Sara as your default voice assistant.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                <span>Granted</span>
                <Check className="w-3 h-3" />
              </span>
            </div>

            {/* CORE: Microphone */}
            <div className="p-3 rounded-2xl glass-card border border-pink-500/15 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200">Microphone</p>
                <p className="text-[11px] text-slate-400">Voice input, commands, and real-time speech.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                <span>Granted</span>
                <Check className="w-3 h-3" />
              </span>
            </div>

            {/* SYSTEM: Display Over Other Apps */}
            <div className="p-3 rounded-2xl glass-card border border-pink-500/15 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200">Display Over Other Apps</p>
                <p className="text-[11px] text-slate-400">Show floating Sara button and overlay UI.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                <span>Granted</span>
                <Check className="w-3 h-3" />
              </span>
            </div>

            {/* SYSTEM: Post Notifications */}
            <div className="p-3 rounded-2xl glass-card border border-pink-500/15 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200">Post Notifications</p>
                <p className="text-[11px] text-slate-400">Send alerts, reminders and status updates.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                <span>Granted</span>
                <Check className="w-3 h-3" />
              </span>
            </div>

            {/* DEVICE: Precise Location */}
            <div className="p-3 rounded-2xl glass-card border border-pink-500/15 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200">Precise Location</p>
                <p className="text-[11px] text-slate-400">Accurate location for weather and navigation.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                <span>Granted</span>
                <Check className="w-3 h-3" />
              </span>
            </div>

            {/* MEDIA: Screen Capture */}
            <div className="p-3 rounded-2xl glass-card border border-pink-500/15 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200">Screen Capture</p>
                <p className="text-[11px] text-slate-400">Capture screen for visual context awareness.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                  <span>Granted</span>
                  <Check className="w-3 h-3" />
                </span>
                <button className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  <span>Restart</span>
                </button>
              </div>
            </div>

            {/* MEDIA: Camera */}
            <div className="p-3 rounded-2xl glass-card border border-pink-500/15 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200">Camera</p>
                <p className="text-[11px] text-slate-400">Use camera for visual commands and scanning.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                <span>Granted</span>
                <Check className="w-3 h-3" />
              </span>
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
            <div className="p-4 rounded-3xl glass-card border border-pink-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-pink-500/15 flex items-center justify-center text-pink-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Gemini API</h4>
                    <p className="text-[11px] text-slate-400">Server-Side Multi-Modal Engine</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  Active
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">AIza••••••••••••••••••••••••••••••••••••</span>
                <span className="text-[10px] text-pink-400 font-sans font-bold">MANAGED IN SECRETS</span>
              </div>
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
