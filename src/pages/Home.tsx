import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Coins,
  Sparkles,
  MessageCircleHeart,
  Compass,
  Sparkle,
  ChevronRight,
  Hand,
  Bone,
  Music2,
  Rocket,
  RotateCw,
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { PetSwitcher, PetSwitcherTrigger } from "@/components/PetSwitcher";
import { MOODS, Mood, PetId, getPet, loadPetId, moodImage, savePetId } from "@/lib/pets";
import { cn } from "@/lib/utils";

/* -------------------- 问候语库 -------------------- */
const GREETINGS = {
  morning: ["梦见你啦～", "早安呀，我等你好久啦", "今天也是元气满满的一天！", "嗨，太阳出来啦", "我刚做了个香喷喷的梦", "你来啦，抱一个！", "今天想做点什么呢？"],
  noon: ["饿啦，肚子咕咕叫～", "中午好呀！", "今天午饭吃了什么？", "陪我玩一会嘛", "我给你留了个小礼物哦", "晒太阳的时间到啦", "嗨，午安"],
  evening: ["今天上学开心吗？", "回来啦！想你一整天了", "今天发生了什么有趣的事？", "我们聊聊天好不好", "傍晚的风好舒服呀", "我等你好久啦", "嘿嘿，你回来了"],
  night: ["有点困啦…", "今天也辛苦啦", "晚安前再陪我一下下？", "数小羊的时间到啦", "今天过得开心吗？", "梦里见呀", "我陪你一会儿就睡觉觉"],
};

/* -------------------- 互动台词 -------------------- */
const LINES = {
  head: ["嘿嘿好舒服～", "你的手好温柔呀", "再摸一下嘛！", "我最喜欢你啦", "心都化掉啦", "嗯～舒服"],
  belly: ["哈哈哈哈！痒死啦！", "啊哈哈不要不要～", "嘻嘻嘻笑得我打嗝啦", "肚子被发现了！哈哈哈"],
  back: ["嗯～背背好舒服", "再顺一点点～", "毛要被摸顺啦"],
  tail: ["哎呀！尾巴！", "我的尾巴最敏感啦", "嘿，别揪嘛～"],
  call: ["汪汪！我在这儿！", "嘿，你叫我？", "来啦来啦！"],
  jump: ["看我跳得高不高！", "蹦蹦蹦！", "耶！开心！", "飞起来啦！"],
  curious: ["嗯？那是什么呀？", "咦——", "我想想看…"],
  love: ["最喜欢你啦💕", "你是我的全世界", "心动的感觉～"],
  yawn: ["呼啊～有点困了", "想打个小盹～", "陪我睡一会嘛"],
  run: ["呼——风好大！", "追我呀追我呀！", "跑起来太爽啦！", "嗖——"],
  wow: ["哇！好厉害！", "嚯！眼睛发光啦！", "我看到星星啦！"],
  playful: ["嘻嘻～逗你玩的", "啦啦啦～", "歪头杀！"],
  dizzy: ["呜哇～转晕啦", "天旋地转…", "扶我起来…"],
  spin: ["看我转圈圈！", "哇——飞旋！", "晕但是开心！"],
};

const pickLine = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

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
    list.push({ id: "chat", emoji: "💬", title: "今天还没和我说话呢", desc: "我有好多悄悄话想告诉你～", cta: "去聊聊", to: "/chat", tone: "primary" });
  }
  if (hasQuiz) {
    list.push({ id: "quiz", emoji: "🧭", title: "新关卡解锁啦！", desc: "去森林小屋找找有什么宝贝", cta: "去冒险", to: "/quiz", tone: "secondary" });
  }
  if (intimacy >= 60) {
    list.push({ id: "secret", emoji: "💖", title: "我有个悄悄话…", desc: "凑过来一点，只告诉你一个人", cta: "听听看", to: "/chat", tone: "accent" });
  }
  if (list.length === 0) {
    list.push({ id: "play", emoji: "🎈", title: "一起玩个小游戏吧", desc: "今天的小冒险等你一起", cta: "去看看", to: "/quiz", tone: "primary" });
  }
  return list;
};

/* -------------------- 飘心动画 -------------------- */
type FloatingThing = { id: number; x: number; emoji?: string };

/* 大动作叠加层 — 与 mood 解耦，给宠物外层加一段夸张运动 */
type BigAction = "none" | "run-across" | "hop-triple" | "big-spin" | "boing" | "excite-shake" | "head-tilt";

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

  const [mood, setMood] = useState<Mood>("idle");
  // 当前宠物（持久化到 localStorage）
  const [petId, setPetId] = useState<PetId>(() => loadPetId());
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const currentPet = useMemo(() => getPet(petId), [petId]);
  const [bigAction, setBigAction] = useState<BigAction>("none");
  const bigActionTimer = useRef<number | null>(null);
  const [tapPulseId, setTapPulseId] = useState(0); // 触发宠物整体回弹（key 变更重放动画）
  const [bubble, setBubble] = useState<string | null>(null);
  const [hearts, setHearts] = useState<FloatingThing[]>([]);
  const [floats, setFloats] = useState<FloatingThing[]>([]);
  // 触点反馈：每次点触在精确位置生成一圈波纹 + 一组飞散粒子
  type TapFx = {
    id: number;
    x: number; // 相对宠物容器 0~1
    y: number;
    color: "head" | "back" | "belly" | "tail";
    particles: { dx: number; dy: number; emoji: string; delay: number }[];
  };
  const [taps, setTaps] = useState<TapFx[]>([]);
  const fxIdRef = useRef(0);
  const bubbleTimer = useRef<number | null>(null);
  const moodTimer = useRef<number | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());

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

  const showBubble = useCallback((text: string) => {
    setBubble(text);
    if (bubbleTimer.current) window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 2200);
  }, []);

  const setMoodFor = useCallback((m: Mood, ms: number) => {
    setMood(m);
    if (moodTimer.current) window.clearTimeout(moodTimer.current);
    moodTimer.current = window.setTimeout(() => setMood("idle"), ms);
  }, []);

  const spawnFx = useCallback((emoji?: string, count = 1) => {
    for (let i = 0; i < count; i++) {
      const id = ++fxIdRef.current;
      const x = 35 + Math.random() * 30;
      const item = { id, x, emoji };
      if (emoji) {
        setFloats((fs) => [...fs, item]);
        window.setTimeout(() => setFloats((fs) => fs.filter((f) => f.id !== id)), 1100);
      } else {
        setHearts((hs) => [...hs, item]);
        window.setTimeout(() => setHearts((hs) => hs.filter((h) => h.id !== id)), 1000);
      }
    }
  }, []);

  /* 大动作：身体级夸张运动（跑/连跳/翻转/起跳/抖/歪头），与 mood 解耦 */
  const BIG_DURATION: Record<Exclude<BigAction, "none">, number> = {
    "run-across": 2600,
    "hop-triple": 1600,
    "big-spin": 1100,
    boing: 1100,
    "excite-shake": 800,
    "head-tilt": 1400,
  };
  const playBigAction = useCallback((a: Exclude<BigAction, "none">) => {
    setBigAction(a);
    if (bigActionTimer.current) window.clearTimeout(bigActionTimer.current);
    bigActionTimer.current = window.setTimeout(
      () => setBigAction("none"),
      BIG_DURATION[a] + 50,
    );
  }, []);

  const markInteraction = () => (lastInteractionRef.current = Date.now());

  /* -------------------- 统一触点反馈 --------------------
   * 任何分区被点：450ms 节奏
   *  - 0ms: 在点击点生成柔光波纹（tap-ripple, 600ms）
   *  - 0~120ms: 6 颗粒子向外飞散（particle-burst, 900ms 错峰）
   *  - 0ms: 宠物整体一次轻微回弹（tap-squish, 450ms）
   */
  const PARTICLE_SETS: Record<TapFx["color"], string[]> = {
    head: ["💖", "✨", "💕"],
    back: ["✨", "🌟", "·"],
    belly: ["😆", "✨", "🤣"],
    tail: ["✨", "❓", "💫"],
  };

  const triggerTap = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, color: TapFx["color"]) => {
      const host = e.currentTarget.parentElement; // 宠物容器
      if (!host) return;
      const rect = host.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const id = ++fxIdRef.current;
      const palette = PARTICLE_SETS[color];
      const particles = Array.from({ length: 6 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.6 - 0.3;
        const dist = 38 + Math.random() * 18;
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist - 18, // 整体略向上
          emoji: palette[i % palette.length],
          delay: Math.round(Math.random() * 90),
        };
      });
      setTaps((t) => [...t, { id, x, y, color, particles }]);
      window.setTimeout(() => setTaps((t) => t.filter((p) => p.id !== id)), 1000);
      setTapPulseId((n) => n + 1); // 触发整体回弹
    },
    [],
  );

  // 摸头：数值互动 + 兴奋抖一下
  const onPatHead = (e: React.PointerEvent<HTMLButtonElement>) => {
    markInteraction();
    triggerTap(e, "head");
    showBubble(pickLine(LINES.head));
    setMoodFor("happy", 1400);
    playBigAction("excite-shake");
    if (petTodayCount < PET_DAILY_LIMIT) {
      setPetTodayCount((c) => c + 1);
      setIntimacy((v) => Math.min(100, v + 1));
      spawnFx(undefined, 1);
    }
  };

  // 摸肚子：纯情感，笑得歪头
  const onPatBelly = (e: React.PointerEvent<HTMLButtonElement>) => {
    markInteraction();
    triggerTap(e, "belly");
    showBubble(pickLine(LINES.belly));
    setMoodFor("laugh", 1900);
    playBigAction("head-tilt");
  };

  // 摸背：调皮歪头
  const onPatBack = (e: React.PointerEvent<HTMLButtonElement>) => {
    markInteraction();
    triggerTap(e, "back");
    showBubble(pickLine(LINES.back));
    setMoodFor("playful", 1500);
  };

  // 揪尾巴：吓一跳，蹦一下
  const onPokeTail = (e: React.PointerEvent<HTMLButtonElement>) => {
    markInteraction();
    triggerTap(e, "tail");
    showBubble(pickLine(LINES.tail));
    setMoodFor("wow", 1400);
    playBigAction("hop-triple");
  };

  // 呼叫：连蹦三跳
  const onCall = () => {
    markInteraction();
    showBubble(pickLine(LINES.call));
    setMoodFor("happy", 1700);
    playBigAction("hop-triple");
    spawnFx("✨", 3);
  };

  // 喂零食：兴奋抖+爱心
  const onFeed = () => {
    markInteraction();
    showBubble(pickLine(LINES.love));
    setMoodFor("love", 1800);
    playBigAction("excite-shake");
    spawnFx(undefined, 4);
    if (petTodayCount < PET_DAILY_LIMIT) {
      setIntimacy((v) => Math.min(100, v + 2));
      setPetTodayCount((c) => c + 1);
    }
  };

  // 唱歌：歪头杀
  const onSing = () => {
    markInteraction();
    showBubble("听～好好听！");
    setMoodFor("playful", 1600);
    playBigAction("head-tilt");
    spawnFx("🎵", 3);
  };

  // 跑！跨场跑过去
  const onRun = () => {
    markInteraction();
    showBubble(pickLine(LINES.run));
    setMoodFor("run", 2700);
    playBigAction("run-across");
    spawnFx("💨", 3);
  };

  // 转圈圈：360 大转 + 晕
  const onSpin = () => {
    markInteraction();
    showBubble(pickLine(LINES.spin));
    setMoodFor("playful", 1200);
    playBigAction("big-spin");
    // 转完晕一下
    window.setTimeout(() => {
      setMoodFor("dizzy", 1500);
      showBubble(pickLine(LINES.dizzy));
      spawnFx("💫", 3);
    }, 1100);
  };

  // 起跳：boing 蓄力大跳
  const onLeap = () => {
    markInteraction();
    showBubble(pickLine(LINES.jump));
    setMoodFor("wow", 1400);
    playBigAction("boing");
    spawnFx("⭐", 3);
  };

  // 自发动作：闲置 5s 后随机做个动作；其中包含夸张大动作
  useEffect(() => {
    const tick = window.setInterval(() => {
      if (mood !== "idle" || bigAction !== "none") return;
      if (Date.now() - lastInteractionRef.current < 5000) return;
      const h = new Date().getHours();
      const isLate = h >= 21 || h < 6;
      type Pick = { m: Mood; line: string; ms: number; fx?: string; big?: Exclude<BigAction, "none"> };
      const pool: Pick[] = isLate
        ? [
            { m: "sleep", line: pickLine(LINES.yawn), ms: 2400 },
            { m: "curious", line: pickLine(LINES.curious), ms: 1500, big: "head-tilt" },
          ]
        : [
            { m: "curious", line: pickLine(LINES.curious), ms: 1500, big: "head-tilt" },
            { m: "happy", line: pickLine(LINES.jump), ms: 1700, big: "hop-triple", fx: "✨" },
            { m: "love", line: pickLine(LINES.love), ms: 1700 },
            { m: "wow", line: pickLine(LINES.wow), ms: 1400, big: "boing", fx: "⭐" },
            { m: "playful", line: pickLine(LINES.playful), ms: 1500, big: "head-tilt" },
            { m: "run", line: pickLine(LINES.run), ms: 2700, big: "run-across", fx: "💨" },
            { m: "happy", line: "嘿嘿～", ms: 1300, big: "excite-shake" },
          ];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      showBubble(pick.line);
      setMoodFor(pick.m, pick.ms);
      if (pick.big) playBigAction(pick.big);
      if (pick.fx) spawnFx(pick.fx, 2);
      lastInteractionRef.current = Date.now();
    }, 3500);
    return () => window.clearInterval(tick);
  }, [mood, bigAction, showBubble, setMoodFor, spawnFx, playBigAction]);

  useEffect(() => {
    return () => {
      if (bubbleTimer.current) window.clearTimeout(bubbleTimer.current);
      if (moodTimer.current) window.clearTimeout(moodTimer.current);
      if (bigActionTimer.current) window.clearTimeout(bigActionTimer.current);
    };
  }, []);

  const intimacyMaxed = intimacy >= 100;

  // 不同 mood 对应的"内层小动作"动画类（呼吸/抖一下，与"大动作"叠加层独立）
  const moodAnimClass: Record<Mood, string> = {
    idle: "animate-float-slow",
    happy: "animate-pop-bounce",
    laugh: "animate-wiggle",
    jump: "animate-jump-up",
    curious: "animate-shake-x",
    love: "animate-pop-bounce",
    sleep: "animate-float-slow",
    wow: "animate-pop-bounce",
    playful: "animate-wiggle",
    run: "animate-shake-x",
    dizzy: "animate-wiggle",
  };

  const handlePickPet = (id: PetId) => {
    setPetId(id);
    savePetId(id);
    setSwitcherOpen(false);
    showBubble(`你好呀，我是${getPet(id).name}！`);
    setMoodFor("happy", 1600);
    playBigAction("excite-shake");
  };

  return (
    <PhoneShell>
      <div
        className="relative px-5 pt-safe"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* 顶栏：徽章 */}
        <header className="flex items-center justify-between gap-2 pt-4">
          <div className="flex items-center gap-2">
            <Badge tone="level" icon={<Sparkles className="h-3.5 w-3.5" />} text={`Lv.${level}`} />
            <PetSwitcherTrigger currentId={petId} onClick={() => setSwitcherOpen(true)} />
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
        <section className="relative mt-2 flex h-[56vh] min-h-[400px] items-end justify-center overflow-visible">
          {/* 远景光晕 */}
          <div className="pointer-events-none absolute left-1/2 top-6 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-soft opacity-60 blur-3xl" />
          {/* 地面光圈 */}
          <div className="absolute bottom-10 h-6 w-44 rounded-full bg-foreground/10 blur-md" />

          {/* 气泡 */}
          {bubble && (
            <div className="absolute left-1/2 top-2 z-30 -translate-x-1/2 animate-scale-in">
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
          {/* 飘 emoji */}
          {floats.map((f) => (
            <div
              key={f.id}
              className="pointer-events-none absolute bottom-36 z-30 animate-heart-burst text-2xl"
              style={{ left: `${f.x}%` }}
            >
              {f.emoji}
            </div>
          ))}

          {/* 宠物本体 — 多分区交互；多 mood 图层交叉淡入淡出实现丝滑切换 */}
          <div className="relative z-10 h-[400px] w-[300px]">
            {/* 最外层：大动作（跨场跑/连跳/翻转/起跳/抖/歪头），以 key 重放 */}
            <div
              key={`big-${bigAction}-${tapPulseId}`}
              className={cn(
                "relative h-full w-full will-change-transform",
                bigAction === "run-across" && "animate-run-across",
                bigAction === "hop-triple" && "animate-hop-triple",
                bigAction === "big-spin" && "animate-big-spin",
                bigAction === "boing" && "animate-boing",
                bigAction === "excite-shake" && "animate-excite-shake",
                bigAction === "head-tilt" && "animate-head-tilt",
              )}
            >
              {/* 中层：mood 小动作（呼吸/抖一下） */}
              <div
                key={`mood-${mood}`}
                className={cn(
                  "relative h-full w-full will-change-transform",
                  moodAnimClass[mood],
                )}
              >
                {/* 内层：每次点触一次 tap-squish */}
                <div
                  key={`pulse-${tapPulseId}`}
                  className={cn(
                    "relative h-full w-full will-change-transform",
                    tapPulseId > 0 && "animate-tap-squish",
                  )}
                >
                  {MOODS.map((m) => (
                    <img
                      key={m}
                      src={moodImage(currentPet, m)}
                      alt={m === mood ? currentPet.name : ""}
                      aria-hidden={m !== mood}
                      width={1024}
                      height={1024}
                      className={cn(
                        "absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_30px_30px_hsl(28_60%_40%/0.25)]",
                        "transition-opacity duration-300 ease-in-out",
                        m === mood ? "opacity-100" : "opacity-0",
                      )}
                      draggable={false}
                      loading={m === "idle" ? "eager" : "lazy"}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 触点反馈层：精确在点击点生成波纹 + 飞散粒子 */}
            <div className="pointer-events-none absolute inset-0 z-[25] overflow-visible">
              {taps.map((t) => {
                const ringColor =
                  t.color === "head"
                    ? "hsl(var(--heart) / 0.55)"
                    : t.color === "belly"
                    ? "hsl(var(--coin) / 0.55)"
                    : t.color === "tail"
                    ? "hsl(var(--level) / 0.55)"
                    : "hsl(var(--primary) / 0.55)";
                return (
                  <div
                    key={t.id}
                    className="absolute"
                    style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%` }}
                  >
                    {/* 波纹 */}
                    <span
                      className="absolute h-16 w-16 animate-tap-ripple rounded-full"
                      style={{
                        left: 0,
                        top: 0,
                        background: `radial-gradient(circle, ${ringColor} 0%, transparent 70%)`,
                      }}
                    />
                    {/* 粒子 */}
                    {t.particles.map((p, i) => (
                      <span
                        key={i}
                        className="absolute animate-particle-burst select-none text-base font-bold"
                        style={
                          {
                            left: 0,
                            top: 0,
                            "--tx": `${p.dx}px`,
                            "--ty": `${p.dy}px`,
                            animationDelay: `${p.delay}ms`,
                          } as React.CSSProperties
                        }
                      >
                        {p.emoji}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* 头部点击区 */}
            <button
              type="button"
              onPointerDown={onPatHead}
              aria-label="摸摸头"
              className="absolute left-1/2 top-[6%] z-20 h-[28%] w-[55%] -translate-x-1/2 rounded-[50%] transition-transform active:scale-[0.96]"
            />
            {/* 脸/胡子（顺毛） */}
            <button
              type="button"
              onPointerDown={onPatBack}
              aria-label="顺顺毛"
              className="absolute left-1/2 top-[30%] z-20 h-[18%] w-[60%] -translate-x-1/2 rounded-[40%] transition-transform active:scale-[0.96]"
            />
            {/* 肚子（中下） */}
            <button
              type="button"
              onPointerDown={onPatBelly}
              aria-label="挠挠肚子"
              className="absolute left-1/2 top-[52%] z-20 h-[30%] w-[55%] -translate-x-1/2 rounded-[40%] transition-transform active:scale-[0.96]"
            />
            {/* 尾巴（左下角） */}
            <button
              type="button"
              onPointerDown={onPokeTail}
              aria-label="碰碰尾巴"
              className="absolute bottom-[8%] left-[2%] z-20 h-[22%] w-[26%] rounded-full transition-transform active:scale-[0.94]"
            />
          </div>

          {/* 提示 */}
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-center font-display text-[11px] font-bold tracking-wide text-muted-foreground">
            <Sparkle className="mr-1 inline h-3 w-3 -translate-y-0.5" />
            摸头 · 顺毛 · 挠肚 · 碰尾巴
          </div>
        </section>

        {/* 动作工具条 — 两行，更多夸张动作 */}
        <div className="mt-1 grid grid-cols-3 gap-2 px-1">
          <ActionButton label="呼叫" icon={<Hand className="h-5 w-5" />} onClick={onCall} tone="primary" />
          <ActionButton label="喂零食" icon={<Bone className="h-5 w-5" />} onClick={onFeed} tone="accent" />
          <ActionButton label="唱歌" icon={<Music2 className="h-5 w-5" />} onClick={onSing} tone="secondary" />
          <ActionButton label="跑！" icon={<Rocket className="h-5 w-5" />} onClick={onRun} tone="primary" />
          <ActionButton label="起跳" icon={<Sparkles className="h-5 w-5" />} onClick={onLeap} tone="accent" />
          <ActionButton label="转圈圈" icon={<RotateCw className="h-5 w-5" />} onClick={onSpin} tone="secondary" />
        </div>

        {/* 推荐卡片 */}
        <SuggestionCard suggestion={suggestion} onGo={() => navigate(suggestion.to)} />

        {/* 下拉换卡片提示 */}
        <p className="mt-2 text-center font-display text-[11px] font-semibold text-muted-foreground/70">
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

const ActionButton = ({
  label,
  icon,
  onClick,
  tone,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  tone: "primary" | "secondary" | "accent";
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 rounded-2xl px-4 py-2 shadow-card transition-transform active:scale-95",
      tone === "primary" && "bg-primary-soft text-primary-foreground",
      tone === "secondary" && "bg-secondary/60 text-secondary-foreground",
      tone === "accent" && "bg-accent text-accent-foreground",
    )}
  >
    <span className="flex h-7 w-7 items-center justify-center">{icon}</span>
    <span className="font-display text-[11px] font-extrabold">{label}</span>
  </button>
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
        "group relative mt-3 w-full overflow-hidden rounded-3xl bg-gradient-card p-4 text-left shadow-card transition-transform active:scale-[0.98] animate-fade-in-up",
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
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-primary px-3 py-1.5 font-display text-xs font-bold text-primary-foreground shadow-pop">
          {ctaIcon}
          {suggestion.cta}
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
};

export default Home;
