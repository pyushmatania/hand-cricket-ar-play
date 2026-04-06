// ═══════════════════════════════════════════════════
// DRS Review Animation
// Triggered on close LBW/caught-behind decisions
// Shows slow-mo replay effect with umpire review UI
// ═══════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DRSReviewProps {
  active: boolean;
  dismissalType: 'lbw' | 'caught_behind' | 'caught' | null;
  outcome: 'out' | 'not_out';
  onComplete: () => void;
}

export default function DRSReview({ active, dismissalType, outcome, onComplete }: DRSReviewProps) {
  const [phase, setPhase] = useState<'scanning' | 'processing' | 'result' | null>(null);

  useEffect(() => {
    if (!active) {
      setPhase(null);
      return;
    }
    setPhase('scanning');
    const t1 = setTimeout(() => setPhase('processing'), 1500);
    const t2 = setTimeout(() => setPhase('result'), 3000);
    const t3 = setTimeout(() => {
      setPhase(null);
      onComplete();
    }, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active, onComplete]);

  const label = dismissalType === 'lbw' ? 'BALL TRACKING' : dismissalType === 'caught_behind' ? 'ULTRA EDGE' : 'SNICKO';

  return (
    <AnimatePresence>
      {active && phase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] pointer-events-none flex flex-col items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}
        >
          {/* Scanlines overlay */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
          }} />

          {/* DRS Header */}
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 px-6 py-2 rounded-full"
              style={{
                background: 'linear-gradient(180deg, hsl(25 18% 16%), hsl(25 15% 11%))',
                border: '2px solid hsl(25 20% 22%)',
                boxShadow: '0 2px 0 hsl(25 20% 6%), 0 4px 20px rgba(0,0,0,0.6)',
              }}
            >
              <div className="w-2 h-2 rounded-full bg-out-red animate-pulse" />
              <span className="font-display text-[10px] tracking-[0.3em] text-foreground font-bold">
                DRS REVIEW
              </span>
            </div>
          </motion.div>

          {/* Technology label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display text-[9px] tracking-[0.4em] text-muted-foreground mb-6"
          >
            {label}
          </motion.p>

          {/* Scanning animation */}
          {phase === 'scanning' && (
            <motion.div className="relative w-48 h-48">
              {/* Scanning line */}
              <motion.div
                animate={{ y: [0, 180, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-0.5"
                style={{
                  background: 'linear-gradient(90deg, transparent, hsl(217 91% 60%), transparent)',
                  boxShadow: '0 0 20px hsl(217 91% 60% / 0.6)',
                }}
              />
              {/* Corner brackets */}
              {['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-8 h-8`}>
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/60" />
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-primary/60" />
                </div>
              ))}
              {/* Center reticle */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full border-2 border-primary/40" />
                <div className="absolute w-6 h-0.5 bg-primary/40" />
                <div className="absolute w-0.5 h-6 bg-primary/40" />
              </motion.div>
            </motion.div>
          )}

          {/* Processing */}
          {phase === 'processing' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto rounded-full border-2 border-transparent border-t-primary"
              />
              <p className="font-display text-[10px] tracking-[0.3em] text-muted-foreground">
                PROCESSING...
              </p>
              {/* Fake data readout */}
              <div className="space-y-1">
                {['Impact: In Line', 'Pitching: Outside Off', 'Trajectory: Hitting'].map((line, i) => (
                  <motion.p
                    key={line}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.3 }}
                    className="font-mono text-[9px] text-primary/70"
                  >
                    {dismissalType === 'lbw' ? line : i === 0 ? 'Edge Detection: Active' : i === 1 ? 'Spike: Analyzing' : 'Frequency: 340Hz'}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Result */}
          {phase === 'result' && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="mb-4"
              >
                <p className="font-display font-black leading-none"
                  style={{
                    fontSize: 64,
                    color: outcome === 'out' ? 'hsl(0 84% 60%)' : 'hsl(142 71% 55%)',
                    textShadow: outcome === 'out'
                      ? '0 0 60px hsl(0 84% 60% / 0.6)'
                      : '0 0 60px hsl(142 71% 55% / 0.6)',
                  }}
                >
                  {outcome === 'out' ? 'OUT!' : 'NOT OUT'}
                </p>
              </motion.div>
              <p className="font-display text-[10px] tracking-[0.2em] text-muted-foreground">
                {outcome === 'out' ? 'DECISION STANDS' : 'OVERTURNED — BATSMAN SURVIVES'}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
