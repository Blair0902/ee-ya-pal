import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CloudRain, Waves, Trees, Music2, Moon, ArrowLeft, Power, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

const NOISES = [
  { id: "rain", label: "雨声", icon: CloudRain },
  { id: "wave", label: "海浪", icon: Waves },
  { id: "forest", label: "森林", icon: Trees },
  { id: "music", label: "轻音乐", icon: Music2 },
];

const STORIES = [
  { title: "月亮船", mins: 12, emoji: "🌙" },
  { title: "星空摇篮曲", mins: 10, emoji: "✨" },
  { title: "云朵旅行", mins: 8, emoji: "☁️" },
  { title: "森林小屋", mins: 14, emoji: "🌲" },
];

const TIMERS = [15, 30, 60];

const Sleep = () => {
  const navigate = useNavigate();
  const [noises, setNoises] = useState<Set<string>>(new Set(["rain"]));
  const [timer, setTimer] = useState(30);
  const [story, setStory] = useState(0);
  const [playing, setPlaying] = useState(true);

  const toggleNoise = (id: string) => {
    setNoises((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-[hsl(230_30%_10%)]">
      {/* 星空装饰 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[20%] h-72 w-72 -translate-x-1/2 rounded-full bg-[hsl(258_60%_30%)]/40 blur-3xl" />
        <div className="absolute right-[-10%] top-[5%] h-44 w-44 rounded-full bg-[hsl(220_60%_25%)]/40 blur-3xl" />
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/60"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 60}%`,
              opacity: 0.3 + ((i * 7) % 10) / 20,
              animation: `pulse 2.5s ease-in-out ${i * 200}ms infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col px-5 pb-28 pt-safe">
        {/* 顶栏 */}
        <header className="flex items-center justify-between pt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/80 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-white/70">
            <Moon className="h-4 w-4" />
            <span className="font-display text-sm font-extrabold">睡前哄睡</span>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/80 active:scale-95">
            <Power className="h-5 w-5" />
          </button>
        </header>

        <h1 className="mt-4 font-display text-[22px] font-extrabold text-white">晚安啦，慢慢闭上眼睛～</h1>
        <p className="text-[12px] text-white/50">挑一个声音，挑一个故事，盖好被子</p>

        {/* 白噪音 */}
        <h2 className="mt-6 font-display text-sm font-extrabold text-white/80">白噪音</h2>
        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {NOISES.map(({ id, label, icon: Icon }) => {
            const on = noises.has(id);
            return (
              <button
                key={id}
                onClick={() => toggleNoise(id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-3xl py-3 transition-all active:scale-95",
                  on
                    ? "bg-gradient-to-br from-[hsl(258_55%_45%)] to-[hsl(220_60%_40%)] text-white shadow-pop"
                    : "bg-white/5 text-white/60",
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="font-display text-[11px] font-bold">{label}</span>
              </button>
            );
          })}
        </div>

        {/* 故事列表 */}
        <h2 className="mt-6 font-display text-sm font-extrabold text-white/80">催眠故事</h2>
        <ul className="mt-3 space-y-2">
          {STORIES.map((s, i) => {
            const active = story === i;
            return (
              <li key={s.title}>
                <button
                  onClick={() => setStory(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl p-3 transition-all active:scale-[0.99]",
                    active ? "bg-white/10 ring-1 ring-white/20" : "bg-white/5",
                  )}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-xl">
                    {s.emoji}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-display text-[13px] font-extrabold text-white/90">{s.title}</div>
                    <div className="text-[10px] text-white/50">{s.mins} 分钟</div>
                  </div>
                  <div className={cn("text-xs font-bold", active ? "text-white" : "text-white/40")}>
                    {active ? "播放中" : "▶"}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* 定时关闭 */}
        <h2 className="mt-6 font-display text-sm font-extrabold text-white/80">定时关闭</h2>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {TIMERS.map((m) => (
            <button
              key={m}
              onClick={() => setTimer(m)}
              className={cn(
                "h-11 rounded-2xl font-display text-sm font-extrabold transition-all active:scale-95",
                timer === m
                  ? "bg-gradient-to-r from-[hsl(258_55%_55%)] to-[hsl(220_60%_50%)] text-white shadow-pop"
                  : "bg-white/5 text-white/60",
              )}
            >
              {m} 分钟
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* 暗色 mini 播放条 */}
        <div className="mt-6 flex items-center gap-3 rounded-3xl bg-white/5 p-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl">
            {STORIES[story].emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-[13px] font-extrabold text-white">
              {STORIES[story].title}
            </div>
            <div className="text-[10px] text-white/50">
              {[...noises].length > 0 ? `白噪音 × ${noises.size} · ` : ""}{timer} 分钟后关闭
            </div>
          </div>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[hsl(258_55%_55%)] to-[hsl(220_60%_50%)] text-white shadow-pop active:scale-90"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* 暗色 Tab Bar */}
      <nav
        className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-white/5 bg-[hsl(230_25%_14%)]/95 px-3 pt-2 pb-safe backdrop-blur-md"
        style={{ borderTopLeftRadius: "2rem", borderTopRightRadius: "2rem" }}
      >
        <div className="text-center text-[10px] text-white/40 pt-1">
          <button onClick={() => navigate("/home")} className="text-white/70 active:scale-95">
            返回主页
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sleep;
