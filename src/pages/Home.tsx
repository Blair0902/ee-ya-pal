import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Crown, Mic, Heart, RefreshCw, Drumstick, Droplet, Hand } from "lucide-react";
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

  // 语音长按
  const pressTimer = useRef<number | null>(null);
  const onMicDown = () => { pressTimer.current = window.setTimeout(() => setVoiceOpen(true), 200); };
  const onMicUp = () => { if (pressTimer.current) window.clearTimeout(pressTimer.current); };
  const onMicTap = () => setVoiceOpen(true);

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

        {/* 右侧悬浮交互按钮（汤姆猫风格） */}
        <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3">
          <ActionButton label="喂零食" color="bg-[hsl(22_95%_70%)]" onClick={handleFeed}>
            <Drumstick className="h-6 w-6 text-white" />
          </ActionButton>
          <ActionButton label="喝水" color="bg-[hsl(200_85%_68%)]" onClick={handleWater}>
            <Droplet className="h-6 w-6 text-white" />
          </ActionButton>
          <ActionButton label="摸摸头" color="bg-[hsl(340_85%_72%)]" onClick={handlePet}>
            <Hand className="h-6 w-6 text-white" />
          </ActionButton>
        </div>
      </section>

      {/* 口头禅滚动 */}
      <section className="mx-5 mt-1 overflow-hidden rounded-full bg-card/80 px-4 py-2 shadow-soft">
        <div className="flex whitespace-nowrap" style={{ animation: "scroll-x 18s linear infinite" }}>
          <span className="font-display text-sm font-bold text-foreground/80 pr-8">💬 {pet.catchphrase}</span>
          <span className="font-display text-sm font-bold text-foreground/80 pr-8">💬 {pet.catchphrase}</span>
          <span className="font-display text-sm font-bold text-foreground/80 pr-8">💬 {pet.catchphrase}</span>
        </div>
      </section>

      {/* 底部交互 */}
      <section className="mt-4 flex items-end justify-around px-6">
        <button onClick={() => setSwitcherOpen(true)} className="flex flex-col items-center gap-1.5 active:scale-95">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-soft">
            <RefreshCw className="h-6 w-6 text-secondary-foreground" />
          </span>
          <span className="font-display text-[11px] font-bold text-foreground/70">切换萌宠</span>
        </button>

        <button onPointerDown={onMicDown} onPointerUp={onMicUp} onClick={onMicTap}
          aria-label="长按说话" className="flex flex-col items-center gap-2 active:scale-95">
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary shadow-pop">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
            <Mic className="h-9 w-9 text-primary-foreground" strokeWidth={2.5} />
          </span>
          <span className="font-display text-[12px] font-extrabold text-primary">长按说话</span>
        </button>

        <button onClick={() => navigate("/pokedex")} className="flex flex-col items-center gap-1.5 active:scale-95">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-soft">
            <Heart className="h-6 w-6 text-[hsl(348_88%_70%)]" />
          </span>
          <span className="font-display text-[11px] font-bold text-foreground/70">我的收藏</span>
        </button>
      </section>

      <PetSwitcher open={switcherOpen} currentId={petId} member={member}
        onPick={handlePick} onLockedPick={handleLockedPick} onClose={() => setSwitcherOpen(false)} />
      <VoiceModal open={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <MembershipModal open={memberOpen} onClose={() => setMemberOpen(false)}
        onSubscribed={onSubscribed} reason={memberReason} />
      <IdentityModal open={identityOpen} required={!identity}
        onClose={() => setIdentityOpen(false)}
        onDone={(id, k) => { setIdentity(id); if (k) setKid(k); setIdentityOpen(false); }} />
    </PhoneShell>
  );
};

const ActionButton = ({
  children, label, color, onClick,
}: { children: React.ReactNode; label: string; color: string; onClick: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 active:scale-90">
    <span className={cn("flex h-12 w-12 items-center justify-center rounded-full shadow-pop", color)}>
      {children}
    </span>
    <span className="rounded-full bg-card/90 px-2 py-0.5 font-display text-[10px] font-extrabold text-foreground/80 shadow-soft">
      {label}
    </span>
  </button>
);

export default Home;
