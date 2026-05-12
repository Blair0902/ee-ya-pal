import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Crown, Mic, Heart, RefreshCw, Drumstick, Droplet, Hand, BookOpen, Sparkles, Moon, Shield } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { PetSwitcher } from "@/components/PetSwitcher";
import { VoiceModal } from "@/components/modals/VoiceModal";
import { MembershipModal } from "@/components/modals/MembershipModal";
import { IdentityModal } from "@/components/modals/IdentityModal";
import {
  PetId, getPet, loadPetId, savePetId, loadMember, MemberLevel, canUnlock, getPet as gp,
} from "@/lib/pets";
import { loadIdentity, loadKid, KidProfile, Identity } from "@/lib/profile";
import { cn } from "@/lib/utils";
import siameseVideo from "@/assets/pet-siamese.webm";
import homeBg from "@/assets/home-bg.jpg";

type Reaction = { id: number; emoji: string; text: string };

const Home = () => {
  const navigate = useNavigate();
  // 演示态：聊聊主舞台默认展示「暹罗可可」（带视频形象）
  const [petId, setPetId] = useState<PetId>(() => {
    const saved = loadPetId();
    return saved === "cat-siamese" ? saved : "cat-siamese";
  });
  const [member, setMember] = useState<MemberLevel>(() => loadMember());
  const pet = useMemo(() => getPet(petId), [petId]);
  const isSiamese = petId === "cat-siamese";

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [memberReason, setMemberReason] = useState<string | undefined>();
  const [pendingLocked, setPendingLocked] = useState<PetId | null>(null);

  const [identity, setIdentity] = useState<Identity>(() => loadIdentity());
  const [kid, setKid] = useState<KidProfile | null>(() => loadKid());
  const [identityOpen, setIdentityOpen] = useState<boolean>(() => !loadIdentity());

  // 反馈：飘字 emoji + 顶部小气泡
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [bubble, setBubble] = useState<string>("喵呜～今天也想抱抱嘛");
  const [petBounce, setPetBounce] = useState(0);
  const reactionId = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fireReaction = (emoji: string, text: string, sayList: string[]) => {
    const id = ++reactionId.current;
    setReactions((r) => [...r, { id, emoji, text }]);
    setBubble(sayList[Math.floor(Math.random() * sayList.length)]);
    setPetBounce((n) => n + 1);
    // 短暂加速视频播放，让"表情"更夸张
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.6;
      window.setTimeout(() => {
        if (videoRef.current) videoRef.current.playbackRate = 1;
      }, 900);
    }
    window.setTimeout(() => setReactions((r) => r.filter((x) => x.id !== id)), 1400);
  };

  const handleFeed = () => fireReaction("🍖", "喂零食", [
    "喵～太香啦！再来一块好不好？",
    "呼噜呼噜～你最好啦！",
    "嗯！这是我最爱吃的味道～",
  ]);
  const handleWater = () => fireReaction("💧", "喝水", [
    "咕噜咕噜～水水真甜！",
    "啊～解渴啦，谢谢你！",
    "再来一点点嘛～",
  ]);
  const handlePet = () => fireReaction("💖", "摸摸头", [
    "呼噜呼噜呼噜～最舒服了！",
    "嘿嘿，再摸久一点点嘛～",
    "喵呜～你的手好温柔。",
  ]);

  // 语音长按 → 直接在页面内做"聆听"反馈（不再弹出二次弹窗）
  const [listening, setListening] = useState(false);
  const listenTimer = useRef<number | null>(null);
  const stopListen = () => {
    if (listenTimer.current) { window.clearTimeout(listenTimer.current); listenTimer.current = null; }
    setListening(false);
    fireReaction("🗣️", "对话", [
      "我在听呢～你说的我都记住啦！",
      "嗯嗯！再多陪我说一会儿好不好？",
      "喵～我超喜欢和你聊天的！",
    ]);
  };
  const onMicDown = () => {
    setListening(true);
    if (listenTimer.current) window.clearTimeout(listenTimer.current);
    listenTimer.current = window.setTimeout(stopListen, 4000);
  };
  const onMicUp = () => { if (listening) stopListen(); };
  const onMicTap = () => { onMicDown(); window.setTimeout(onMicUp, 900); };

  const handlePick = (id: PetId) => {
    setPetId(id); savePetId(id); setSwitcherOpen(false); setPetBounce((n) => n + 1);
  };
  const handleLockedPick = (id: PetId) => {
    setPendingLocked(id);
    const p = gp(id);
    setMemberReason(`解锁「${p.name}」需开通${p.tier === "monthly" ? "月卡" : "年卡"}`);
    setSwitcherOpen(false);
    setTimeout(() => setMemberOpen(true), 220);
  };
  const onSubscribed = (lv: MemberLevel) => {
    setMember(lv); setMemberOpen(false);
    if (pendingLocked && canUnlock(lv, gp(pendingLocked).tier)) handlePick(pendingLocked);
    setPendingLocked(null);
  };

  return (
    <PhoneShell>
      {/* 卡通背景：别墅 + 宠物小窝 + 草地 */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img
          src={homeBg}
          alt=""
          aria-hidden
          className="absolute inset-x-0 top-0 h-full w-full object-cover"
        />
        {/* 顶部柔化，保证状态栏文字清晰 */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[hsl(36_80%_96%)]/80 to-transparent" />
        {/* 中部柔化，给主角留呼吸 */}
        <div className="absolute inset-x-0 top-1/4 h-1/3 bg-gradient-to-b from-white/35 to-transparent" />
      </div>
      <div className="relative z-10">
      {/* 顶栏 */}
      <header className="flex items-center justify-between px-5 pt-4 pt-safe">
        <button onClick={() => navigate("/me")} aria-label="家长中心"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-soft active:scale-95">
          <Lock className="h-5 w-5 text-foreground/70" />
        </button>
        <button onClick={() => setIdentityOpen(true)}
          className="flex max-w-[55%] items-center gap-1.5 rounded-full bg-card px-3 py-1.5 shadow-soft active:scale-95">
          <span className="text-base">{identity === "parent" ? "🛡️" : "🧒"}</span>
          <span className="truncate font-display text-[12px] font-extrabold text-foreground/80">
            {kid?.name ? `Hi，${kid.name}` : "选择身份"}
          </span>
        </button>
        <button onClick={() => setMemberOpen(true)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-display text-[12px] font-extrabold shadow-soft active:scale-95",
            member === "none" ? "bg-card text-foreground/70"
              : "bg-gradient-to-r from-[hsl(42_100%_70%)] to-[hsl(22_95%_70%)] text-white",
          )}>
          <Crown className="h-3.5 w-3.5" />
          {member === "yearly" ? "年" : member === "monthly" ? "月" : "会员"}
        </button>
      </header>

      {/* 萌宠舞台 */}
      <section className="relative mt-1 flex h-[52vh] min-h-[360px] items-end justify-center overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-6 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-soft opacity-60 blur-3xl" />
        <div className="absolute bottom-6 h-5 w-44 rounded-full bg-foreground/10 blur-md" />

        {/* 名牌 */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 font-display text-[12px] font-extrabold text-foreground shadow-soft">
          <span>👑</span>{pet.name}<span className="text-muted-foreground">· DEMO</span>
        </div>

        {/* 顶部对话气泡 */}
        <div key={bubble} className="absolute top-12 left-1/2 max-w-[78%] -translate-x-1/2 rounded-2xl rounded-bl-sm bg-white px-4 py-2 text-center font-display text-[13px] font-extrabold text-foreground shadow-card animate-fade-in-up">
          {bubble}
        </div>

        {/* 主体形象 */}
        <div key={`${petId}-${petBounce}`} className="relative h-full w-full">
          {isSiamese ? (
            <video
              ref={videoRef}
              src={siameseVideo}
              autoPlay loop muted playsInline
              className="absolute inset-0 m-auto h-[96%] w-full object-contain animate-float-slow drop-shadow-2xl"
              style={{ background: "transparent", objectPosition: "center 55%" }}
            />
          ) : (
            <img src={pet.images.idle} alt={pet.name} draggable={false}
              className="absolute inset-0 m-auto h-[90%] w-full object-contain animate-float-slow drop-shadow-2xl" />
          )}
        </div>

        {/* 飘字反馈 */}
        <div className="pointer-events-none absolute inset-0">
          {reactions.map((r) => (
            <span key={r.id}
              className="absolute left-1/2 bottom-1/3 -translate-x-1/2 select-none text-5xl"
              style={{ animation: "float-up 1.4s ease-out forwards" }}>
              {r.emoji}
            </span>
          ))}
        </div>

        {/* 右上角「切换萌宠」浮动按钮 */}
        <button
          onClick={() => setSwitcherOpen(true)}
          aria-label="切换萌宠"
          className="absolute right-3 top-2 z-20 flex flex-col items-center gap-1 active:scale-90"
        >
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(48_100%_88%)] to-[hsl(28_95%_82%)] shadow-pop ring-4 ring-white/70">
            <RefreshCw className="h-5 w-5 text-[hsl(28_85%_45%)]" strokeWidth={2.8} />
          </span>
          <span className="rounded-full bg-card/90 px-2 py-0.5 font-display text-[10px] font-extrabold text-foreground/70 shadow-soft">
            换萌宠
          </span>
        </button>
      </section>

      {/* 口头禅滚动 */}
      <section className="mx-5 mt-1 overflow-hidden rounded-full bg-card/80 px-4 py-2 shadow-soft">
        <div className="flex whitespace-nowrap" style={{ animation: "scroll-x 18s linear infinite" }}>
          <span className="font-display text-sm font-bold text-foreground/80 pr-8">💬 {pet.catchphrase}</span>
          <span className="font-display text-sm font-bold text-foreground/80 pr-8">💬 {pet.catchphrase}</span>
          <span className="font-display text-sm font-bold text-foreground/80 pr-8">💬 {pet.catchphrase}</span>
        </div>
      </section>

      {/* 道具入口（取代底部 Tab）：点击进入二级页 */}
      <section className="mt-3 px-5">
        <div className="flex items-end justify-around rounded-[28px] bg-card/80 px-3 py-3 shadow-soft">
          <PropEntry label="故事工坊" emoji="📖"
            ring="from-[hsl(195_85%_88%)] to-[hsl(220_85%_92%)]" chip="bg-[hsl(210_85%_62%)]"
            onClick={() => navigate("/story")}>
            <BookOpen className="h-5 w-5 text-white" strokeWidth={2.6} />
          </PropEntry>
          <PropEntry label="萌宠图鉴" emoji="✨"
            ring="from-[hsl(42_95%_88%)] to-[hsl(28_95%_82%)]" chip="bg-[hsl(28_85%_60%)]"
            onClick={() => navigate("/pokedex")}>
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.6} />
          </PropEntry>
          <PropEntry label="哄睡" emoji="🌙"
            ring="from-[hsl(258_70%_90%)] to-[hsl(220_70%_92%)]" chip="bg-[hsl(258_55%_62%)]"
            onClick={() => navigate("/sleep")}>
            <Moon className="h-5 w-5 text-white" strokeWidth={2.6} />
          </PropEntry>
          <PropEntry label="家长中心" emoji="🛡️"
            ring="from-[hsl(140_55%_85%)] to-[hsl(170_60%_92%)]" chip="bg-[hsl(160_55%_45%)]"
            onClick={() => navigate("/me")}>
            <Shield className="h-5 w-5 text-white" strokeWidth={2.6} />
          </PropEntry>
        </div>
      </section>

      {/* 底部交互：长按说话 + 三颗卡通互动按钮，并排 */}
      <section className="mt-4 px-5">
        {/* 长按说话（独立一行，更突出） */}
        <div className="flex justify-center">
          <button
            onPointerDown={onMicDown}
            onPointerUp={onMicUp}
            onPointerLeave={onMicUp}
            onClick={onMicTap}
            aria-label="长按说话"
            className="flex flex-col items-center gap-2 active:scale-95"
          >
            <span className={cn(
              "relative flex h-20 w-20 items-center justify-center rounded-full shadow-pop ring-[6px] ring-white/85 transition-colors",
              listening ? "bg-gradient-to-br from-[hsl(348_88%_70%)] to-[hsl(28_95%_65%)]" : "bg-gradient-primary",
            )}>
              {listening && <span className="absolute inset-0 animate-ping rounded-full bg-[hsl(348_88%_70%)]/40" />}
              <Mic className="h-9 w-9 text-primary-foreground" strokeWidth={2.6} />
            </span>
            <span className="rounded-full bg-white/95 px-3 py-1 font-display text-[12px] font-extrabold text-primary shadow-soft">
              {listening ? "聆听中…" : "长按说话"}
            </span>
          </button>
        </div>

        {/* 三颗互动按钮，并排 */}
        <div className="mt-4 flex items-end justify-around">
          <CartoonAction
            label="喂零食" emoji="🍖"
            ring="from-[hsl(28_95%_88%)] to-[hsl(18_95%_78%)]"
            chip="bg-[hsl(22_95%_70%)]"
            onClick={handleFeed}
          >
            <Drumstick className="h-6 w-6 text-white" strokeWidth={2.6} />
          </CartoonAction>

          <CartoonAction
            label="摸摸头" emoji="💖"
            ring="from-[hsl(340_95%_92%)] to-[hsl(330_95%_82%)]"
            chip="bg-[hsl(340_85%_68%)]"
            onClick={handlePet}
          >
            <Hand className="h-6 w-6 text-white" strokeWidth={2.6} />
          </CartoonAction>

          <CartoonAction
            label="喝水" emoji="💧"
            ring="from-[hsl(195_95%_90%)] to-[hsl(210_95%_80%)]"
            chip="bg-[hsl(200_85%_62%)]"
            onClick={handleWater}
          >
            <Droplet className="h-6 w-6 text-white" strokeWidth={2.6} />
          </CartoonAction>
        </div>
      </section>


      <PetSwitcher open={switcherOpen} currentId={petId} member={member}
        onPick={handlePick} onLockedPick={handleLockedPick} onClose={() => setSwitcherOpen(false)} />
      <VoiceModal open={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <MembershipModal open={memberOpen} onClose={() => setMemberOpen(false)}
        onSubscribed={onSubscribed} reason={memberReason} />
      <IdentityModal open={identityOpen} required={!identity}
        onClose={() => setIdentityOpen(false)}
        onDone={(id, k) => { setIdentity(id); if (k) setKid(k); setIdentityOpen(false); }} />
      </div>
    </PhoneShell>
  );
};

const CartoonAction = ({
  children, label, emoji, ring, chip, className, onClick,
}: {
  children: React.ReactNode; label: string; emoji: string;
  ring: string; chip: string; className?: string; onClick: () => void;
}) => (
  <button onClick={onClick} className={cn("group flex flex-col items-center gap-1 active:scale-90", className)}>
    <span className={cn("relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br shadow-pop ring-4 ring-white/85 transition-transform group-active:rotate-[-6deg]", ring)}>
      <span className={cn("flex h-11 w-11 items-center justify-center rounded-full shadow-inner", chip)}>
        {children}
      </span>
      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[13px] shadow-soft">
        {emoji}
      </span>
    </span>
    <span className="rounded-full bg-white/95 px-2.5 py-0.5 font-display text-[11px] font-extrabold text-foreground/80 shadow-soft">
      {label}
    </span>
  </button>
);


const PropEntry = ({
  children, label, emoji, ring, chip, onClick,
}: {
  children: React.ReactNode; label: string; emoji: string;
  ring: string; chip: string; onClick: () => void;
}) => (
  <button onClick={onClick} className="group flex flex-col items-center gap-1 active:scale-90">
    <span className={cn("relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-pop ring-[3px] ring-white/85 transition-transform group-active:rotate-[-4deg]", ring)}>
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl shadow-inner", chip)}>
        {children}
      </span>
      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] shadow-soft">
        {emoji}
      </span>
    </span>
    <span className="font-display text-[11px] font-extrabold text-foreground/80">
      {label}
    </span>
  </button>
);

export default Home;
