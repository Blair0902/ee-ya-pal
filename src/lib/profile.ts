// 小朋友 / 家长 身份与初始化资料
export type Identity = "kid" | "parent" | null;

export type KidProfile = {
  name: string;
  age: number;
  interests: string[]; // 兴趣标签
};

const IDENTITY_KEY = "yiya.identity";
const PROFILE_KEY = "yiya.kidProfile";
const FAV_KEY = "yiya.storyFavs";

export const INTEREST_TAGS = [
  "🚀 太空", "🦕 恐龙", "🌊 海洋", "🐶 动物",
  "🌈 自然", "🧪 科学", "📚 国学", "🎨 艺术",
  "🦸 英雄", "🍰 美食", "🎵 音乐", "⚽ 运动",
] as const;

export const loadIdentity = (): Identity => {
  if (typeof window === "undefined") return null;
  return (window.localStorage.getItem(IDENTITY_KEY) as Identity) || null;
};
export const saveIdentity = (v: Identity) => {
  try {
    if (v) window.localStorage.setItem(IDENTITY_KEY, v);
    else window.localStorage.removeItem(IDENTITY_KEY);
  } catch {}
};

export const loadKid = (): KidProfile | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as KidProfile) : null;
  } catch { return null; }
};
export const saveKid = (p: KidProfile) => {
  try { window.localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {}
};

export const loadFavs = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAV_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
};
export const toggleFav = (id: string): string[] => {
  const cur = loadFavs();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  try { window.localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch {}
  return next;
};
