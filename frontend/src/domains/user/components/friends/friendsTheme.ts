export const pageShell = "min-h-full bg-background text-foreground font-optimized";
export const section = "rounded-2xl shadow-sm border bg-card";
export const titleBlue = "game-text text-[#6dc4e8] font-bold";
export const subtleCard = "bg-card/80 backdrop-blur-sm rounded-xl border border-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden";
export const softCard = "bg-white/80 backdrop-blur-sm rounded-xl border border-border shadow-lg hover:shadow-xl transition-all duration-300";

export const padLg = "p-6 md:p-6";
export const padXl = "p-8";

export const touchTarget = "min-h-[44px]";

export const inputBase =
  "w-full bg-card/50 backdrop-blur-sm rounded-xl border border-border focus:border-[#6dc4e8] outline-none transition-all duration-300 game-text";

export const btnBase =
  "inline-flex items-center justify-center rounded-lg transition-all duration-300 game-text";
export const btnPrimary = `${btnBase} bg-[#6dc4e8] text-white hover:bg-[#5ab4d8]`;
export const btnSuccess = `${btnBase} bg-[#6bcf7f] text-white hover:bg-[#5bb86f]`;
export const btnMuted = `${btnBase} bg-muted text-muted-foreground hover:bg-muted/80`;
export const btnGhost = `${btnBase} text-muted-foreground hover:text-foreground hover:bg-card`;

export const tabBtn = (active: boolean) =>
  `${btnBase} px-4 py-2 text-sm font-medium ${
    active ? "bg-[#6dc4e8] text-white" : "bg-muted text-muted-foreground"
  }`;

export const statusColors: Record<
  "online" | "offline" | "playing",
  string
> = {
  online: "#6bcf7f",
  offline: "#9ca3af",
  playing: "#ffd93d",
};

export const statusText: Record<
  "online" | "offline" | "playing",
  string
> = {
  online: "온라인",
  offline: "오프라인",
  playing: "게임 중",
};