import petIdle from "@/assets/pet-idle.png";
import petHappy from "@/assets/pet-happy.png";
import petLaugh from "@/assets/pet-laugh.png";
import petJump from "@/assets/pet-jump.png";
import petSleep from "@/assets/pet-sleep.png";
import petCurious from "@/assets/pet-curious.png";
import petLove from "@/assets/pet-love.png";
import petWow from "@/assets/pet-wow.png";
import petPlayful from "@/assets/pet-playful.png";
import petRun from "@/assets/pet-run.png";
import petDizzy from "@/assets/pet-dizzy.png";

import dogGolden from "@/assets/pet-dog-golden.png";
import dogShiba from "@/assets/pet-dog-shiba.png";
import dogPekingese from "@/assets/pet-dog-pekingese.png";
import dogHusky from "@/assets/pet-dog-husky.png";
import dogDachshund from "@/assets/pet-dog-dachshund.png";
import dogSchnauzer from "@/assets/pet-dog-schnauzer.png";
import catOrange from "@/assets/pet-cat-orange.png";
import catGrey from "@/assets/pet-cat-grey.png";
import catSiamese from "@/assets/pet-cat-siamese.png";

export type Mood =
  | "idle" | "happy" | "laugh" | "jump" | "sleep"
  | "curious" | "love" | "wow" | "playful" | "run" | "dizzy";

export const MOODS: Mood[] = [
  "idle", "happy", "laugh", "jump", "curious",
  "love", "sleep", "wow", "playful", "run", "dizzy",
];

export type PetTier = "free" | "monthly" | "yearly";
export type PetSpecies = "猫" | "狗";

export type PetId =
  | "dog-golden" | "dog-shiba" | "dog-pekingese"
  | "dog-husky" | "dog-dachshund" | "dog-schnauzer"
  | "cat-orange" | "cat-tabby" | "cat-siamese";

export type PetDef = {
  id: PetId;
  name: string;
  species: PetSpecies;
  tier: PetTier;
  trait: string;       // 性格 / 介绍
  catchphrase: string; // 口头禅
  images: Partial<Record<Mood, string>> & { idle: string };
};

/* 默认那只主角拥有完整的 mood 表情包（金毛使用原 idle 全套表情），
 * 其余宠物先复用 idle 静帧，未提供的 mood 自动回退到 idle。 */
export const PETS: PetDef[] = [
  // —— 第一组：免费汪星 ——
  {
    id: "dog-golden", name: "金毛球球", species: "狗", tier: "free",
    trait: "热情大暖男，最爱抱抱",
    catchphrase: "汪～今天也想抱你！我们去玩吧～",
    images: {
      idle: dogGolden, happy: petHappy, laugh: petLaugh, jump: petJump,
      sleep: petSleep, curious: petCurious, love: petLove, wow: petWow,
      playful: petPlayful, run: petRun, dizzy: petDizzy,
    },
  },
  {
    id: "dog-shiba", name: "柴柴豆豆", species: "狗", tier: "free",
    trait: "傲娇小机灵，会假装听不见",
    catchphrase: "哼，谁要你陪嘛～其实有点想你。",
    images: { idle: dogShiba },
  },
  {
    id: "dog-pekingese", name: "京巴小团", species: "狗", tier: "free",
    trait: "皇宫小公主，爱被人夸",
    catchphrase: "今天我也是最可爱的吧？嘻嘻～",
    images: { idle: dogPekingese },
  },
  // —— 第二组：月卡会员狗狗 ——
  {
    id: "dog-husky", name: "哈士奇二二", species: "狗", tier: "monthly",
    trait: "拆家小天才，能量爆棚",
    catchphrase: "嗷呜！沙发刚才不是我拆的，真的！",
    images: { idle: dogHusky },
  },
  {
    id: "dog-dachshund", name: "腊肠小香", species: "狗", tier: "monthly",
    trait: "短腿大长身，跑起来超快",
    catchphrase: "腿短不重要，心很长就够啦～",
    images: { idle: dogDachshund },
  },
  {
    id: "dog-schnauzer", name: "雪纳瑞老爷", species: "狗", tier: "monthly",
    trait: "白胡子小绅士，喜欢讲道理",
    catchphrase: "嗯哼，作为绅士，我建议你先喝水。",
    images: { idle: dogSchnauzer },
  },
  // —— 第三组：年卡典藏猫咪 ——
  {
    id: "cat-orange", name: "橘座大人", species: "猫", tier: "yearly",
    trait: "圆圆胖胖，吃饭最积极",
    catchphrase: "喵～零食呢？我闻到了哦。",
    images: { idle: catOrange },
  },
  {
    id: "cat-tabby", name: "狸花小灰", species: "猫", tier: "yearly",
    trait: "敏捷小猎手，爱抓逗猫棒",
    catchphrase: "动一下试试？我可是专业的。",
    images: { idle: catGrey },
  },
  {
    id: "cat-siamese", name: "暹罗可可", species: "猫", tier: "yearly",
    trait: "蓝眼小贵族，爱撒娇",
    catchphrase: "喵呜～抱抱，再抱久一点点嘛。",
    images: { idle: catSiamese },
  },
];

export const getPet = (id: PetId): PetDef => PETS.find((p) => p.id === id) ?? PETS[0];
export const moodImage = (pet: PetDef, mood: Mood): string =>
  pet.images[mood] ?? pet.images.idle;

export const TIER_LABEL: Record<PetTier, string> = {
  free: "免费",
  monthly: "月卡",
  yearly: "年卡",
};

const STORAGE_KEY = "selectedPetId";
export const loadPetId = (): PetId => {
  if (typeof window === "undefined") return "dog-golden";
  const v = window.localStorage.getItem(STORAGE_KEY) as PetId | null;
  return v && PETS.some((p) => p.id === v) ? v : "dog-golden";
};
export const savePetId = (id: PetId) => {
  try { window.localStorage.setItem(STORAGE_KEY, id); } catch {}
};

/** 当前会员等级（演示用，存 localStorage） */
export type MemberLevel = "none" | "monthly" | "yearly";
const MEMBER_KEY = "memberLevel";
export const loadMember = (): MemberLevel => {
  if (typeof window === "undefined") return "none";
  return (window.localStorage.getItem(MEMBER_KEY) as MemberLevel) || "none";
};
export const saveMember = (m: MemberLevel) => {
  try { window.localStorage.setItem(MEMBER_KEY, m); } catch {}
};
export const canUnlock = (member: MemberLevel, tier: PetTier): boolean => {
  if (tier === "free") return true;
  if (tier === "monthly") return member === "monthly" || member === "yearly";
  return member === "yearly";
};
