import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles, SkipBack, SkipForward, Play, Pause, Heart, Lightbulb, Wand2, Settings2,
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { IdentityModal } from "@/components/modals/IdentityModal";
import { loadKid, KidProfile, loadFavs, toggleFav } from "@/lib/profile";
import { cn } from "@/lib/utils";

/* ---------- 5 大分类 ---------- */
const TABS = [
  { key: "puzzle",  label: "益智科普", emoji: "🧠", color: "from-[hsl(195_85%_88%)] to-[hsl(220_85%_92%)]" },
  { key: "habit",   label: "好习惯故事", emoji: "🌟", color: "from-[hsl(42_95%_88%)] to-[hsl(22_95%_92%)]" },
  { key: "nature",  label: "自然百科",   emoji: "🌿", color: "from-[hsl(140_55%_85%)] to-[hsl(170_60%_92%)]" },
  { key: "guoxue",  label: "国学启蒙",   emoji: "📖", color: "from-[hsl(15_70%_88%)] to-[hsl(35_80%_92%)]" },
  { key: "sleep",   label: "睡前治愈",   emoji: "🌙", color: "from-[hsl(258_70%_90%)] to-[hsl(220_70%_92%)]" },
] as const;
type TabKey = typeof TABS[number]["key"];

type Story = { id: string; title: string; desc: string; mins: number; emoji: string; tip: string };

const STORIES: Record<TabKey, Story[]> = {
  puzzle: [
    { id: "p1", title: "彩虹是怎么来的", desc: "雨滴里藏着小小的棱镜，把阳光分成七种颜色～", mins: 6, emoji: "🌈", tip: "小知识：彩虹其实是一个圆，只是地面挡住了下半圈！" },
    { id: "p2", title: "蜜蜂的舞蹈密码", desc: "蜜蜂用跳舞告诉同伴花在哪里。", mins: 7, emoji: "🐝", tip: "小知识：8 字舞是蜜蜂特有的导航语言。" },
    { id: "p3", title: "月亮为什么会变",   desc: "月亮的胖瘦原来跟太阳有关哦。", mins: 6, emoji: "🌝", tip: "小知识：月亮自己不发光，是反射太阳光。" },
    { id: "p4", title: "声音去旅行",       desc: "声音像看不见的小波浪，跑到你耳朵里。", mins: 5, emoji: "🔔", tip: "小知识：声音在水里跑得比在空气里快 4 倍！" },
  ],
  habit: [
    { id: "h1", title: "勇敢说对不起",   desc: "三个字的小魔法，让朋友重新笑起来。", mins: 5, emoji: "🤝", tip: "好习惯：做错事就大声说『对不起』，你超棒！" },
    { id: "h2", title: "我会自己刷牙",   desc: "上下上下，每颗小牙都干净。", mins: 4, emoji: "🪥", tip: "好习惯：每天早晚各刷一次，每次 3 分钟哦。" },
    { id: "h3", title: "玩具回家啦",     desc: "玩完玩具要送它们回家睡觉。", mins: 5, emoji: "🧸", tip: "好习惯：自己的事情自己做，整理也是本领！" },
    { id: "h4", title: "红绿灯小卫士",   desc: "过马路要拉好妈妈的手。", mins: 6, emoji: "🚦", tip: "安全提醒：红灯停、绿灯行、黄灯等一等。" },
  ],
  nature: [
    { id: "n1", title: "海底大冒险",     desc: "鲸鱼妈妈带我们看会发光的小鱼！", mins: 8, emoji: "🐋", tip: "小知识：深海有些鱼会自己发光当『手电筒』。" },
    { id: "n2", title: "恐龙的世界",     desc: "霸王龙真的有那么凶吗？", mins: 9, emoji: "🦖", tip: "小知识：科学家是通过化石来认识恐龙的。" },
    { id: "n3", title: "种子去旅行",     desc: "蒲公英坐着风的小飞船去远方。", mins: 5, emoji: "🌾", tip: "小知识：植物用风、水、动物来帮忙搬种子。" },
    { id: "n4", title: "蚂蚁的城堡",     desc: "蚂蚁的家比你想象的还热闹。", mins: 6, emoji: "🐜", tip: "小知识：蚂蚁会用气味和同伴说话。" },
  ],
  guoxue: [
    { id: "g1", title: "守株待兔",       desc: "等啊等，兔子还会来吗？", mins: 6, emoji: "🐰", tip: "小道理：好运不能只靠等，要自己努力呀。" },
    { id: "g2", title: "孟母三迁",       desc: "妈妈为我搬了三次家。", mins: 7, emoji: "🏡", tip: "小道理：好的环境会让我们变得更好。" },
    { id: "g3", title: "凿壁偷光",       desc: "古代小哥哥也很爱学习。", mins: 6, emoji: "🕯️", tip: "小道理：想做的事，再难也会有办法。" },
    { id: "g4", title: "刻舟求剑",       desc: "船动了，剑还在原地吗？", mins: 5, emoji: "⚔️", tip: "小道理：事情会变化，办法也要跟着变。" },
  ],
  sleep: [
    { id: "s1", title: "月亮上的兔子",   desc: "晚安啦，闭上眼睛飞到月亮上。", mins: 8, emoji: "🌙", tip: "睡前提醒：深呼吸三次，慢慢放松小肚子。" },
    { id: "s2", title: "云朵棉花糖",     desc: "天空里最甜的小雨滴。", mins: 6, emoji: "☁️", tip: "睡前提醒：把今天开心的事在心里数一遍。" },
    { id: "s3", title: "小熊的晚安",     desc: "森林里安静的好梦时间。", mins: 7, emoji: "🐻", tip: "睡前提醒：盖好小被子，让脚丫暖暖的。" },
    { id: "s4", title: "星星的家",       desc: "夜空里藏着会眨眼的图案。", mins: 8, emoji: "✨", tip: "睡前提醒：闭眼想象自己飘在云朵上～" },
  ],
};

const Story = () => {
  const [tab, setTab] = useState<TabKey>("puzzle");
  const [kid, setKid] = useState<KidProfile | null>(() => loadKid());
  const [identityOpen, setIdentityOpen] = useState(false);

  const [favs, setFavs] = useState<string[]>(() => loadFavs());
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState<Story>(STORIES.puzzle[0]);
  const [tip, setTip] = useState<string | null>(null);

  // 故事播放过程中，每隔 6s 浮一条小知识/好习惯提醒
  const tipTimer = useRef<number | null>(null);
  useEffect(() => {
    if (tipTimer.current) window.clearInterval(tipTimer.current);
    if (playing) {
      setTip(now.tip);
      tipTimer.current = window.setInterval(() => {
        setTip((cur) => (cur ? null : now.tip));
      }, 6000);
    } else {
      setTip(null);
    }
    return () => { if (tipTimer.current) window.clearInterval(tipTimer.current); };
  }, [playing, now.tip]);

  const list = STORIES[tab];
  const kidName = kid?.name || "小宝贝";

  /** 一键生成专属故事：基于孩子姓名 + 兴趣标签 + 当前分类，组装一条新卡片插到最前 */
  const customRef = useRef<Story | null>(null);
  const generateMine = () => {
    const interest = (kid?.interests?.[Math.floor(Math.random() * (kid?.interests?.length || 1))]) || "🌈 自然";
    const trimmed = interest.replace(/^[^\u4e00-\u9fa5A-Za-z]+/, "");
    const tabLabel = TABS.find((t) => t.key === tab)?.label ?? "";
    const story: Story = {
      id: `mine-${Date.now()}`,
      title: `${kidName}和${trimmed}的奇遇`,
      desc: `${kidName}今天要和小伙伴一起，去${trimmed}世界探险，学会勇敢和分享～`,
      mins: 6,
      emoji: "✨",
      tip: `小宝贝的专属故事里，悄悄藏了一个『${tabLabel}』小知识，听到了吗？`,
    };
    customRef.current = story;
    setNow(story);
    setPlaying(true);
  };

  const playStory = (s: Story) => { setNow(s); setPlaying(true); };
  const stepStory = (dir: 1 | -1) => {
    const idx = list.findIndex((s) => s.id === now.id);
    const next = list[(idx + dir + list.length) % list.length] || list[0];
    playStory(next);
  };
  const onFav = () => setFavs(toggleFav(now.id));

  const tabMeta = TABS.find((t) => t.key === tab)!;

  return (
    <PhoneShell>
      <div className="px-5 pt-4 pt-safe">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[26px] font-extrabold leading-tight text-foreground">故事工坊</h1>
            <p className="text-[12px] text-muted-foreground">
              {kid ? `${kidName}的专属故事屋` : "先让家长设置一下名字哦～"}
            </p>
          </div>
          <button
            onClick={() => setIdentityOpen(true)}
            aria-label="编辑资料"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-soft active:scale-95"
          >
            <Settings2 className="h-5 w-5 text-foreground/60" />
          </button>
        </div>

        {/* 顶部横向分类 */}
        <div className="mt-4 -mx-5 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-2.5">
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 font-display text-[14px] font-extrabold transition-all duration-200 active:scale-95",
                    active
                      ? "bg-gradient-primary text-primary-foreground shadow-pop scale-[1.03]"
                      : "bg-card text-foreground/70 shadow-soft",
                  )}
                >
                  <span className="text-base">{t.emoji}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 极简一键生成专属故事 */}
        <div className={cn("mt-4 overflow-hidden rounded-[28px] bg-gradient-to-br p-5 shadow-card", tabMeta.color)}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-foreground/80" />
            <h2 className="font-display text-[13px] font-extrabold text-foreground/80">{tabMeta.label} · 我的专属故事</h2>
          </div>
          <p className="mt-1.5 font-display text-[18px] font-extrabold leading-snug text-foreground">
            为 <span className="text-primary">{kidName}</span> 量身讲一个充满
            <span className="text-primary"> {kid?.interests?.[0]?.replace(/^[^\u4e00-\u9fa5A-Za-z]+/, "") || "小惊喜"} </span>
            的故事吧！
          </p>
          {kid?.interests?.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {kid.interests.slice(0, 5).map((t) => (
                <span key={t} className="rounded-full bg-white/70 px-2.5 py-0.5 font-display text-[11px] font-extrabold text-foreground/70">
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setIdentityOpen(true)}
              className="mt-2 font-display text-[11px] font-extrabold text-primary underline"
            >
              + 添加宝贝的兴趣
            </button>
          )}
          <button
            onClick={generateMine}
            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-foreground/90 font-display text-base font-extrabold text-background shadow-pop active:scale-[0.98]"
          >
            <Wand2 className="h-5 w-5" />
            一键生成【我的专属故事】
          </button>
        </div>

        {/* 故事卡片列表 */}
        <h3 className="mt-6 font-display text-lg font-extrabold text-foreground">{tabMeta.label}精选</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 pb-44">
          {list.map((s) => {
            const fav = favs.includes(s.id);
            const active = now.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => playStory(s)}
                className={cn(
                  "relative overflow-hidden rounded-[28px] bg-card p-3 text-left shadow-card transition-all active:scale-[0.97]",
                  active && "ring-2 ring-primary",
                )}
              >
                <div className={cn("flex h-24 items-center justify-center rounded-2xl bg-gradient-to-br text-5xl", tabMeta.color)}>
                  {s.emoji}
                </div>
                <div className="mt-2 font-display text-[15px] font-extrabold leading-tight text-foreground">{s.title}</div>
                <div className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-muted-foreground">{s.desc}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 font-display text-[11px] font-extrabold text-primary">
                    ▶ {s.mins} 分钟
                  </span>
                  {fav && <Heart className="h-4 w-4 fill-[hsl(348_88%_70%)] text-[hsl(348_88%_70%)]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 播放过程中悬浮的小知识气泡 */}
      {playing && tip && (
        <div className="pointer-events-none fixed bottom-44 left-1/2 z-30 w-[88%] max-w-[420px] -translate-x-1/2 animate-fade-in">
          <div className="flex items-start gap-2 rounded-2xl bg-foreground/90 px-3.5 py-2.5 text-background shadow-pet backdrop-blur">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(48_100%_70%)]" />
            <span className="font-display text-[12.5px] font-bold leading-snug">{tip}</span>
          </div>
        </div>
      )}

      {/* 音频播放控制栏 */}
      <div className="fixed bottom-24 left-1/2 z-30 w-[94%] max-w-[460px] -translate-x-1/2 rounded-[28px] bg-card px-3.5 py-3 shadow-pet">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl", tabMeta.color)}>
            {now.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-[14px] font-extrabold text-foreground">{now.title}</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {tabMeta.label} · {playing ? "播放中" : "已暂停"}
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-around">
          <button
            onClick={() => stepStory(-1)}
            aria-label="上一首"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground/70 active:scale-90"
          >
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "暂停" : "播放"}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-pop active:scale-90"
          >
            {playing ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 translate-x-0.5" />}
          </button>
          <button
            onClick={() => stepStory(1)}
            aria-label="下一首"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground/70 active:scale-90"
          >
            <SkipForward className="h-5 w-5" />
          </button>
          <button
            onClick={onFav}
            aria-label="收藏"
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full active:scale-90",
              favs.includes(now.id) ? "bg-[hsl(348_88%_70%)]/15 text-[hsl(348_88%_70%)]" : "bg-muted text-foreground/70",
            )}
          >
            <Heart className={cn("h-5 w-5", favs.includes(now.id) && "fill-current")} />
          </button>
        </div>
      </div>

      <IdentityModal
        open={identityOpen}
        onClose={() => setIdentityOpen(false)}
        onDone={(_id, k) => {
          if (k) setKid(k);
          setIdentityOpen(false);
        }}
      />
    </PhoneShell>
  );
};

export default Story;
