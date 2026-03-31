import { useState } from "react";
import HomeScreen from "@/components/HomeScreen";
import GameScreen from "@/components/GameScreen";

export default function Index() {
  const [screen, setScreen] = useState<"home" | "game">("home");

  return screen === "home" ? (
    <HomeScreen onStart={() => setScreen("game")} />
  ) : (
    <GameScreen onHome={() => setScreen("home")} />
  );
}
