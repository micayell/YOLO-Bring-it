export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: "rounds" | "social" | "speed" | "streak" | "special";
  difficulty: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  icon: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  completedDate?: string;
  reward: {
    type: "coins" | "badge" | "skin" | "character";
    amount?: number;
    name?: string;
  };
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface AchievementCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
}

export interface AchievementStats {
  total: number;
  completed: number;
  inProgress: number;
  overallProgress: number;
  difficultyCount: Record<string, number>;
}

export type SortOption = "progress" | "difficulty" | "completion";