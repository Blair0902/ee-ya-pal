import { useMemo, useState } from "react";
import { Lock, Diamond, Crown, Star } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { MembershipModal } from "@/components/modals/MembershipModal";
import { Sparkles, paletteFor } from "@/components/Sparkles";
import {
  PETS, PetTier, PetId, MemberLevel, canUnlock, loadMember,
  loadPetId, savePetId, getPet,
} from "@/lib/pets";
import { cn } from "@/lib/utils";

const SECTIONS: {
  tier: PetTier;
  title: string;
  hint: string;
  badge: string;
  badgeClass: string;
}[] = [
  { tier: "free", title: "免费汪星", hint: "全部小朋友都能领养", badge: "免费", badgeClass: "bg-secondary text-secondary-foreground" },
  { tier: "monthly", title: "月卡会员狗狗", hint: "开通月卡解锁", badge: "月卡", badgeClass: "bg-[hsl(42_95%_60%)] text-white" },
  { tier: "yearly", title: "年卡典藏猫咪", hint: "年卡专属典藏", badge: "年卡", badgeClass: "bg-[hsl(258_75%_68%)] text-white" },
];

const Pokedex = () => {
  const [member, setMember] = useState<MemberLevel>(() => loadMember());
  const [current, setCurrent] = useState<PetId>(() => loadPetId());
  const [memberOpen, setMemberOpen] = useState(false);
  const [reason, setReason] = useState<string>();

  const grouped = useMemo(() => {
    return SECTIONS.map((s) => ({
      ...s,
      pets: PETS.filter((p) => p.tier === s.tier),
    }));
  }, []);

  const onCard = (id: PetId) => {
    const p = getPet(id);
    if (canUnlock(member, p.tier)) {
      setCurrent(id); savePetId(id);
    } else {
      setReason(`解锁「${p.name}」需开通${p.tier === "monthly" ? "月卡" : "年卡"}`);
      setMemberOpen(true);
    }
  };

  return (
    <PhoneShell>
      <div className="px-5 pt-4 pt-safe pb-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-[24px] font-extrabold">萌宠图鉴</h1>
            <p className="text-[12px] text-muted-foreground">已收集 {PETS.filter((p) => canUnlock(member, p.tier)).length} / {PETS.length} 只</p>
          </div>
          <button
            onClick={() => setMemberOpen(true)}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[hsl(42_100%_70%)] to-[hsl(22_95%_70%)] px-3 py-1.5 font-display text-[11px] font-extrabold text-white shadow-pop active:scale-95"
          >
            <Crown className="h-3.5 w-3.5" />
            会员中心
          </button>
        </div>

        {grouped.map((sec) => (
          <section key={sec.tier} className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-extrabold text-foreground">{sec.title}</h2>
              <span className={cn("rounded-full px-2 py-0.5 font-display text-[10px] font-extrabold", sec.badgeClass)}>
                {sec.badge}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{sec.hint}</p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {sec.pets.map((p) => {
                const unlocked = canUnlock(member, p.tier);
                const active = current === p.id && unlocked;
                return (
                  <button
                    key={p.id}
                    onClick={() => onCard(p.id)}
                    className={cn(
                      "relative flex flex-col items-center rounded-3xl bg-card p-2.5 pt-3 shadow-card transition-all active:scale-[0.97]",
                      active && "ring-2 ring-primary",
                    )}
                  >
                    {active && (
                      <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-primary shadow-pop">
                        <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                      </span>
                    )}
                    {!unlocked && (
                      <span
                        className={cn(
                          "absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white shadow-soft",
                          p.tier === "monthly" ? "bg-[hsl(42_95%_60%)]" : "bg-[hsl(258_75%_68%)]",
                        )}
                      >
                        {p.tier === "monthly" ? <Lock className="h-3 w-3" /> : <Diamond className="h-3 w-3" />}
                      </span>
                    )}
                    <div className={cn("flex h-20 w-full items-center justify-center", !unlocked && "opacity-55 grayscale-[40%]")}>
                      <img
                        src={p.images.idle}
                        alt={p.name}
                        width={1024}
                        height={1024}
                        className="h-full object-contain"
                        loading="lazy"
                        draggable={false}
                      />
                    </div>
                    <div className="mt-1 font-display text-[12px] font-extrabold text-foreground">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-2 text-center leading-tight">
                      {p.trait}
                    </div>
                    <span
                      className={cn(
                        "mt-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold",
                        unlocked
                          ? active
                            ? "bg-gradient-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {unlocked ? (active ? "陪伴中" : "已解锁") : "未解锁"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <MembershipModal
        open={memberOpen}
        onClose={() => setMemberOpen(false)}
        onSubscribed={(lv) => { setMember(lv); setMemberOpen(false); }}
        reason={reason}
      />
    </PhoneShell>
  );
};

export default Pokedex;
