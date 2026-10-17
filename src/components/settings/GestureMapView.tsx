import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSara } from '../../context/SaraContext';
import {
  Hand,
  Zap,
  Sparkles,
  Check,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Smartphone,
  Layers,
  Move,
  Camera,
  Heart,
  Volume2,
  Shield,
  Activity,
  Play
} from 'lucide-react';

interface MapNode {
  id: string;
  type: 'gesture' | 'target' | 'core';
  label: string;
  bengaliLabel: string;
  icon: string;
  x: number;
  y: number;
  color: string;
  category?: string;
  gestureKey?: string;
  targetId?: string;
}

export const GestureMapView: React.FC = () => {
  const {
    gestureMappings,
    updateGestureMapping,
    triggerGestureAction,
    speakText,
    availableApps,
    executeScreenCommand
  } = useSara();

  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state for the entire map
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Dragging individual nodes with finger/hand
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Selected node for info/binding
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('gesture_wave');
  const [pulsingNodeId, setPulsingNodeId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>('আঙুল দিয়ে যেকোনো নোড ধরে ইচ্ছেমতো সরান');

  // Initial nodes configuration
  const defaultNodes: MapNode[] = [
    // Central SARA Core
    {
      id: 'core_sara',
      type: 'core',
      label: 'SARA AI Core',
      bengaliLabel: 'সারা নিউরাল হাব',
      icon: '✨',
      x: 320,
      y: 220,
      color: '#FF2E93'
    },
    // Gesture Nodes (Left & Top Orbit)
    {
      id: 'gesture_wave',
      type: 'gesture',
      gestureKey: 'wave',
      label: 'Waving Hand',
      bengaliLabel: 'হাতে নাড়ানো 👋',
      icon: '👋',
      x: 100,
      y: 110,
      color: '#06B6D4'
    },
    {
      id: 'gesture_heart',
      type: 'gesture',
      gestureKey: 'heart',
      label: 'Heart Hands',
      bengaliLabel: 'হার্ট সাইন 💖',
      icon: '💖',
      x: 100,
      y: 230,
      color: '#EC4899'
    },
    {
      id: 'gesture_thumbs_up',
      type: 'gesture',
      gestureKey: 'thumbs_up',
      label: 'Thumbs Up',
      bengaliLabel: 'থাম্বস আপ 👍',
      icon: '👍',
      x: 100,
      y: 350,
      color: '#10B981'
    },
    {
      id: 'gesture_peace',
      type: 'gesture',
      gestureKey: 'peace',
      label: 'Peace Sign',
      bengaliLabel: 'শান্তির চিহ্ন ✌️',
      icon: '✌️',
      x: 230,
      y: 70,
      color: '#8B5CF6'
    },
    {
      id: 'gesture_fist',
      type: 'gesture',
      gestureKey: 'fist',
      label: 'Fist Bump',
      bengaliLabel: 'মুষ্টিবদ্ধ হাত ✊',
      icon: '✊',
      x: 410,
      y: 70,
      color: '#F59E0B'
    },
    // Target App & Automation Nodes (Right Orbit)
    {
      id: 'target_open_chat',
      type: 'target',
      targetId: 'open_chat',
      label: 'Chat & Greet',
      bengaliLabel: 'কথা ও শুভেচ্ছা',
      icon: '💬',
      x: 540,
      y: 90,
      color: '#06B6D4'
    },
    {
      id: 'target_romantic_mode',
      type: 'target',
      targetId: 'romantic_mode',
      label: 'Romantic Mode',
      bengaliLabel: 'রোমান্টিক মোড',
      icon: '❤️',
      x: 550,
      y: 190,
      color: '#EC4899'
    },
    {
      id: 'target_instagram',
      type: 'target',
      targetId: 'app_instagram',
      label: 'Instagram Reels',
      bengaliLabel: 'ইনস্টাগ্রাম রিলস',
      icon: '📸',
      x: 540,
      y: 290,
      color: '#E1306C'
    },
    {
      id: 'target_youtube',
      type: 'target',
      targetId: 'app_youtube',
      label: 'YouTube Music',
      bengaliLabel: 'ইউটিউব গান',
      icon: '🎵',
      x: 510,
      y: 390,
      color: '#EF4444'
    },
    {
      id: 'target_facebook',
      type: 'target',
      targetId: 'app_facebook',
      label: 'Facebook Status',
      bengaliLabel: 'ফেসবুক স্ট্যাটাস',
      icon: '🌐',
      x: 350,
      y: 380,
      color: '#3B82F6'
    },
    {
      id: 'target_toggle_lights',
      type: 'target',
      targetId: 'toggle_lights',
      label: 'Smart Lights',
      bengaliLabel: 'স্মার্ট লাইটস',
      icon: '💡',
      x: 210,
      y: 380,
      color: '#F59E0B'
    }
  ];

  // Dynamic state for node positions
  const [nodes, setNodes] = useState<MapNode[]>(() => {
    try {
      const saved = localStorage.getItem('sara_gesture_map_positions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return defaultNodes;
  });

  // Save node positions on change
  useEffect(() => {
    try {
      localStorage.setItem('sara_gesture_map_positions', JSON.stringify(nodes));
    } catch {}
  }, [nodes]);

  // Touch / Pointer Down on a specific Node to drag it
  const handleNodePointerDown = (e: React.PointerEvent | React.TouchEvent, node: MapNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pointerMapX = (clientX - rect.left - pan.x) / zoom;
      const pointerMapY = (clientY - rect.top - pan.y) / zoom;

      dragOffsetRef.current = {
        x: pointerMapX - node.x,
        y: pointerMapY - node.y
      };
    }
  };

  // Touch / Pointer Down on Canvas to Pan entire Map
  const handleCanvasPointerDown = (e: React.PointerEvent | React.TouchEvent) => {
    if (draggingNodeId) return;
    setIsPanning(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    panStartRef.current = { x: clientX - pan.x, y: clientY - pan.y };
  };

  // Move Handler (both mouse & touch)
  const handlePointerMove = useCallback((e: React.PointerEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // Moving an individual Node with finger/hand
    if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pointerMapX = (clientX - rect.left - pan.x) / zoom;
      const pointerMapY = (clientY - rect.top - pan.y) / zoom;

      const newX = Math.round(pointerMapX - dragOffsetRef.current.x);
      const newY = Math.round(pointerMapY - dragOffsetRef.current.y);

      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
      setStatusNotice(`নোড স্থানান্তরিত হচ্ছে: X=${newX}, Y=${newY}`);
      return;
    }

    // Panning the entire Map canvas
    if (isPanning) {
      const newPanX = clientX - panStartRef.current.x;
      const newPanY = clientY - panStartRef.current.y;
      setPan({ x: newPanX, y: newPanY });
    }
  }, [draggingNodeId, isPanning, pan, zoom]);

  // Pointer Up
  const handlePointerUp = useCallback(() => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      setStatusNotice('নোডের নতুন অবস্থান সেভ করা হয়েছে!');
      setTimeout(() => setStatusNotice(null), 2500);
    }
    if (isPanning) {
      setIsPanning(false);
    }
  }, [draggingNodeId, isPanning]);

  // Global window listeners during drag/pan so fingers never lose track
  useEffect(() => {
    if (!draggingNodeId && !isPanning) return;

    const onPointerMove = (e: PointerEvent) => {
      handlePointerMove(e as any);
    };
    const onPointerUp = () => {
      handlePointerUp();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      handlePointerMove(e as any);
    };
    const onTouchEnd = () => {
      handlePointerUp();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('pointercancel', onPointerUp, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [draggingNodeId, isPanning, handlePointerMove, handlePointerUp]);

  // Reset to default layout
  const handleResetLayout = () => {
    setNodes(defaultNodes);
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setStatusNotice('মানচিত্র ডিফল্ট অবস্থানে রিসেট করা হয়েছে');
    setTimeout(() => setStatusNotice(null), 2000);
  };

  // Test Node Action
  const handleTestNode = (node: MapNode) => {
    setPulsingNodeId(node.id);
    setTimeout(() => setPulsingNodeId(null), 1500);

    if (node.type === 'gesture' && node.gestureKey) {
      triggerGestureAction(node.gestureKey);
      setStatusNotice(`"${node.bengaliLabel}" জেসচার ট্রিগার হয়েছে!`);
    } else if (node.type === 'target') {
      if (node.targetId === 'romantic_mode') {
        speakText('বাবু, তুমি অনেক সুন্দর! তোমার জন্য আমার সারাটা হৃদয় ভালোবাসা দিয়ে ভরা। ❤️', 'romantic');
      } else if (node.targetId === 'open_chat') {
        speakText('হ্যালো বাবু! আমি তোমার সারা, সবসময় তোমার পাশে আছি। বলো কি সাহায্য করতে পারি? 🥰', 'caring');
      } else if (node.targetId === 'app_instagram') {
        executeScreenCommand('ইনস্টাগ্রামে রিলস দেখো ও কমেন্ট করো');
      } else if (node.targetId === 'app_youtube') {
        executeScreenCommand('ইউটিউবে রোমান্টিক গান চালাও');
      } else if (node.targetId === 'app_facebook') {
        executeScreenCommand('ফেসবুকে স্ট্যাটাস দাও');
      } else {
        speakText(`সোনা, "${node.bengaliLabel}" অ্যাকশন সফলভাবে সম্পন্ন হয়েছে!`, 'caring');
      }
      setStatusNotice(`"${node.bengaliLabel}" টার্গেট অ্যাকশন টেস্ট করা হয়েছে!`);
    }
  };

  // Binding a gesture to target
  const handleBindGesture = (gestureKey: string, targetId: string) => {
    updateGestureMapping(gestureKey, targetId);
    setStatusNotice(`জেসচার লিংক আপডেট হয়েছে!`);
    setTimeout(() => setStatusNotice(null), 2500);
  };

  // Calculate connection lines between Gestures and their bound Targets
  const connectionLinks = nodes
    .filter(n => n.type === 'gesture')
    .map(gestureNode => {
      const binding = gestureMappings[gestureNode.gestureKey || ''] || 'open_chat';
      let targetNode = nodes.find(n => n.type === 'target' && (n.targetId === binding || n.id === `target_${binding}`));
      if (!targetNode) {
        // Fallback to core
        targetNode = nodes.find(n => n.type === 'core') || nodes[0];
      }
      return {
        id: `link_${gestureNode.id}_${targetNode.id}`,
        from: gestureNode,
        to: targetNode,
        color: gestureNode.color
      };
    });

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl glass-card-pink border border-pink-500/35 p-5 relative overflow-hidden shadow-[0_0_25px_rgba(255,46,147,0.2)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-pink-600/30 border border-pink-500/40 flex items-center justify-center text-pink-400">
                <Hand className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>জেসচার ও অটোমেশন মানচিত্র (Gesture & App Map)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 font-mono">
                  স্পেশিয়াল টাচ কন্ট্রোল
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-lg">
              মানচিত্রের যেকোনো নোড (জেসচার বা অ্যাপ) <strong>আঙুল বা হাত দিয়ে টাচ করে ধরে</strong> স্ক্রিনের যেকোনো জায়গায় সরান। সংযোগ লাইনগুলো স্বয়ংক্রিয়ভাবে নোডের সাথে নড়াচড়া করবে।
            </p>
          </div>

          {/* Map Controls */}
          <div className="flex items-center gap-1.5 self-end sm:self-center bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setZoom(z => Math.min(1.6, z + 0.15))}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetLayout}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all"
              title="Reset Layout"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
          </div>
        </div>

        {statusNotice && (
          <div className="mt-3 py-1 px-3 rounded-full bg-pink-950/80 border border-pink-500/30 text-pink-300 text-xs inline-flex items-center gap-1.5 animate-in fade-in">
            <Move className="w-3 h-3 text-pink-400 animate-spin" />
            <span>{statusNotice}</span>
          </div>
        )}
      </div>

      {/* Main Interactive Touch-Draggable Canvas */}
      <div
        ref={containerRef}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handleCanvasPointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        className="w-full h-[450px] sm:h-[500px] rounded-3xl glass-card border border-pink-500/25 relative overflow-hidden select-none cursor-grab active:cursor-grabbing bg-[#08071a] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]"
        style={{ touchAction: 'none' }}
      >
        {/* Dynamic Grid / Radar Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at center, rgba(236,72,153,0.15) 0%, transparent 70%),
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 30px 30px, 30px 30px',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        />

        {/* Orbit Rings centered on Core */}
        <div
          className="absolute pointer-events-none transition-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          <div
            className="absolute rounded-full border border-pink-500/20 animate-pulse pointer-events-none"
            style={{
              left: 320 - 160,
              top: 220 - 160,
              width: 320,
              height: 320
            }}
          />
          <div
            className="absolute rounded-full border border-cyan-500/15 pointer-events-none"
            style={{
              left: 320 - 240,
              top: 220 - 240,
              width: 480,
              height: 480
            }}
          />
        </div>

        {/* SVG Links Layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          <defs>
            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {connectionLinks.map((link) => {
            const startX = link.from.x;
            const startY = link.from.y;
            const endX = link.to.x;
            const endY = link.to.y;
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2 - 20;

            const pathData = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

            return (
              <g key={link.id}>
                {/* Background Shadow Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={link.color}
                  strokeWidth="3"
                  strokeOpacity="0.25"
                  filter="url(#glow)"
                />
                {/* Animated Flowing Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={link.color}
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  strokeOpacity="0.8"
                  className="animate-dash"
                />
              </g>
            );
          })}
        </svg>

        {/* Draggable Map Nodes */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {nodes.map((node) => {
            const isDragging = draggingNodeId === node.id;
            const isSelected = selectedNodeId === node.id;
            const isPulsing = pulsingNodeId === node.id;

            return (
              <div
                key={node.id}
                onPointerDown={(e) => handleNodePointerDown(e, node)}
                onTouchStart={(e) => handleNodePointerDown(e, node)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(node.id);
                }}
                className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing transition-shadow ${
                  isDragging ? 'z-40 scale-110 cursor-grabbing' : 'z-20 hover:scale-105'
                }`}
                style={{
                  left: node.x - (node.type === 'core' ? 36 : 28),
                  top: node.y - (node.type === 'core' ? 36 : 28),
                  touchAction: 'none'
                }}
              >
                {/* Visual Node Element */}
                <div
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                    node.type === 'core'
                      ? 'w-18 h-18 bg-gradient-to-tr from-pink-600 via-purple-700 to-indigo-900 border-pink-400 shadow-[0_0_25px_rgba(255,46,147,0.8)]'
                      : node.type === 'gesture'
                      ? 'w-14 h-14 bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'w-14 h-14 bg-slate-900/90 border-pink-500/40 hover:border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                  } ${
                    isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-105' : ''
                  } ${isPulsing ? 'animate-ping' : ''}`}
                  style={{ borderColor: isSelected ? '#ffffff' : node.color }}
                >
                  <span className="text-xl select-none leading-none">{node.icon}</span>
                  <span className="text-[9px] font-bold text-white mt-1 leading-tight text-center max-w-[50px] truncate select-none">
                    {node.bengaliLabel}
                  </span>
                </div>

                {/* Hand-drag hint badge on selected node */}
                {isSelected && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-pink-600 text-white text-[9px] font-bold whitespace-nowrap shadow-md flex items-center gap-1 animate-bounce pointer-events-none">
                    <Move className="w-2.5 h-2.5" />
                    <span>আঙুল দিয়ে টানুন</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Left Canvas Instruction */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 pointer-events-none">
          <Hand className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span>আঙুল দিয়ে নোড সরান • ব্যাকগ্রাউন্ড টেনে ম্যাপ প্যান করুন</span>
        </div>
      </div>

      {/* Selected Node Details & Rebinding Panel */}
      {selectedNode && (
        <div className="p-4 rounded-3xl glass-card border border-pink-500/30 bg-slate-950/70 space-y-3 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-500/20 pb-3">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-slate-900 border border-pink-500/40 flex items-center justify-center text-2xl shadow-md">
                {selectedNode.icon}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-100">{selectedNode.label}</h4>
                  <span className="text-xs text-pink-400 font-bold font-bengali">({selectedNode.bengaliLabel})</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase font-mono">
                    {selectedNode.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  অবস্থান: X={selectedNode.x}, Y={selectedNode.y}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTestNode(selectedNode)}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>টেস্ট চালান (Test Trigger)</span>
              </button>
            </div>
          </div>

          {/* If it's a Gesture Node: Allow rebinding to any target app */}
          {selectedNode.type === 'gesture' && selectedNode.gestureKey && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>এই জেসচারের সাথে যুক্ত অ্যাকশন বা ফোন অ্যাপ:</span>
                <span className="text-pink-400 font-mono">
                  {gestureMappings[selectedNode.gestureKey] || 'open_chat'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'open_chat', label: 'কথা ও শুভেচ্ছা 💬' },
                  { id: 'romantic_mode', label: 'রোমান্টিক ভালোবাসা ❤️' },
                  { id: 'app_instagram', label: 'ইনস্টাগ্রাম রিলস 📸' },
                  { id: 'app_youtube', label: 'ইউটিউব গান 🎵' },
                  { id: 'app_facebook', label: 'ফেসবুক স্ট্যাটাস 🌐' },
                  { id: 'toggle_lights', label: 'স্মার্ট লাইটস 💡' },
                  { id: 'open_wardrobe', label: 'পোশাক ওয়ারড্রব 👗' }
                ].map((target) => {
                  const isCurrent = (gestureMappings[selectedNode.gestureKey || ''] || 'open_chat') === target.id;

                  return (
                    <button
                      key={target.id}
                      onClick={() => handleBindGesture(selectedNode.gestureKey || '', target.id)}
                      className={`p-2 rounded-xl border text-xs font-medium text-left transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400 shadow-md font-bold'
                          : 'bg-slate-900 border-slate-800 hover:border-pink-500/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{target.label}</span>
                        {isCurrent && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
