import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles, SkipBack, SkipForward, Play, Pause, Heart, Lightbulb, Wand2,
  Settings2, ChevronUp, ChevronDown, X, Check, RefreshCw, CalendarDays,
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { IdentityModal } from "@/components/modals/IdentityModal";
import {
  loadKid, KidProfile, loadFavs, toggleFav,
  INTEREST_TAGS, loadDailyTopics, saveDailyTopics,
} from "@/lib/profile";
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

/* ---------- 一键生成的故事段落 ---------- */
type Seg =
  | { kind: "text"; emoji: string; text: string; pinyin: string }
  | { kind: "quiz"; q: string; pinyin: string; options: string[]; answer: number; hint: string };

type GenStory = { title: string; emoji: string; tabKey: TabKey; segs: Seg[] };

const stripTag = (t: string) => t.replace(/^[^\u4e00-\u9fa5A-Za-z]+/, "").trim();

const buildGenStory = (kidName: string, interestTag: string, tabKey: TabKey): GenStory => {
  const interest = stripTag(interestTag) || "自然";
  const tab = TABS.find((t) => t.key === tabKey)!;
  const segs: Seg[] = [
    {
      kind: "text", emoji: "🌅",
      text: `从前有一个小朋友叫${kidName}，他特别喜欢${interest}。`,
      pinyin: `cóng qián yǒu yí gè xiǎo péng yǒu jiào ${kidName}, tā tè bié xǐ huān ${interest}.`,
    },
    {
      kind: "text", emoji: "🪄",
      text: `这一天，窗外飞来一只会说话的小精灵，邀请${kidName}一起去探险。`,
      pinyin: `zhè yì tiān, chuāng wài fēi lái yì zhī huì shuō huà de xiǎo jīng líng, yāo qǐng ${kidName} yì qǐ qù tàn xiǎn.`,
    },
    {
      kind: "quiz",
      q: "彩虹一共有几种颜色呢？",
      pinyin: "cǎi hóng yí gòng yǒu jǐ zhǒng yán sè ne?",
      options: ["5 种", "7 种", "10 种"],
      answer: 1,
      hint: "红橙黄绿青蓝紫，一共 7 种呀！",
    },
    {
      kind: "text", emoji: "🌈",
      text: `${kidName}骄傲地说：我知道，是七种颜色！小精灵竖起了大拇指。`,
      pinyin: `${kidName} jiāo ào de shuō: wǒ zhī dào, shì qī zhǒng yán sè! xiǎo jīng líng shù qǐ le dà mǔ zhǐ.`,
    },
    {
      kind: "text", emoji: "🚦",
      text: `他们一起穿过马路，要去神奇的${interest}王国。`,
      pinyin: `tā men yì qǐ chuān guò mǎ lù, yào qù shén qí de ${interest} wáng guó.`,
    },
    {
      kind: "quiz",
      q: "过马路看到红灯，应该怎么做？",
      pinyin: "guò mǎ lù kàn dào hóng dēng, yīng gāi zěn me zuò?",
      options: ["停下等待", "快快冲过", "和朋友赛跑"],
      answer: 0,
      hint: "红灯停、绿灯行，安全最重要！",
    },
    {
      kind: "text", emoji: "🏆",
      text: `小精灵笑着说：${kidName}真是个聪明又懂安全的好孩子！`,
      pinyin: `xiǎo jīng líng xiào zhe shuō: ${kidName} zhēn shì gè cōng míng yòu dǒng ān quán de hǎo hái zi!`,
    },
    {
      kind: "text", emoji: "🌙",
      text: `今天的${tab.label}小故事就到这里啦，晚安，做个甜甜的梦～`,
      pinyin: `jīn tiān de ${tab.label} xiǎo gù shì jiù dào zhè lǐ la, wǎn ān, zuò gè tián tián de mèng~`,
    },
  ];
  return { title: `${kidName}和${interest}的奇遇`, emoji: "✨", tabKey, segs };
};

const Story = () => {
  const [tab, setTab] = useState<TabKey>("puzzle");
  const [kid, setKid] = useState<KidProfile | null>(() => loadKid());
  const [identityOpen, setIdentityOpen] = useState(false);

  const [favs, setFavs] = useState<string[]>(() => loadFavs());
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState<Story>(STORIES.puzzle[0]);
  const [tip, setTip] = useState<string | null>(null);

  // 今日话题（每天可重新选择）
  const [topics, setTopics] = useState<string[]>(() => loadDailyTopics());
  const [topicsOpen, setTopicsOpen] = useState(false);

  // 生成的故事 & 全屏阅读视图
  const [gen, setGen] = useState<GenStory | null>(null);
  const [genOpen, setGenOpen] = useState(false);

  // 播放栏向上展开（拼音版）
  const [expanded, setExpanded] = useState(false);

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
  const tabMeta = TABS.find((t) => t.key === tab)!;

  // 当前可用兴趣 = 今日话题 ∪ 资料里的兴趣
  const activeInterests = useMemo(() => {
    const merged = Array.from(new Set([...(topics || []), ...(kid?.interests || [])]));
    return merged;
  }, [topics, kid]);

  /** 一键生成 → 打开全屏故事阅读 */
  const generateMine = () => {
    const pool = activeInterests.length ? activeInterests : ["🌈 自然"];
    const interest = pool[Math.floor(Math.random() * pool.length)];
    const story = buildGenStory(kidName, interest, tab);
    setGen(story);
    setGenOpen(true);
    setNow({
      id: `mine-${Date.now()}`, title: story.title, desc: story.segs[0].kind === "text" ? story.segs[0].text : "",
      mins: 6, emoji: story.emoji, tip: "听故事时，认真思考小问题哦～",
    });
    setPlaying(true);
  };

  const playStory = (s: Story) => { setNow(s); setPlaying(true); setGenOpen(false); };
  const stepStory = (dir: 1 | -1) => {
    const idx = list.findIndex((s) => s.id === now.id);
    const next = list[(idx + dir + list.length) % list.length] || list[0];
    playStory(next);
  };
  const onFav = () => setFavs(toggleFav(now.id));

  const toggleTopic = (t: string) => {
    setTopics((prev) => {
      const n = prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t];
      saveDailyTopics(n);
      return n;
    });
  };

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

        {/* 今日话题（每天可重新选择） */}
        <button
          onClick={() => setTopicsOpen(true)}
          className="mt-3 flex w-full items-center gap-2 rounded-2xl bg-card px-3.5 py-2.5 text-left shadow-soft active:scale-[0.99]"
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <div className="font-display text-[12px] font-extrabold text-foreground/80">今日感兴趣的话题</div>
            <div className="truncate text-[11.5px] text-muted-foreground">
              {topics.length ? topics.join(" · ") : "点击挑选，今天最想听什么？"}
            </div>
          </div>
          <RefreshCw className="h-4 w-4 text-foreground/40" />
        </button>

        {/* 极简一键生成专属故事 */}
        <div className={cn("mt-4 overflow-hidden rounded-[28px] bg-gradient-to-br p-5 shadow-card", tabMeta.color)}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-foreground/80" />
            <h2 className="font-display text-[13px] font-extrabold text-foreground/80">{tabMeta.label} · 我的专属故事</h2>
          </div>
          <p className="mt-1.5 font-display text-[18px] font-extrabold leading-snug text-foreground">
            为 <span className="text-primary">{kidName}</span> 量身讲一个充满
            <span className="text-primary"> {stripTag(activeInterests[0] || "") || "小惊喜"} </span>
            的故事吧！
          </p>
          {activeInterests.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeInterests.slice(0, 6).map((t) => (
                <span key={t} className="rounded-full bg-white/70 px-2.5 py-0.5 font-display text-[11px] font-extrabold text-foreground/70">
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setTopicsOpen(true)}
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

      {/* 生成故事全屏阅读 */}
      {genOpen && gen && (
        <GeneratedStoryView
          story={gen}
          tabColor={TABS.find((t) => t.key === gen.tabKey)!.color}
          onClose={() => setGenOpen(false)}
          onRegen={generateMine}
        />
      )}

      {/* 播放过程中悬浮的小知识气泡 */}
      {playing && tip && !expanded && !genOpen && (
        <div className="pointer-events-none fixed bottom-44 left-1/2 z-30 w-[88%] max-w-[420px] -translate-x-1/2 animate-fade-in">
          <div className="flex items-start gap-2 rounded-2xl bg-foreground/90 px-3.5 py-2.5 text-background shadow-pet backdrop-blur">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(48_100%_70%)]" />
            <span className="font-display text-[12.5px] font-bold leading-snug">{tip}</span>
          </div>
        </div>
      )}

      {/* 音频播放控制栏（可上拉展开拼音版文字） */}
      <PlayerBar
        now={now}
        tabMeta={tabMeta}
        playing={playing}
        favs={favs}
        expanded={expanded}
        gen={gen}
        onTogglePlay={() => setPlaying((p) => !p)}
        onPrev={() => stepStory(-1)}
        onNext={() => stepStory(1)}
        onFav={onFav}
        onToggleExpand={() => setExpanded((v) => !v)}
      />

      {/* 今日话题选择弹窗 */}
      {topicsOpen && (
        <DailyTopicsSheet
          selected={topics}
          onToggle={toggleTopic}
          onClose={() => setTopicsOpen(false)}
          onClear={() => { setTopics([]); saveDailyTopics([]); }}
        />
      )}

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

/* ---------- 播放栏（含上拉展开） ---------- */
const PlayerBar = ({
  now, tabMeta, playing, favs, expanded, gen,
  onTogglePlay, onPrev, onNext, onFav, onToggleExpand,
}: {
  now: Story;
  tabMeta: typeof TABS[number];
  playing: boolean;
  favs: string[];
  expanded: boolean;
  gen: GenStory | null;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onFav: () => void;
  onToggleExpand: () => void;
}) => {
  return (
    <>
      {/* 展开遮罩 */}
      {expanded && (
        <div className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm animate-fade-in" onClick={onToggleExpand} />
      )}

      <div
        className={cn(
          "fixed left-1/2 z-40 w-[94%] max-w-[460px] -translate-x-1/2 rounded-[28px] bg-card shadow-pet transition-all duration-300",
          expanded ? "bottom-4 max-h-[78vh]" : "bottom-24",
        )}
      >
        {/* 拉手 */}
        <button
          onClick={onToggleExpand}
          className="flex w-full justify-center pt-2"
          aria-label={expanded ? "收起" : "展开文字版"}
        >
          <span className="flex items-center gap-1 rounded-full bg-muted/70 px-3 py-0.5 font-display text-[10.5px] font-extrabold text-foreground/60">
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            {expanded ? "收起文字版" : "上拉看拼音故事"}
          </span>
        </button>

        {/* 展开区：拼音故事 */}
        {expanded && (
          <div className="max-h-[52vh] overflow-y-auto px-4 pb-3 pt-2">
            <div className="mb-2 font-display text-[16px] font-extrabold text-foreground">
              {now.emoji} {now.title}
            </div>
            {gen ? (
              <div className="space-y-3">
                {gen.segs.map((s, i) => (
                  <PinyinBlock key={i} seg={s} />
                ))}
              </div>
            ) : (
              <PinyinBlock
                seg={{
                  kind: "text",
                  emoji: now.emoji,
                  text: now.desc,
                  pinyin: "diǎn jī「yī jiàn shēng chéng」, kě yǐ tīng dài pīn yīn de zhuān shǔ gù shì ya~",
                }}
              />
            )}
            <div className="h-2" />
          </div>
        )}

        {/* 控制条 */}
        <div className="px-3.5 pb-3 pt-1">
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
            <button onClick={onPrev} aria-label="上一首"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground/70 active:scale-90">
              <SkipBack className="h-5 w-5" />
            </button>
            <button onClick={onTogglePlay} aria-label={playing ? "暂停" : "播放"}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-pop active:scale-90">
              {playing ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 translate-x-0.5" />}
            </button>
            <button onClick={onNext} aria-label="下一首"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground/70 active:scale-90">
              <SkipForward className="h-5 w-5" />
            </button>
            <button onClick={onFav} aria-label="收藏"
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full active:scale-90",
                favs.includes(now.id) ? "bg-[hsl(348_88%_70%)]/15 text-[hsl(348_88%_70%)]" : "bg-muted text-foreground/70",
              )}>
              <Heart className={cn("h-5 w-5", favs.includes(now.id) && "fill-current")} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ---------- 拼音段落块 ---------- */
const PinyinBlock = ({ seg }: { seg: Seg }) => {
  if (seg.kind === "quiz") {
    return (
      <div className="rounded-2xl bg-[hsl(48_100%_94%)] p-3">
        <div className="font-display text-[10.5px] font-extrabold text-[hsl(28_85%_55%)]">🧩 小问答</div>
        <div className="mt-0.5 leading-tight text-foreground/60 text-[10.5px] tracking-wide">{seg.pinyin}</div>
        <div className="font-display text-[15px] font-extrabold text-foreground">{seg.q}</div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {seg.options.map((o, i) => (
            <span key={i} className={cn(
              "rounded-xl bg-white px-2 py-1.5 text-center font-display text-[11.5px] font-extrabold",
              i === seg.answer ? "text-[hsl(140_55%_45%)] ring-1 ring-[hsl(140_55%_70%)]" : "text-foreground/70",
            )}>{o}</span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-card px-1 py-1">
      <div className="flex items-start gap-2">
        <span className="text-2xl">{seg.emoji}</span>
        <div className="flex-1">
          <div className="leading-tight text-foreground/55 text-[10.5px] tracking-wide">{seg.pinyin}</div>
          <div className="font-display text-[16px] font-extrabold leading-relaxed text-foreground">{seg.text}</div>
        </div>
      </div>
    </div>
  );
};

/* ---------- 全屏故事阅读（带百科问答互动） ---------- */
const GeneratedStoryView = ({
  story, tabColor, onClose, onRegen,
}: { story: GenStory; tabColor: string; onClose: () => void; onRegen: () => void }) => {
  const [picks, setPicks] = useState<Record<number, number>>({});

  const pick = (i: number, v: number) => setPicks((p) => ({ ...p, [i]: v }));

  return (
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[480px] flex-col bg-gradient-sky animate-fade-in">
      <div className="pointer-events-none absolute inset-0 bg-gradient-sun opacity-70" />
      <header className="relative flex items-center justify-between px-4 pt-4 pt-safe">
        <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-soft active:scale-95">
          <X className="h-5 w-5 text-foreground/70" />
        </button>
        <div className="font-display text-[14px] font-extrabold text-foreground/80">AI 益智故事</div>
        <button onClick={onRegen} className="flex h-10 items-center gap-1 rounded-full bg-card px-3 shadow-soft active:scale-95">
          <RefreshCw className="h-4 w-4 text-primary" />
          <span className="font-display text-[12px] font-extrabold text-primary">换一个</span>
        </button>
      </header>

      <div className="relative flex-1 overflow-y-auto px-4 pb-32 pt-2">
        <div className={cn("rounded-[28px] bg-gradient-to-br p-5 shadow-card", tabColor)}>
          <div className="text-5xl">{story.emoji}</div>
          <div className="mt-1 font-display text-[22px] font-extrabold leading-snug text-foreground">{story.title}</div>
          <div className="mt-1 text-[11.5px] text-foreground/60">穿插百科小问答 · 边听边学</div>
        </div>

        <div className="mt-4 space-y-3">
          {story.segs.map((s, i) =>
            s.kind === "text" ? (
              <div key={i} className="rounded-[24px] bg-card/90 p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-3xl">{s.emoji}</div>
                  <div className="flex-1">
                    <div className="leading-tight text-foreground/55 text-[11px] tracking-wide">{s.pinyin}</div>
                    <div className="font-display text-[17px] font-extrabold leading-relaxed text-foreground">{s.text}</div>
                  </div>
                </div>
              </div>
            ) : (
              <QuizCard key={i} seg={s} picked={picks[i]} onPick={(v) => pick(i, v)} />
            ),
          )}
        </div>
      </div>
    </div>
  );
};

const QuizCard = ({
  seg, picked, onPick,
}: { seg: Extract<Seg, { kind: "quiz" }>; picked: number | undefined; onPick: (i: number) => void }) => {
  const done = picked !== undefined;
  const correct = picked === seg.answer;
  return (
    <div className="rounded-[24px] bg-[hsl(48_100%_94%)] p-4 shadow-soft">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[hsl(28_85%_70%)] px-2 py-0.5 font-display text-[10px] font-extrabold text-white">百科问答</span>
        <Lightbulb className="h-4 w-4 text-[hsl(28_85%_55%)]" />
      </div>
      <div className="mt-2 leading-tight text-foreground/55 text-[11px] tracking-wide">{seg.pinyin}</div>
      <div className="font-display text-[17px] font-extrabold leading-snug text-foreground">{seg.q}</div>
      <div className="mt-3 grid grid-cols-1 gap-2">
        {seg.options.map((o, i) => {
          const isPick = picked === i;
          const isAns = i === seg.answer;
          const stateClass = !done
            ? "bg-white text-foreground/80 active:scale-[0.98]"
            : isAns
              ? "bg-[hsl(140_55%_88%)] text-[hsl(140_55%_30%)] ring-2 ring-[hsl(140_55%_60%)]"
              : isPick
                ? "bg-[hsl(0_70%_92%)] text-[hsl(0_70%_45%)]"
                : "bg-white text-foreground/50";
          return (
            <button key={i} disabled={done} onClick={() => onPick(i)}
              className={cn("flex items-center justify-between rounded-2xl px-4 py-3 text-left font-display text-[14.5px] font-extrabold shadow-soft transition", stateClass)}>
              <span>{o}</span>
              {done && isAns && <Check className="h-5 w-5" />}
            </button>
          );
        })}
      </div>
      {done && (
        <div className={cn(
          "mt-3 rounded-xl px-3 py-2 font-display text-[12.5px] font-extrabold",
          correct ? "bg-[hsl(140_55%_92%)] text-[hsl(140_55%_30%)]" : "bg-[hsl(48_100%_88%)] text-[hsl(28_85%_40%)]",
        )}>
          {correct ? "答对啦！🎉 " : "再想想哦～"}{seg.hint}
        </div>
      )}
    </div>
  );
};

/* ---------- 今日话题选择 Sheet ---------- */
const DailyTopicsSheet = ({
  selected, onToggle, onClose, onClear,
}: { selected: string[]; onToggle: (t: string) => void; onClose: () => void; onClear: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center">
    <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
    <div className="relative mx-auto w-full max-w-[480px] rounded-t-[32px] bg-card p-5 shadow-pet animate-fade-in">
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-[18px] font-extrabold text-foreground">今天想听什么呀？</div>
          <div className="text-[11.5px] text-muted-foreground">每天可以重新挑选感兴趣的话题</div>
        </div>
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted active:scale-90">
          <X className="h-4 w-4 text-foreground/60" />
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {INTEREST_TAGS.map((t) => {
          const active = selected.includes(t);
          return (
            <button
              key={t}
              onClick={() => onToggle(t)}
              className={cn(
                "rounded-full px-3.5 py-2 font-display text-[13px] font-extrabold transition active:scale-95",
                active
                  ? "bg-gradient-primary text-primary-foreground shadow-pop"
                  : "bg-muted text-foreground/70",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex gap-2">
        <button onClick={onClear} className="h-12 flex-1 rounded-2xl bg-muted font-display text-[14px] font-extrabold text-foreground/70 active:scale-[0.98]">
          清空
        </button>
        <button onClick={onClose} className="h-12 flex-[2] rounded-2xl bg-foreground/90 font-display text-[14px] font-extrabold text-background shadow-pop active:scale-[0.98]">
          就听这些 ✨
        </button>
      </div>
    </div>
  </div>
);

export default Story;
