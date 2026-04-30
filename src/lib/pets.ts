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

import catOrange from "@/assets/pet-cat-orange.png";
import catGrey from "@/assets/pet-cat-grey.png";
import catSiamese from "@/assets/pet-cat-siamese.png";
import dogGolden from "@/assets/pet-dog-golden.png";
import dogShiba from "@/assets/pet-dog-shiba.png";

export type Mood =
  | "idle"
  | "happy"
  | "laugh"
  | "jump"
  | "sleep"
  | "curious"
  | "love"
  | "wow"
  | "playful"
  | "run"
  | "dizzy";

export const MOODS: Mood[] = [
  "idle", "happy", "laugh", "jump", "curious",
  "love", "sleep", "wow", "playful", "run", "dizzy",
];

export type PetId = "puppy" | "cat-orange" | "cat-grey" | "cat-siamese" | "dog-golden" | "dog-shiba";

export type PetDef = {
  id: PetId;
  name: string;
  species: "猫" | "狗";
  /** 每个 mood 对应的贴图。未提供的 mood 会回退到 idle。 */
  images: Partial<Record<Mood, string>> & { idle: string };
};

/* 默认那只「小伊呀」拥有完整的 mood 表情包；其余宠物先复用 idle 静帧（其它 mood 自动回退）。
 * 这样换宠后形象立即变化，但所有动作系统继续工作。 */
export const PETS: PetDef[] = [
  {
    id: "puppy",
    name: "小伊呀",
    species: "狗",
    images: {
      idle: petIdle, happy: petHappy, laugh: petLaugh, jump: petJump,
      sleep: petSleep, curious: petCurious, love: petLove, wow: petWow,
      playful: petPlayful, run: petRun, dizzy: petDizzy,
    },
  },
  { id: "cat-orange", name: "橘橘", species: "猫", images: { idle: catOrange } },
  { id: "cat-grey", name: "小灰", species: "猫", images: { idle: catGrey } },
  { id: "cat-siamese", name: "可可", species: "猫", images: { idle: catSiamese } },
  { id: "dog-golden", name: "金金", species: "狗", images: { idle: dogGolden } },
  { id: "dog-shiba", name: "豆豆", species: "狗", images: { idle: dogShiba } },
];

export const getPet = (id: PetId): PetDef => PETS.find((p) => p.id === id) ?? PETS[0];

/** 给定宠物的某个 mood 取图；若未定义则回退到 idle。 */
export const moodImage = (pet: PetDef, mood: Mood): string =>
  pet.images[mood] ?? pet.images.idle;

const STORAGE_KEY = "selectedPetId";
export const loadPetId = (): PetId => {
  if (typeof window === "undefined") return "puppy";
  const v = window.localStorage.getItem(STORAGE_KEY) as PetId | null;
  return v && PETS.some((p) => p.id === v) ? v : "puppy";
};
export const savePetId = (id: PetId) => {
  try { window.localStorage.setItem(STORAGE_KEY, id); } catch {}
};
