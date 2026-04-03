import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import TopStatusBar from "@/components/TopStatusBar";
import CurrencyPill from "@/components/shared/CurrencyPill";
import ShopItemCard from "@/components/shop/ShopItemCard";
import ShopItemModal from "@/components/shop/ShopItemModal";
import ChestReveal from "@/components/shop/ChestReveal";
import { toast } from "sonner";

interface ShopItem {
  id: string;
  name: string;
  category: string;
  price: number;
  rarity: string;
  preview_emoji: string;
  description: string;
  metadata: any;
  sort_order: number;
}

interface Purchase {
  item_id: string;
  equipped: boolean;
}

const CATEGORIES = [
  { key: "all", label: "ALL", icon: "🛒" },
  { key: "bat_skin", label: "BATS", icon: "🏏" },
  { key: "vs_effect", label: "VS FX", icon: "⚔️" },
  { key: "avatar_frame", label: "FRAMES", icon: "🖼️" },
  { key: "game_pass", label: "PASSES", icon: "🎫" },
];

export default function ShopPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [coins, setCoins] = useState(0);
  const [category, setCategory] = useState(() => searchParams.get("category") || "all");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [chestItem, setChestItem] = useState<ShopItem | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("shop_items").select("*").order("sort_order")
      .then(({ data }) => { if (data) setItems(data as unknown as ShopItem[]); });
    supabase.from("user_purchases").select("item_id, equipped").eq("user_id", user.id)
      .then(({ data }) => { if (data) setPurchases(data as unknown as Purchase[]); });
    supabase.from("profiles").select("coins").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setCoins((data as any).coins || 0); });
  }, [user]);

  const isOwned = (id: string) => purchases.some(p => p.item_id === id);
  const isEquipped = (id: string) => purchases.some(p => p.item_id === id && p.equipped);

  const handlePurchase = async (item: ShopItem) => {
    if (!user || purchasing) return;
    if (coins < item.price) { toast.error("Not enough coins!"); return; }
    setPurchasing(true);
    const newCoins = coins - item.price;
    await supabase.from("profiles").update({ coins: newCoins } as any).eq("user_id", user.id);
    await supabase.from("user_purchases").insert({ user_id: user.id, item_id: item.id } as any);
    setCoins(newCoins);
    setPurchases(prev => [...prev, { item_id: item.id, equipped: false }]);
    setSelectedItem(null);
    setChestItem(item);
    setPurchasing(false);
  };

  const handleEquip = async (item: ShopItem) => {
    if (!user) return;
    if (item.category === "game_pass") { toast.info("Game passes are always active! 🎫"); setSelectedItem(null); return; }
    const categoryItems = items.filter(i => i.category === item.category);
    const ownedInCategory = categoryItems.filter(i => isOwned(i.id));
    for (const owned of ownedInCategory) {
      await supabase.from("user_purchases").update({ equipped: false } as any).eq("user_id", user.id).eq("item_id", owned.id);
    }
    await supabase.from("user_purchases").update({ equipped: true } as any).eq("user_id", user.id).eq("item_id", item.id);
    const fieldMap: Record<string, string> = { bat_skin: "equipped_bat_skin", vs_effect: "equipped_vs_effect", avatar_frame: "equipped_avatar_frame" };
    const field = fieldMap[item.category];
    if (field) await supabase.from("profiles").update({ [field]: item.name } as any).eq("user_id", user.id);
    setPurchases(prev => prev.map(p => ({
      ...p,
      equipped: p.item_id === item.id ? true : categoryItems.some(ci => ci.id === p.item_id) ? false : p.equipped,
    })));
    toast.success(`Equipped ${item.name}! ✨`);
    setSelectedItem(null);
  };

  const handleChestComplete = useCallback(() => {
    if (chestItem) toast.success(`Purchased ${chestItem.name}! 🎉`);
    setChestItem(null);
  }, [chestItem]);

  const filtered = category === "all" ? items : items.filter(i => i.category === category);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222_55%_10%)] to-background pointer-events-none" />
      <TopStatusBar />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-game-dark border-2 border-[hsl(222_25%_22%)] flex items-center justify-center text-foreground font-game-body text-sm active:scale-95 transition-transform">
              ←
            </motion.button>
            <div>
              <h1 className="font-game-title text-lg text-foreground">Shop</h1>
              <span className="text-[9px] text-muted-foreground font-game-display tracking-[0.2em]">CUSTOMIZE YOUR STYLE</span>
            </div>
          </div>
          <CurrencyPill icon="🪙" value={coins} showPlus={false} />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 mb-5 bg-game-dark/80 rounded-2xl p-1 border border-[hsl(222_25%_22%/0.5)]">
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              className={`flex-1 py-2.5 rounded-xl font-game-display text-[8px] tracking-widest transition-all flex items-center justify-center gap-1 ${
                category === c.key
                  ? "bg-gradient-to-b from-game-blue to-[hsl(207_90%_44%)] text-white border-b-2 border-[hsl(207_90%_35%)] shadow-[0_2px_8px_hsl(207_90%_54%/0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              <span className="text-sm">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item, i) => (
            <ShopItemCard
              key={item.id}
              name={item.name}
              rarity={item.rarity}
              previewEmoji={item.preview_emoji}
              description={item.description}
              price={item.price}
              owned={isOwned(item.id)}
              equipped={isEquipped(item.id)}
              index={i}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl block mb-3">🏗️</span>
            <p className="font-game-card text-sm text-muted-foreground">No items in this category yet!</p>
          </div>
        )}
      </div>

      {/* Item detail modal */}
      {selectedItem && (
        <ShopItemModal
          item={selectedItem}
          coins={coins}
          owned={isOwned(selectedItem.id)}
          equipped={isEquipped(selectedItem.id)}
          purchasing={purchasing}
          onClose={() => setSelectedItem(null)}
          onPurchase={handlePurchase}
          onEquip={handleEquip}
        />
      )}

      {/* Chest reveal animation */}
      {chestItem && (
        <ChestReveal
          itemName={chestItem.name}
          itemEmoji={chestItem.preview_emoji}
          rarity={chestItem.rarity}
          onComplete={handleChestComplete}
        />
      )}

      <BottomNav />
    </div>
  );
}
