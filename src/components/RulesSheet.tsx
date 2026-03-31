import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RulesSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 right-3 z-50 w-9 h-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Rules"
      >
        <span className="text-lg">❓</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 right-0 z-50 glass-strong rounded-t-2xl max-h-[80vh] overflow-y-auto p-5"
            >
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
              <h2 className="font-display text-lg font-bold text-primary mb-3">HOW TO PLAY</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <div>
                  <h3 className="text-foreground font-bold mb-1">Gestures</h3>
                  <ul className="space-y-1">
                    <li>✊ Fist = <strong className="text-primary">DEF</strong> (defend)</li>
                    <li>☝️ 1 finger = <strong className="text-primary">1</strong></li>
                    <li>✌️ 2 fingers = <strong className="text-primary">2</strong></li>
                    <li>🤟 3 fingers = <strong className="text-primary">3</strong></li>
                    <li>🖖 4 fingers = <strong className="text-primary">4</strong></li>
                    <li>🖐️ 5 fingers = <strong className="text-primary">5</strong></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-foreground font-bold mb-1">Batting Rules</h3>
                  <p>• Your number = AI number → <strong className="text-out-red">OUT!</strong></p>
                  <p>• You play DEF, AI plays a number → you score AI's number</p>
                  <p>• Both play DEF → <strong className="text-out-red">OUT!</strong></p>
                  <p>• Otherwise → you score your number</p>
                </div>
                <div>
                  <h3 className="text-foreground font-bold mb-1">Bowling Rules</h3>
                  <p>Same rules, but AI is batting. Match their number to get them OUT!</p>
                </div>
                <div>
                  <h3 className="text-foreground font-bold mb-1">Match Format</h3>
                  <p>2 innings. Set a target, then chase it. Highest score wins!</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-full mt-5 py-3 bg-muted text-foreground font-display font-bold rounded-xl"
              >
                GOT IT
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
