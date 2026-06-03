import React, { useState } from "react";

interface GameIconProps {
  game: string;
  className?: string;
  fallbackText?: string;
  iconUrl?: string;
}

export default function GameIcon({ game, className = "w-10 h-10", fallbackText, iconUrl }: GameIconProps) {
  const normKey = game.toLowerCase().trim();
  const [hasError, setHasError] = useState(false);

  // Map of game keys to reliable official direct Steam capsule/image URLs
  const gameImageMap: Record<string, string> = {
    dayz: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/221100/header.jpg",
    minecraft: "https://img.icons8.com/color/512/minecraft.png",
    cs2: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg",
    csgo: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg",
    valheim: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/892970/header.jpg",
    rust: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/header.jpg",
    palworld: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/header.jpg",
    factorio: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/427520/header.jpg",
    satisfactory: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/526870/header.jpg",
    gmod: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4000/header.jpg",
    terraria: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg",
  };

  // Try using the premium dynamic iconUrl if available
  let matchedUrl = iconUrl || "";
  if (!matchedUrl && (game.startsWith("http://") || game.startsWith("https://"))) {
    matchedUrl = game;
  }

  // Fallback to standard local game keys
  if (!matchedUrl) {
    for (const [key, url] of Object.entries(gameImageMap)) {
      if (normKey.includes(key)) {
        matchedUrl = url;
        break;
      }
    }
  }

  // Fallback if not configured or image load failed
  if (!matchedUrl || hasError) {
    return (
      <div className={`flex items-center justify-center font-bold font-mono text-indigo-400 text-[10px] uppercase shadow-inner bg-neutral-900 border border-neutral-800 rounded-lg ${className}`}>
        {fallbackText ? fallbackText.slice(0, 3) : game.slice(0, 3).toUpperCase()}
      </div>
    );
  }

  // Render original official logo cover with a modern glass ring styling
  return (
    <div className={`relative overflow-hidden rounded-lg border-2 border-indigo-500/20 bg-[#161622] group hover:border-indigo-505/50 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)] flex items-center justify-center ${className}`}>
      <img
        src={matchedUrl}
        alt={game}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
      />
      {/* Dynamic light shine reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
    </div>
  );
}
