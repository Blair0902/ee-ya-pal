import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Coins, Sparkles, MessageCircleHeart, Compass, Sparkle, ChevronRight } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import petIdle from "@/assets/pet-idle.png";
import petHappy from "@/assets/pet-happy.png";
import petLaugh from "@/assets/pet-laugh.png";
import { cn } from "@/lib/utils";

/* -------------------- 问候语库 -------------------- */
const GREETINGS = {
  morning: ["梦见你啦～", "早安呀，我等你好久啦", "今天也是元气满满的一天！", "嗨，太阳出来啦", "我刚做了个香喷喷的梦", "你来啦，抱一个！", "今天想做点什么呢？"],
  noon: ["饿啦，肚子咕咕叫～", "中午好呀！", "今天午饭吃了什么？", "陪我玩一会嘛", "我给你留了个小礼物哦", "晒太阳的时间到啦", "嗨，午安"],
  evening: ["今天上学开心吗？", "回来啦！想你一整天了", "今天发生了什么有趣的事？", "我们聊聊天好不好", "傍晚的风好舒服呀", "我等你好久啦", "嘿嘿，你回来了"],
  night: ["有点困啦…", "今天也辛苦啦", "晚安前再陪我一下下？", "数小羊的时间到啦", "今天过得开心吗？", "梦里见呀", "我陪你一会儿就睡觉觉"],
};

const PET_LINES_PET = [
  "嘿嘿好舒服～",
  "你的手好温柔呀",
  "再摸一下嘛！",
  "我最喜欢你啦",
  "心都化掉啦",
  "嗯～舒服",
];
const PET_LINES_BELLY = [
  "哈哈哈哈！痒死啦！",
  "啊哈哈不要不要～",
  "嘻嘻嘻笑得我打嗝啦",
  "肚子被发现了！哈哈哈",
];

type TimeBand = keyof typeof GREETINGS;
const getTimeBand = (): TimeBand => {
  const h = new Date().getHours();
  if (h < 11) return "morning";
  if (h < 14) return "noon";
  if (h < 19) return "evening";
  return "night";
};

const dailyIndex = (len: number) => {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return seed % len;
};

/* -------------------- 推荐卡 -------------------- */
type Suggestion = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  cta: string;
  to: string;
  tone: "primary" | "secondary" | "accent";
};

const buildSuggestions = (chattedToday: boolean, hasQuiz: boolean, intimacy: number): Suggestion[] => {
  const list: Suggestion[] = [];
  if (!chattedToday) {
    list.push({
      id: "chat",
      emoji: "💬",
      title: "今天还没和我说话呢",
      desc: "我有好多悄悄话想告诉你～",
      cta: "去聊聊",
      to: "/chat",
      tone: "primary",
    });
  }
  if (hasQuiz) {
    list.push({
      id: "quiz",
      emoji: "🧭",
      title: "新关卡解锁啦！",
      desc: "去森林小屋找找有什么宝贝",
      cta: "去冒险",
      to: "/quiz",
      tone: "secondary",
    });
  }
  if (intimacy >= 60) {
    list.push({
      id: "secret",
      emoji: "💖",
      title: "我有个悄悄话…",
      desc: "凑过来一点，只告诉你一个人",
      cta: "听听看",
      to: "/chat",
      tone: "accent",
    });
  }
  if (list.length === 0) {
    list.push({
      id: "play",
      emoji: "🎈",
      title: "一起玩个小游戏吧",
      desc: "今天的小冒险等你一起",
      cta: "去看看",
      to: "/quiz",
      tone: "primary",
    });
  }
  return list;
};

/* -------------------- 飘心动画 -------------------- */
type FloatingHeart = { id: number; x: number };

const Home = () => {
  const navigate = useNavigate();
  const [band] = useState<TimeBand>(getTimeBand());
  const greeting = useMemo(() => {
    const arr = GREETINGS[band];
    return arr[dailyIndex(arr.length)];
  }, [band]);

  // 状态：等级 / 亲密度 / 金币
  const [level] = useState(3);
  const [intimacy, setIntimacy] = useState(42);
  const [coins] = useState(128);
  const [petTodayCount, setPetTodayCount] = useState(0);
  const PET_DAILY_LIMIT = 5;

  // 宠物表情：idle / happy / laugh
  const [mood, setMood] = useState<"idle" | "happy" | "laugh">("idle");
  const [bubble, setBubble] = useState<string | null>(null);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const heartIdRef = useRef(0);
  const bubbleTimer = useRef<number | null>(null);
  const moodTimer = useRef<number | null>(null);

  // 推荐卡片
  const [chattedToday] = useState(false);
  const [hasQuiz] = useState(true);
  const suggestions = useMemo(
    () => buildSuggestions(chattedToday, hasQuiz, intimacy),
    [chattedToday, hasQuiz, intimacy],
  );
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const suggestion = suggestions[suggestionIdx % suggestions.length];

  // 下拉换一张
  const touchStartY = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 0) touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current == null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (dy > 60) setSuggestionIdx((i) => i + 1);
    touchStartY.current = null;
  };

  const showBubble = (text: string) => {
    setBubble(text);
    if (bubbleTimer.current) window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 2200);
  };

  const setMoodFor = (m: "happy" | "laugh", ms: number) => {
    setMood(m);
    if (moodTimer.current) window.clearTimeout(moodTimer.current);
    moodTimer.current = window.setTimeout(() => setMood("idle"), ms);
  };

  // 摸头：数值互动
  const onPatHead = () => {
    const line = PET_LINES_PET[Math.floor(Math.random() * PET_LINES_PET.length)];
    showBubble(line);
    setMoodFor("happy", 1300);
    if (petTodayCount < PET_DAILY_LIMIT) {
      setPetTodayCount((c) => c + 1);
      setIntimacy((v) => Math.min(100, v + 1));
      // 飘爱心
      const id = ++heartIdRef.current;
      const x = 40 + Math.random() * 20;
      setHearts((hs) => [...hs, { id, x }]);
      window.setTimeout(() => setHearts((hs) => hs.filter((h) => h.id !== id)), 1000);
    }
  };

  // 摸肚子：纯情感互动
  const onPatBelly = () => {
    const line = PET_LINES_BELLY[Math.floor(Math.random() * PET_LINES_BELLY.length)];
    showBubble(line);
    setMoodFor("laugh", 1800);
  };

  useEffect(() => {
    return () => {
      if (bubbleTimer.current) window.clearTimeout(bubbleTimer.current);
      if (moodTimer.current) window.clearTimeout(moodTimer.current);
    };
  }, []);

  const petSrc = mood === "laugh" ? petLaugh : mood === "happy" ? petHappy : petIdle;
  const intimacyMaxed = intimacy >= 100;

  return (
    <PhoneShell>
      <div
        className="relative px-5 pt-safe"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* 顶栏：徽章 */}
        <header className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <Badge tone="level" icon={<Sparkles className="h-3.5 w-3.5" />} text={`Lv.${level}`} />
          </div>
          <div className="flex items-center gap-2">
            <IntimacyBadge value={intimacy} maxed={intimacyMaxed} />
            <Badge tone="coin" icon={<Coins className="h-3.5 w-3.5" />} text={String(coins)} />
          </div>
        </header>

        {/* 问候 */}
        <h1 className="mt-5 text-balance font-display text-[26px] font-extrabold leading-tight text-foreground animate-fade-in-up">
          {greeting}
        </h1>

        {/* 宠物舞台 */}
        <section className="relative mt-3 flex h-[58vh] min-h-[420px] items-end justify-center">
          {/* 远景光晕 */}
          <div className="pointer-events-none absolute left-1/2 top-6 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-soft opacity-60 blur-3xl" />

          {/* 地面光圈 */}
          <div className="absolute bottom-10 h-6 w-44 rounded-full bg-foreground/10 blur-md" />

          {/* 气泡 */}
          {bubble && (
            <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 animate-scale-in">
              <div className="relative max-w-[260px] rounded-3xl bg-card px-4 py-2.5 text-center font-display text-sm font-bold text-foreground shadow-card">
                {bubble}
                <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-card" />
              </div>
            </div>
          )}

          {/* 飘爱心 */}
          {hearts.map((h) => (
            <div
              key={h.id}
              className="pointer-events-none absolute bottom-32 z-30 animate-heart-burst"
              style={{ left: `${h.x}%` }}
            >
              <Heart className="h-7 w-7 fill-heart text-heart drop-shadow-md" />
            </div>
          ))}

          {/* 宠物本体 — 上半部分（头）摸 → 加亲密度；下半部分（肚子）摸 → 笑倒 */}
          <div className="relative z-10 h-[420px] w-[320px] animate-float">
            <button
              type="button"
              onClick={onPatHead}
              aria-label="摸摸头"
              className="absolute inset-x-0 top-0 z-20 h-[55%] w-full rounded-t-[40%] active:scale-[0.98]"
            />
            <button
              type="button"
              onClick={onPatBelly}
              aria-label="摸摸肚子"
              className="absolute inset-x-0 bottom-0 z-20 h-[45%] w-full rounded-b-[40%] active:scale-[0.98]"
            />
            <img
              src={petSrc}
              alt="小伊呀"
              width={320}
              height={420}
              className={cn(
                "h-full w-full select-none object-contain drop-shadow-[0_30px_30px_hsl(28_60%_40%/0.25)] transition-all duration-300",
                mood === "happy" && "animate-pop-bounce",
                mood === "laugh" && "animate-wiggle",
              )}
              draggable={false}
            />
          </div>

          {/* 提示 */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-center font-display text-[11px] font-bold tracking-wide text-muted-foreground">
            <Sparkle className="mr-1 inline h-3 w-3 -translate-y-0.5" />
            摸摸头 · 挠挠肚子
          </div>
        </section>

        {/* 推荐卡片 */}
        <SuggestionCard suggestion={suggestion} onGo={() => navigate(suggestion.to)} />

        {/* 下拉换卡片提示 */}
        <p className="mt-3 text-center font-display text-[11px] font-semibold text-muted-foreground/70">
          下拉换一张 ↓
        </p>
      </div>
    </PhoneShell>
  );
};

/* -------------------- 子组件 -------------------- */

const Badge = ({
  tone,
  icon,
  text,
}: {
  tone: "level" | "coin";
  icon: React.ReactNode;
  text: string;
}) => (
  <div
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-display text-xs font-bold shadow-soft",
      tone === "level" && "bg-level/30 text-level-foreground",
      tone === "coin" && "bg-coin/25 text-coin-foreground",
    )}
  >
    {icon}
    {text}
  </div>
);

const IntimacyBadge = ({ value, maxed }: { value: number; maxed: boolean }) => (
  <div
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full bg-card px-2 py-1 shadow-soft",
      maxed && "bg-gradient-heart text-heart-foreground",
    )}
    aria-label={`亲密度 ${value}`}
  >
    <Heart className={cn("h-3.5 w-3.5", maxed ? "fill-white text-white" : "fill-heart text-heart")} />
    <div className="relative h-1.5 w-14 overflow-hidden rounded-full bg-muted">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-heart transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
    <span className={cn("font-display text-[11px] font-bold", maxed ? "text-white" : "text-foreground")}>
      {value}
    </span>
  </div>
);

const SuggestionCard = ({
  suggestion,
  onGo,
}: {
  suggestion: Suggestion;
  onGo: () => void;
}) => {
  const ctaIcon =
    suggestion.id === "chat" || suggestion.id === "secret" ? (
      <MessageCircleHeart className="h-4 w-4" />
    ) : (
      <Compass className="h-4 w-4" />
    );
  return (
    <button
      key={suggestion.id}
      onClick={onGo}
      className={cn(
        "group relative mt-2 w-full overflow-hidden rounded-3xl bg-gradient-card p-4 text-left shadow-card transition-transform active:scale-[0.98] animate-fade-in-up",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl",
            suggestion.tone === "primary" && "bg-primary-soft",
            suggestion.tone === "secondary" && "bg-secondary/50",
            suggestion.tone === "accent" && "bg-accent",
          )}
        >
          {suggestion.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] font-extrabold leading-tight text-foreground">
            {suggestion.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{suggestion.desc}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-display text-xs font-bold text-primary-foreground shadow-pop bg-gradient-primary",
          )}
        >
          {ctaIcon}
          {suggestion.cta}
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
};

export default Home;
