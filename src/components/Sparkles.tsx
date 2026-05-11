import { cn } from "@/lib/utils";

/** 在容器内随机散落的小星星/装饰，纯装饰用 */
export const Sparkles = ({ className }: { className?: string }) => (
  <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
    <span className="absolute left-[6%]  top-[8%]  text-[hsl(48_100%_70%)] text-lg">✦</span>
    <span className="absolute right-[8%] top-[14%] text-[hsl(258_75%_75%)] text-base">✧</span>
    <span className="absolute left-[14%] top-[42%] text-[hsl(195_85%_70%)] text-sm">✦</span>
    <span className="absolute right-[12%] top-[48%] text-[hsl(348_88%_75%)] text-base">✧</span>
    <span className="absolute left-[8%]  bottom-[18%] text-[hsl(140_55%_60%)] text-sm">✦</span>
    <span className="absolute right-[10%] bottom-[10%] text-[hsl(42_100%_60%)] text-lg">✧</span>
    <span className="absolute left-[48%] top-[6%]  text-[hsl(258_75%_72%)] text-xs">✦</span>
    <span className="absolute left-[52%] bottom-[26%] text-[hsl(22_95%_72%)] text-sm">✧</span>
  </div>
);

/** 单色淡色块背景（卡通宠物卡片用） */
export const PALETTES = [
  "bg-[hsl(48_95%_88%)]",   // 奶油黄
  "bg-[hsl(348_85%_92%)]",  // 樱花粉
  "bg-[hsl(140_55%_88%)]",  // 薄荷绿
  "bg-[hsl(195_85%_90%)]",  // 天空蓝
  "bg-[hsl(258_70%_92%)]",  // 薰衣草
  "bg-[hsl(22_95%_90%)]",   // 蜜桃橘
  "bg-[hsl(170_60%_88%)]",  // 湖水青
  "bg-[hsl(15_85%_90%)]",   // 蜜瓜橘
  "bg-[hsl(310_70%_92%)]",  // 葡萄紫
];

export const paletteFor = (id: string) => {
  let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTES[h % PALETTES.length];
};
