import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
    <div className="min-h-screen relative overflow-hidden pb-24"
      style={{
        background: "linear-gradient(180deg, hsl(28 35% 14%) 0%, hsl(25 30% 8%) 40%, hsl(222 40% 6%) 100%)",
      }}
    >
      {/* Leather grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='6' height='6' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }}
      />

      <TopStatusBar />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Header - Floodlight Chrome */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl flex items-center justify-center font-game-body text-sm text-foreground active:scale-95 transition-transform"
              style={{
                background: "linear-gradient(180deg, hsl(28 20% 22%) 0%, hsl(25 18% 15%) 100%)",
                border: "2px solid hsl(43 50% 35%)",
                boxShadow: "0 3px 0 hsl(25 30% 10%), inset 0 1px 0 hsl(43 40% 45% / 0.3)",
              }}
            >
              ←
            </motion.button>
            <div>
              <h1 className="font-game-title text-lg text-foreground" style={{ textShadow: "0 2px 0 hsl(25 40% 8%)" }}>
                Shop
              </h1>
              <span className="text-[9px] text-muted-foreground font-game-display tracking-[0.2em]">CUSTOMIZE YOUR STYLE</span>
            </div>
          </div>
          <CurrencyPill icon="🪙" value={coins} showPlus={false} />
        </div>

        {/* Category tabs - Stadium Concrete + Jersey Mesh */}
        <div className="flex gap-1 mb-5 rounded-2xl p-1"
          style={{
            background: "linear-gradient(180deg, hsl(25 15% 16%) 0%, hsl(25 12% 12%) 100%)",
            border: "1px solid hsl(25 20% 22% / 0.6)",
          }}
        >
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              className="flex-1 py-2.5 rounded-xl font-game-display text-[8px] tracking-widest transition-all flex items-center justify-center gap-1"
              style={category === c.key ? {
                background: "linear-gradient(180deg, hsl(43 70% 50%) 0%, hsl(35 60% 40%) 100%)",
                color: "hsl(25 40% 8%)",
                borderBottom: "3px solid hsl(35 50% 28%)",
                boxShadow: "0 2px 8px hsl(43 80% 45% / 0.3), inset 0 1px 0 hsl(43 80% 70% / 0.4)",
                fontWeight: 700,
              } : {
                color: "hsl(28 15% 55%)",
              }}
            >
              <span className="text-sm">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* Chalk divider */}
        <div className="h-px mb-4 mx-2 opacity-20"
          style={{ background: "repeating-linear-gradient(90deg, hsl(45 30% 80%) 0px, hsl(45 30% 80%) 8px, transparent 8px, transparent 14px)" }}
        />

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
