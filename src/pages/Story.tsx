import { useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { Sparkles, SkipBack, SkipForward, Play, Pause, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = ["睡前故事", "成长故事", "国学成语", "科普故事"] as const;
type Tab = (typeof TABS)[number];

const STORIES: Record<Tab, { title: string; desc: string; mins: number; emoji: string }[]> = {
  睡前故事: [
    { title: "月亮上的兔子", desc: "一只兔子和它的月亮朋友", mins: 8, emoji: "🌙" },
    { title: "云朵棉花糖", desc: "天空里最甜的小雨滴", mins: 6, emoji: "☁️" },
    { title: "小熊的晚安", desc: "森林里的安静夜晚", mins: 7, emoji: "🐻" },
    { title: "海底童谣", desc: "鲸鱼妈妈唱给小鱼听", mins: 9, emoji: "🐋" },
  ],
  成长故事: [
    { title: "勇敢的小蜗牛", desc: "慢一点，也能到达", mins: 5, emoji: "🐌" },
    { title: "分享的魔法", desc: "礼物为什么越分越多", mins: 6, emoji: "🎁" },
    { title: "对不起的力量", desc: "三个字的小魔法", mins: 5, emoji: "🤝" },
    { title: "小小种子", desc: "等待开花的耐心", mins: 7, emoji: "🌱" },
  ],
  国学成语: [
    { title: "守株待兔", desc: "你愿意一直等吗？", mins: 6, emoji: "🐰" },
    { title: "凿壁偷光", desc: "古代孩子的求学路", mins: 7, emoji: "🕯️" },
    { title: "孟母三迁", desc: "妈妈为我搬了三次家", mins: 8, emoji: "🏡" },
    { title: "刻舟求剑", desc: "船动了，剑还在原地吗", mins: 5, emoji: "⚔️" },
  ],
  科普故事: [
    { title: "彩虹是怎么来的", desc: "雨滴里的小棱镜", mins: 6, emoji: "🌈" },
    { title: "蜜蜂的舞蹈", desc: "用跳舞告诉同伴方向", mins: 7, emoji: "🐝" },
    { title: "树为什么会脱衣服", desc: "秋天的小秘密", mins: 5, emoji: "🍂" },
    { title: "星星的家", desc: "夜空里的图案宝藏", mins: 8, emoji: "✨" },
  ],
};

const Story = () => {
  const [tab, setTab] = useState<Tab>("睡前故事");
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("");
  const [playing, setPlaying] = useState(false);
  const [favIdx, setFavIdx] = useState<number | null>(null);
  const [nowPlaying, setNowPlaying] = useState({ idx: 0, title: "月亮上的兔子" });

  const list = STORIES[tab];

  return (
    <PhoneShell>
      <div className="px-5 pt-4 pt-safe">
        <h1 className="font-display text-[24px] font-extrabold text-foreground">故事工坊</h1>
        <p className="text-[12px] text-muted-foreground">让萌宠为你讲一个独一无二的故事</p>

        {/* 分类标签 */}
        <div className="mt-4 -mx-5 overflow-x-auto px-5 [scrollbar-width:none]" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-2 pb-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 font-display text-[13px] font-extrabold transition-all active:scale-95",
                  tab === t
                    ? "bg-gradient-primary text-primary-foreground shadow-pop"
                    : "bg-card text-foreground/70 shadow-soft",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 自定义生成 */}
        <div className="mt-4 rounded-3xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-extrabold text-foreground">为孩子定制专属故事</h2>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="孩子名字"
              className="h-11 rounded-2xl bg-muted px-3 text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="故事主题，如太空"
              className="h-11 rounded-2xl bg-muted px-3 text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            onClick={() => alert(`已为 ${name || "小朋友"} 生成「${theme || "魔法森林"}」主题故事～`)}
            className="mt-3 h-11 w-full rounded-2xl bg-gradient-primary font-display text-sm font-extrabold text-primary-foreground shadow-pop active:scale-[0.98]"
          >
            ✨ 生成故事
          </button>
        </div>

        {/* 故事卡片列表 */}
        <h3 className="mt-5 font-display text-base font-extrabold text-foreground">{tab}精选</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 pb-32">
          {list.map((s, i) => (
            <button
              key={s.title}
              onClick={() => { setNowPlaying({ idx: i, title: s.title }); setPlaying(true); }}
              className="overflow-hidden rounded-3xl bg-card p-3 text-left shadow-card active:scale-[0.98]"
            >
              <div className="flex h-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-soft to-secondary/40 text-3xl">
                {s.emoji}
              </div>
              <div className="mt-2 font-display text-[13px] font-extrabold text-foreground">{s.title}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">{s.desc}</div>
              <div className="mt-1.5 text-[10px] font-bold text-primary">▶ {s.mins} 分钟</div>
            </button>
          ))}
        </div>
      </div>

      {/* 音频播放控制栏（悬浮在 Tab 上方） */}
      <div className="fixed bottom-24 left-1/2 z-30 w-[92%] max-w-[440px] -translate-x-1/2 rounded-full bg-card px-3 py-2 shadow-pet">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-lg">📖</div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-[12px] font-extrabold text-foreground">{nowPlaying.title}</div>
            <div className="truncate text-[10px] text-muted-foreground">{tab} · 正在播放</div>
          </div>
          <div className="flex items-center gap-0.5">
            <button className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 active:scale-90">
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-pop active:scale-90"
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 active:scale-90">
              <SkipForward className="h-4 w-4" />
            </button>
            <button
              onClick={() => setFavIdx(nowPlaying.idx)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[hsl(348_88%_70%)] active:scale-90"
            >
              <Heart className={cn("h-4 w-4", favIdx === nowPlaying.idx && "fill-current")} />
            </button>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
};

export default Story;
