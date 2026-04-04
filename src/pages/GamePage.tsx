import { useParams, useNavigate } from "react-router-dom";
import GameScreen from "@/components/GameScreen";
import TapGameScreen from "@/components/TapGameScreen";
import PracticeScreen from "@/components/PracticeScreen";
import MultiplayerScreen from "@/components/MultiplayerScreen";
import TournamentScreen from "@/components/TournamentScreen";
import DailyChallengeScreen from "@/components/DailyChallengeScreen";
import IPLTournamentScreen from "@/components/ipl/IPLTournamentScreen";
import CricketRoyaleScreen from "@/components/CricketRoyaleScreen";
import AuctionLeagueScreen from "@/components/AuctionLeagueScreen";
import WorldCupScreen from "@/components/WorldCupScreen";
import AshesScreen from "@/components/AshesScreen";
import KnockoutCupScreen from "@/components/KnockoutCupScreen";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

export default function GamePage() {
  usePerformanceMonitor(true);
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const goHome = () => navigate("/play");

  if (mode === "tap") return <TapGameScreen onHome={goHome} />;
  if (mode === "practice") return <PracticeScreen onHome={goHome} />;
  if (mode === "multiplayer") return <MultiplayerScreen onHome={goHome} />;
  if (mode === "tournament") return <TournamentScreen onHome={goHome} />;
  if (mode === "ipl") return <IPLTournamentScreen onHome={goHome} />;
  if (mode === "daily") return <DailyChallengeScreen onHome={goHome} />;
  if (mode === "royale") return <CricketRoyaleScreen onHome={goHome} />;
  if (mode === "auction") return <AuctionLeagueScreen onHome={goHome} />;
  if (mode === "worldcup") return <WorldCupScreen onHome={goHome} />;
  if (mode === "ashes") return <AshesScreen onHome={goHome} />;
  if (mode === "knockout") return <KnockoutCupScreen onHome={goHome} />;

  return <GameScreen onHome={goHome} />;
}
