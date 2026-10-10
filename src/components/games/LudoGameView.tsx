import React, { useState, useEffect } from 'react';
import { useSara } from '../../context/SaraContext';
import { Dices, RotateCcw, Trophy, Sparkles, Volume2, ArrowLeft } from 'lucide-react';
import { LiveTalkingAvatar } from '../avatar/LiveTalkingAvatar';

export const LudoGameView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { speakText, isSpeaking, claimDailyReward } = useSara();

  // Game State
  // 4 pieces for Player (Red) and 4 for Sara Bot (Yellow)
  // Position: -1 means in yard, 0..51 main track, 52..56 home stretch, 57 is finished (won)
  const [playerPawns, setPlayerPawns] = useState<number[]>([-1, -1, -1, -1]);
  const [botPawns, setBotPawns] = useState<number[]>([-1, -1, -1, -1]);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'bot'>('player');
  const [diceValue, setDiceValue] = useState<number>(6);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [hasRolled, setHasRolled] = useState<boolean>(false);
  const [gameWinner, setGameWinner] = useState<'player' | 'bot' | null>(null);
  const [saraComment, setSaraComment] = useState<string>(
    'লুডু খেলতে প্রস্তুত তো বাবু? ❤️ আসো শুরু করি!'
  );

  // Roll Dice function
  const rollDice = () => {
    if (isRolling || hasRolled || gameWinner) return;
    setIsRolling(true);

    let rollCount = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount >= 10) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setIsRolling(false);
        setHasRolled(true);

        if (currentTurn === 'player') {
          handlePlayerRollResult(finalRoll);
        } else {
          handleBotRollResult(finalRoll);
        }
      }
    }, 70);
  };

  const handlePlayerRollResult = (roll: number) => {
    // Check if any pawn can move
    const canMoveAny = playerPawns.some((pos) => {
      if (pos === -1) return roll === 6;
      return pos + roll <= 57;
    });

    if (!canMoveAny) {
      setSaraComment(`তুমি ${roll} পেয়েছ, কিন্তু চাল দেওয়ার মতো গুটি নেই! এবার আমার পালা 😜`);
      setTimeout(() => {
        setHasRolled(false);
        setCurrentTurn('bot');
      }, 1500);
    } else {
      setSaraComment(`তুমি ${roll} পেয়েছ! তোমার যেকোনো একটি গুটিতে ক্লিক করে চাল দাও ❤️`);
    }
  };

  const movePlayerPawn = (index: number) => {
    if (currentTurn !== 'player' || !hasRolled || isRolling) return;
    const pos = playerPawns[index];

    // Case 1: Pawn in Yard, requires 6 to enter
    if (pos === -1) {
      if (diceValue !== 6) return;
      const newPawns = [...playerPawns];
      newPawns[index] = 0; // Enter at track index 0
      setPlayerPawns(newPawns);
      setSaraComment('দারুণ! তোমার গুটি বোর্ডে নেমে পড়েছে ✨');
      finishPlayerMove(diceValue === 6);
      return;
    }

    // Case 2: Pawn on track
    if (pos + diceValue <= 57) {
      const nextPos = pos + diceValue;
      const newPawns = [...playerPawns];
      newPawns[index] = nextPos;

      // Check if captured bot pawn
      let captured = false;
      const newBotPawns = botPawns.map((bPos) => {
        // Adjust for bot's offset (bot starts at index 26 on main track)
        const botAbsolutePos = (bPos + 26) % 52;
        if (bPos >= 0 && bPos < 52 && botAbsolutePos === nextPos && nextPos % 13 !== 0) {
          captured = true;
          return -1; // sent back to yard!
        }
        return bPos;
      });

      if (captured) {
        setBotPawns(newBotPawns);
        setSaraComment('আরে না! তুমি আমার গুটি খেয়ে ফেললে! 🥺 খুব চালাক তুমি!');
        speakText('আরে না! তুমি আমার গুটি কেটে ফেললে!', 'playful');
      }

      setPlayerPawns(newPawns);

      // Check win
      if (newPawns.every((p) => p >= 57)) {
        setGameWinner('player');
        setSaraComment('অভিনন্দন বাবু! ❤️ তুমি লুডু জিতে গেছ! তুমি সেরা!');
        speakText('অভিনন্দন প্রিয়! তুমি জিতে গেছ!', 'excited');
        return;
      }

      finishPlayerMove(diceValue === 6 || captured);
    }
  };

  const finishPlayerMove = (bonusRoll: boolean) => {
    setHasRolled(false);
    if (bonusRoll) {
      setSaraComment('তুমি বোনাস চাল পেয়েছ! আবার ছক্কা মারো 🎲');
    } else {
      setCurrentTurn('bot');
    }
  };

  // Bot Turn Logic
  useEffect(() => {
    if (currentTurn === 'bot' && !gameWinner) {
      const botTimer = setTimeout(() => {
        // Bot automatically rolls
        setIsRolling(true);
        let rollCount = 0;
        const interval = setInterval(() => {
          setDiceValue(Math.floor(Math.random() * 6) + 1);
          rollCount++;
          if (rollCount >= 8) {
            clearInterval(interval);
            const finalRoll = Math.floor(Math.random() * 6) + 1;
            setDiceValue(finalRoll);
            setIsRolling(false);
            setHasRolled(true);
            executeBotMove(finalRoll);
          }
        }, 70);
      }, 1000);

      return () => clearTimeout(botTimer);
    }
  }, [currentTurn]);

  const handleBotRollResult = (roll: number) => {
    // Handled in executeBotMove
  };

  const executeBotMove = (roll: number) => {
    setTimeout(() => {
      // Find candidate pawn
      // Priority 1: open new piece if 6
      const yardIndex = botPawns.findIndex((p) => p === -1);
      if (roll === 6 && yardIndex !== -1 && Math.random() < 0.7) {
        const next = [...botPawns];
        next[yardIndex] = 0;
        setBotPawns(next);
        setSaraComment('ইয়াহু! আমি ছক্কা মেরে গুটি বের করে ফেলেছি 😜');
        setHasRolled(false);
        // Bonus roll for 6
        setCurrentTurn('bot');
        return;
      }

      // Priority 2: advance piece on track
      const movableIndex = botPawns.findIndex((p) => p >= 0 && p + roll <= 57);
      if (movableIndex !== -1) {
        const next = [...botPawns];
        next[movableIndex] += roll;
        setBotPawns(next);
        setSaraComment(`আমি চাল দিলাম! এবার তোমার পালা বাবু ❤️`);

        if (next.every((p) => p >= 57)) {
          setGameWinner('bot');
          setSaraComment('হাহা! আমি জিতে গেলাম! এবার আমাকে ট্রিট দিতে হবে 😜');
          speakText('আমি জিতে গেছি বাবু! পরের বার নিশ্চয়ই তুমি পারবে।', 'playful');
          setHasRolled(false);
          return;
        }

        setHasRolled(false);
        setCurrentTurn('player');
      } else {
        setSaraComment(`আমি ${roll} পেয়েছি কিন্তু চাল দেওয়ার জায়গা নেই। তোমার পালা!`);
        setHasRolled(false);
        setCurrentTurn('player');
      }
    }, 1000);
  };

  const resetGame = () => {
    setPlayerPawns([-1, -1, -1, -1]);
    setBotPawns([-1, -1, -1, -1]);
    setCurrentTurn('player');
    setDiceValue(6);
    setHasRolled(false);
    setGameWinner(null);
    setSaraComment('নতুন খেলা শুরু হয়েছে! গুড লাক প্রিয় ❤️');
  };

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white glass-card px-3 py-1.5 rounded-xl border border-pink-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Dices className="w-5 h-5 text-pink-400" />
          <span>Sara Ludo Arena</span>
        </h2>
        <button
          onClick={resetGame}
          className="text-xs text-slate-400 hover:text-pink-400 flex items-center gap-1 glass-card px-2.5 py-1.5 rounded-xl border border-white/10"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sara Live Commentary Card */}
      <div className="p-3.5 rounded-2xl glass-card-pink border border-pink-500/30 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full border-2 border-pink-500 p-0.5 overflow-hidden shrink-0 bg-slate-900 shadow-[0_0_12px_rgba(255,46,147,0.4)]">
          <LiveTalkingAvatar size="sm" className="w-full h-full scale-125" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">
              Sara Bot Commentary
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              {currentTurn === 'player' ? '● Your Turn' : "● Sara's Turn"}
            </span>
          </div>
          <p className="text-xs text-slate-200 font-medium mt-0.5">{saraComment}</p>
        </div>
      </div>

      {/* Ludo Board (Interactive Grid Visualization) */}
      <div className="aspect-square max-w-md mx-auto rounded-3xl p-3 glass-card border-2 border-pink-500/40 shadow-2xl relative flex flex-col justify-between">
        {/* Top Half: Bot Yard (Yellow) + Main Track Header */}
        <div className="flex items-center justify-between gap-2 h-2/5">
          {/* Sara Bot Yard */}
          <div className="w-2/5 h-full rounded-2xl bg-amber-950/40 border-2 border-amber-500/40 p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
              <span>Sara (Bot)</span>
              <span>🟡</span>
            </div>
            <div className="grid grid-cols-2 gap-2 place-items-center flex-1 py-1">
              {botPawns.map((p, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-md transition-all ${
                    p === -1
                      ? 'bg-amber-400 text-amber-950 border border-amber-200'
                      : 'bg-amber-950/60 border border-amber-500/30 text-amber-400 opacity-40'
                  }`}
                >
                  {p === -1 ? '♟' : '✓'}
                </div>
              ))}
            </div>
          </div>

          {/* Central Track / Finish Display */}
          <div className="w-1/5 h-full rounded-2xl bg-slate-900/80 border border-slate-700 flex flex-col items-center justify-center text-center p-1">
            <Trophy className="w-6 h-6 text-pink-400 animate-pulse" />
            <span className="text-[9px] font-bold text-pink-300 uppercase mt-1">HOME</span>
          </div>

          {/* Player Progress Yard Counter */}
          <div className="w-2/5 h-full rounded-2xl bg-rose-950/40 border-2 border-rose-500/40 p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-rose-300">
              <span>Your Pieces</span>
              <span>🔴</span>
            </div>
            <div className="grid grid-cols-2 gap-2 place-items-center flex-1 py-1">
              {playerPawns.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => movePlayerPawn(idx)}
                  disabled={currentTurn !== 'player' || !hasRolled}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                    p === -1
                      ? 'bg-rose-500 text-white border-2 border-rose-300 hover:scale-110 active:scale-95 animate-pulse'
                      : 'bg-rose-950/60 border border-rose-500/40 text-rose-400'
                  }`}
                >
                  ♟
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Active Pawns Track Tracker */}
        <div className="py-3 px-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>TRACK PROGRESS (0 → 57)</span>
            <span>ROLL 6 TO EXIT YARD</span>
          </div>

          {/* Interactive Pawns Status Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-rose-400 w-12">Player:</span>
              <div className="flex-1 flex gap-1.5">
                {playerPawns.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => movePlayerPawn(idx)}
                    disabled={currentTurn !== 'player' || !hasRolled}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-all ${
                      p === -1
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : p >= 57
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white border border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                    }`}
                  >
                    P{idx + 1}: {p === -1 ? 'Yard' : p >= 57 ? 'Won' : `${p}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-400 w-12">Sara:</span>
              <div className="flex-1 flex gap-1.5">
                {botPawns.map((p, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold ${
                      p === -1
                        ? 'bg-slate-800 text-slate-400'
                        : p >= 57
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    B{idx + 1}: {p === -1 ? 'Yard' : p >= 57 ? 'Won' : `${p}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dice Rolling Action Section */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-pink-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Animated Dice */}
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-[0_0_18px_rgba(255,46,147,0.6)] border-2 border-white/20 select-none ${
                isRolling ? 'animate-spin' : ''
              }`}
            >
              {diceValue}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">
                {currentTurn === 'player' ? 'Your Dice Roll' : "Sara's Turn"}
              </p>
              <p className="text-[10px] text-pink-400">
                {hasRolled ? 'Pick a pawn to move' : 'Tap Roll to throw dice'}
              </p>
            </div>
          </div>

          <button
            onClick={rollDice}
            disabled={currentTurn !== 'player' || hasRolled || isRolling}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-sm tracking-wider shadow-[0_0_15px_rgba(255,46,147,0.5)] active:scale-95 transition-all flex items-center gap-2"
          >
            <Dices className="w-5 h-5" />
            <span>{isRolling ? 'Rolling...' : 'ROLL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
