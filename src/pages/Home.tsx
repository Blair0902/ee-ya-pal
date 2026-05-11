import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Crown, Mic, Heart, RefreshCw } from "lucide-react";
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

const Home = () => {
  const navigate = useNavigate();
  const [petId, setPetId] = useState<PetId>(() => loadPetId());
  const [member, setMember] = useState<MemberLevel>(() => loadMember());
  const pet = useMemo(() => getPet(petId), [petId]);

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [memberReason, setMemberReason] = useState<string | undefined>();
  const [pendingLocked, setPendingLocked] = useState<PetId | null>(null);

  // 身份门禁：第一次进"聊聊"必须选择身份
  const [identity, setIdentity] = useState<Identity>(() => loadIdentity());
  const [kid, setKid] = useState<KidProfile | null>(() => loadKid());
  const [identityOpen, setIdentityOpen] = useState<boolean>(() => !loadIdentity());

  const [bounce, setBounce] = useState(0);
  const triggerBounce = () => setBounce((n) => n + 1);

  // 语音长按
  const pressTimer = useRef<number | null>(null);
  const onMicDown = () => {
    pressTimer.current = window.setTimeout(() => setVoiceOpen(true), 200);
  };
  const onMicUp = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
  };
  const onMicTap = () => setVoiceOpen(true);

  const handlePick = (id: PetId) => {
    setPetId(id); savePetId(id); setSwitcherOpen(false); triggerBounce();
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
    if (pendingLocked && canUnlock(lv, gp(pendingLocked).tier)) {
      handlePick(pendingLocked);
    }
    setPendingLocked(null);
  };

  return (
    <PhoneShell>
      {/* 顶栏 */}
      <header className="flex items-center justify-between px-5 pt-4 pt-safe">
        <button
          onClick={() => navigate("/me")}
          aria-label="家长中心"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-soft active:scale-95"
        >
          <Lock className="h-5 w-5 text-foreground/70" />
        </button>
        <button
          onClick={() => setIdentityOpen(true)}
          className="flex max-w-[55%] items-center gap-1.5 rounded-full bg-card px-3 py-1.5 shadow-soft active:scale-95"
        >
          <span className="text-base">{identity === "parent" ? "🛡️" : "🧒"}</span>
          <span className="truncate font-display text-[12px] font-extrabold text-foreground/80">
            {kid?.name ? `Hi，${kid.name}` : "选择身份"}
          </span>
        </button>
        <button
          onClick={() => setMemberOpen(true)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-display text-[12px] font-extrabold shadow-soft active:scale-95",
            member === "none"
              ? "bg-card text-foreground/70"
              : "bg-gradient-to-r from-[hsl(42_100%_70%)] to-[hsl(22_95%_70%)] text-white",
          )}
        >
          <Crown className="h-3.5 w-3.5" />
          {member === "yearly" ? "年" : member === "monthly" ? "月" : "会员"}
        </button>
      </header>

      {/* 萌宠展示舞台 */}
      <section className="relative mt-2 flex h-[44vh] min-h-[300px] items-end justify-center overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-6 h-64 w-64 -translate-x-1/2 rounded-full bg-primary-soft opacity-60 blur-3xl" />
        <div className="absolute bottom-8 h-5 w-40 rounded-full bg-foreground/10 blur-md" />
        <div
          key={`${petId}-${bounce}`}
          className="relative h-full w-full animate-fade-in-up"
        >
          <img
            src={pet.images.idle}
            alt={pet.name}
            width={1024}
            height={1024}
            className="absolute bottom-0 left-1/2 h-[92%] -translate-x-1/2 animate-float-slow object-contain drop-shadow-2xl"
            draggable={false}
          />
        </div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-card/80 px-3 py-1 font-display text-[12px] font-extrabold text-foreground shadow-soft">
          {pet.name}
        </div>
      </section>

      {/* 口头禅滚动条 */}
      <section className="mx-5 mt-2 overflow-hidden rounded-full bg-card/80 px-4 py-2.5 shadow-soft">
        <div className="flex whitespace-nowrap" style={{ animation: "scroll-x 18s linear infinite" }}>
          <span className="font-display text-sm font-bold text-foreground/80 pr-8">💬 {pet.catchphrase}</span>
          <span className="font-display text-sm font-bold text-foreground/80 pr-8">💬 {pet.catchphrase}</span>
          <span className="font-display text-sm font-bold text-foreground/80 pr-8">💬 {pet.catchphrase}</span>
        </div>
      </section>

      {/* 底部交互区 */}
      <section className="mt-6 flex items-end justify-around px-6">
        <button
          onClick={() => setSwitcherOpen(true)}
          className="flex flex-col items-center gap-1.5 active:scale-95"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-soft">
            <RefreshCw className="h-6 w-6 text-secondary-foreground" />
          </span>
          <span className="font-display text-[11px] font-bold text-foreground/70">切换萌宠</span>
        </button>

        <button
          onPointerDown={onMicDown}
          onPointerUp={onMicUp}
          onClick={onMicTap}
          aria-label="长按说话"
          className="flex flex-col items-center gap-2 active:scale-95"
        >
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary shadow-pop">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
            <Mic className="h-9 w-9 text-primary-foreground" strokeWidth={2.5} />
          </span>
          <span className="font-display text-[12px] font-extrabold text-primary">长按说话</span>
        </button>

        <button
          onClick={() => navigate("/pokedex")}
          className="flex flex-col items-center gap-1.5 active:scale-95"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-soft">
            <Heart className="h-6 w-6 text-[hsl(348_88%_70%)]" />
          </span>
          <span className="font-display text-[11px] font-bold text-foreground/70">我的收藏</span>
        </button>
      </section>

      {/* 弹窗们 */}
      <PetSwitcher
        open={switcherOpen}
        currentId={petId}
        member={member}
        onPick={handlePick}
        onLockedPick={handleLockedPick}
        onClose={() => setSwitcherOpen(false)}
      />
      <VoiceModal open={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <MembershipModal
        open={memberOpen}
        onClose={() => setMemberOpen(false)}
        onSubscribed={onSubscribed}
        reason={memberReason}
      />
      <IdentityModal
        open={identityOpen}
        required={!identity}
        onClose={() => setIdentityOpen(false)}
        onDone={(id, k) => {
          setIdentity(id);
          if (k) setKid(k);
          setIdentityOpen(false);
        }}
      />
    </PhoneShell>
  );
};

export default Home;
