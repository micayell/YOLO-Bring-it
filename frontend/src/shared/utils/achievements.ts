import type { Achievement, AchievementStats, SortOption } from "../types/achievements";

export const getRewardIcon = (reward: Achievement['reward']): string => {
  switch (reward.type) {
    case "coins": return "💰";
    case "badge": return "🎖️";
    case "skin": return "👕";
    case "character": return "👤";
    default: return "🎁";
  }
};

export const getRewardText = (reward: Achievement['reward']): string => {
  switch (reward.type) {
    case "coins": return `${reward.amount} 코인`;
    case "badge": return reward.name || "인장";
    case "skin": return reward.name || "스킨";
    case "character": return reward.name || "캐릭터";
    default: return "보상";
  }
};

export const calculateStats = (achievements: Achievement[]): AchievementStats => {
  const total = achievements.length;
  const completed = achievements.filter(a => a.completed).length;
  const inProgress = achievements.filter(a => !a.completed && a.progress > 0).length;
  const totalProgress = achievements.reduce((sum, a) => sum + (a.progress / a.maxProgress), 0);
  const overallProgress = Math.round((totalProgress / total) * 100);
  
  const difficultyCount = achievements.reduce((acc, a) => {
    acc[a.difficulty] = (acc[a.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return { total, completed, inProgress, overallProgress, difficultyCount };
};

export const filterAndSortAchievements = (
  achievements: Achievement[],
  selectedCategory: string,
  searchQuery: string,
  sortBy: SortOption,
  showCompleted: boolean
): Achievement[] => {
  let items = selectedCategory === "all"
    ? achievements
    : achievements.filter(achievement => achievement.category === selectedCategory);
  
  // 완료된 업적 필터
  if (!showCompleted) {
    items = items.filter(achievement => !achievement.completed);
  }
  
  // 검색 필터
  if (searchQuery) {
    items = items.filter(achievement => 
      achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // 정렬
  items.sort((a, b) => {
    switch (sortBy) {
      case "completion":
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return b.progress / b.maxProgress - a.progress / a.maxProgress;
      case "difficulty":
        const difficultyOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 };
        return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
      case "progress":
      default:
        const aProgress = a.progress / a.maxProgress;
        const bProgress = b.progress / b.maxProgress;
        if (Math.abs(aProgress - bProgress) < 0.01) {
          return b.maxProgress - a.maxProgress;
        }
        return bProgress - aProgress;
    }
  });
  
  return items;
};