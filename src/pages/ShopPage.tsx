import { useState, useEffect, useCallback } from "react";
import StoneHeader from "@/components/shared/StoneHeader";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TopStatusBar from "@/components/TopStatusBar";
import CurrencyPill from "@/components/shared/CurrencyPill";
import ShopItemCard from "@/components/shop/ShopItemCard";
import ShopItemModal from "@/components/shop/ShopItemModal";
import ChestReveal from "@/components/shop/ChestReveal";
import engines from "@/engines/EngineManager";
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
    if (coins < item.price) { toast.error("Not enough coins!"); engines.sound.playEffect('ui_error'); return; }
    setPurchasing(true);
    engines.sound.playEffect('coin_collect');
    engines.sound.vibrate('medium');
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
    engines.sound.playEffect('ui_success');
    engines.sound.vibrate('light');
    toast.success(`Equipped ${item.name}! ✨`);
    setSelectedItem(null);
  };

  const handleChestComplete = useCallback(() => {
    if (chestItem) toast.success(`Purchased ${chestItem.name}! 🎉`);
    setChestItem(null);
  }, [chestItem]);

  const filtered = category === "all" ? items : items.filter(i => i.category === category);

  return (
    <div className="min-h-screen relative overflow-hidden pb-24 fish-scale-bg">
      <TopStatusBar />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Stone Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl flex items-center justify-center font-body text-sm text-[#F5E6D3] active:scale-95 transition-transform"
              style={{
                background: "linear-gradient(180deg, #3E2410, #2E1A0E)",
                border: "2px solid #5C3A1E",
                boxShadow: "0 4px 0 #1A0E06",
              }}
            >
              ←
            </motion.button>
            <div>
              <StoneHeader text="SHOP" />
              <span className="text-[9px] text-[#94A3B8] font-display tracking-[0.2em]">WOODEN MARKETPLACE</span>
            </div>
          </div>
          <CurrencyPill icon="🪙" value={coins} showPlus={false} />
        </div>

        {/* Category tabs - Dark Wood buttons */}
        <div className="flex gap-1 mb-5 rounded-xl p-1" style={{
          background: "linear-gradient(180deg, #2E1A0E, #1A0E06)",
          border: "2px solid #3E2410",
        }}>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              className="flex-1 py-2.5 rounded-lg font-display text-[8px] tracking-widest transition-all flex items-center justify-center gap-1"
              style={{
                background: category === c.key ? "linear-gradient(180deg, #22C55E, #16A34A)" : "transparent",
                color: category === c.key ? "white" : "#94A3B8",
                border: category === c.key ? "2px solid #22C55E" : "2px solid transparent",
                boxShadow: category === c.key ? "0 3px 0 #15803D" : "none",
              }}
            >
              <span className="text-sm">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* Rope divider */}
        <div className="rope-separator mb-4" />

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
            <p className="font-display text-sm text-[#94A3B8]">No items in this category yet!</p>
          </div>
        )}
      </div>

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

      {chestItem && (
        <ChestReveal
          itemName={chestItem.name}
          itemEmoji={chestItem.preview_emoji}
          rarity={chestItem.rarity}
          onComplete={handleChestComplete}
        />
      )}
    </div>
  );
}
