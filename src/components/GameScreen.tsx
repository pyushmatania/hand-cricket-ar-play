import { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import CameraFeed, { type CameraFeedHandle } from "./CameraFeed";
import ScoreBoard from "./ScoreBoard";
import GestureDisplay from "./GestureDisplay";
import RulesSheet from "./RulesSheet";
import { useHandCricket, type Move } from "@/hooks/useHandCricket";
import { useHandDetection } from "@/hooks/useHandDetection";

interface GameScreenProps {
  onHome: () => void;
}

export default function GameScreen({ onHome }: GameScreenProps) {
  const cameraRef = useRef<CameraFeedHandle>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const { game, startGame, playBall, resetGame } = useHandCricket();
  const detection = useHandDetection(videoElementRef);
  const [tossChoice, setTossChoice] = useState<null | boolean>(null);

  const handleVideoReady = useCallback(
    (video: HTMLVideoElement) => {
      videoElementRef.current = video;
      detection.startDetection();
    },
    [detection]
  );

  const handleCapture = useCallback(() => {
    if (detection.lockedMove) {
      // Already locked — play the ball
      playBall(detection.lockedMove);
      detection.unlockMove();
    } else {
      // Lock the current detection
      detection.lockMove();
    }
  }, [detection, playBall]);

  const canCapture =
    game.phase !== "not_started" &&
    game.phase !== "finished" &&
    (detection.detectedMove !== null || detection.lockedMove !== null);

  const handleStartNew = () => {
    resetGame();
    detection.unlockMove();
    setTossChoice(null);
  };

  return (
    <div className="min-h-screen stadium-gradient flex flex-col">
      <RulesSheet />

      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <button onClick={onHome} className="text-muted-foreground hover:text-foreground text-sm font-bold">
          ← Back
        </button>
        <h1 className="font-display text-xs tracking-[0.2em] text-primary font-bold">HAND CRICKET AR</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col gap-2 px-3 pb-3 max-w-lg mx-auto w-full">
        {/* Camera */}
        <CameraFeed ref={cameraRef} onVideoReady={handleVideoReady} />

        {/* Toss / Start */}
        {game.phase === "not_started" && tossChoice === null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-4 text-center space-y-3">
            <p className="font-display text-sm font-bold text-foreground">Choose your innings</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setTossChoice(true);
                  startGame(true);
                }}
                className="flex-1 py-3 bg-primary text-primary-foreground font-display font-bold rounded-xl text-sm"
              >
                🏏 BAT FIRST
              </button>
              <button
                onClick={() => {
                  setTossChoice(false);
                  startGame(false);
                }}
                className="flex-1 py-3 bg-accent text-accent-foreground font-display font-bold rounded-xl text-sm"
              >
                🎯 BOWL FIRST
              </button>
            </div>
          </motion.div>
        )}

        {/* Scoreboard */}
        {game.phase !== "not_started" && <ScoreBoard game={game} />}

        {/* Gesture area */}
        {game.phase !== "not_started" && (
          <GestureDisplay
            status={detection.status}
            detectedMove={detection.detectedMove}
            lockedMove={detection.lockedMove}
            confidence={detection.confidence}
            lastResult={game.lastResult}
            onCapture={handleCapture}
            canCapture={canCapture}
          />
        )}

        {/* Game over actions */}
        {game.phase === "finished" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <button
              onClick={handleStartNew}
              className="flex-1 py-3 bg-primary text-primary-foreground font-display font-bold rounded-xl"
            >
              NEW GAME
            </button>
            <button
              onClick={onHome}
              className="flex-1 py-3 bg-muted text-foreground font-display font-bold rounded-xl"
            >
              HOME
            </button>
          </motion.div>
        )}

        {/* Reset mid-game */}
        {game.phase !== "not_started" && game.phase !== "finished" && (
          <button
            onClick={handleStartNew}
            className="text-xs text-muted-foreground underline self-center mt-1"
          >
            Reset Game
          </button>
        )}
      </div>
    </div>
  );
}
