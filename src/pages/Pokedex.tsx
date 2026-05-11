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

  // 演示用的等级 / 幸福度（基于 id 哈希稳定生成）
  const stats = (id: string) => {
    let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return { lv: 3 + (h % 6), hap: 3 + (h % 3) };
  };

  return (
    <PhoneShell>
      <div className="relative px-5 pt-4 pt-safe pb-8">
        <Sparkles />

        <div className="relative flex items-end justify-between">
          <div>
            <h1 className="font-display text-[28px] font-extrabold leading-tight">萌宠图鉴</h1>
            <p className="text-[12px] text-muted-foreground">
              已收集 {PETS.filter((p) => canUnlock(member, p.tier)).length} / {PETS.length} 只
            </p>
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
          <section key={sec.tier} className="relative mt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold text-foreground">{sec.title}</h2>
              <span className={cn("rounded-full px-2.5 py-1 font-display text-[11px] font-extrabold", sec.badgeClass)}>
                {sec.badge}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{sec.hint}</p>

            <div className="mt-3 grid grid-cols-2 gap-4">
              {sec.pets.map((p) => {
                const unlocked = canUnlock(member, p.tier);
                const active = current === p.id && unlocked;
                const palette = paletteFor(p.id);
                const { lv, hap } = stats(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => onCard(p.id)}
                    className={cn(
                      "relative flex flex-col rounded-[28px] bg-card p-2.5 pb-3 text-left shadow-card transition-all active:scale-[0.97]",
                      active && "ring-2 ring-primary",
                    )}
                  >
                    {/* 彩色色块 + 宠物 */}
                    <div className={cn("relative flex h-36 w-full items-end justify-center overflow-hidden rounded-[22px]", palette)}>
                      <span className="absolute left-2 top-2 text-[hsl(48_100%_60%)] text-base">✦</span>
                      <span className="absolute right-2 top-3 text-white/70 text-sm">✧</span>
                      <img
                        src={p.images.idle}
                        alt={p.name}
                        width={1024}
                        height={1024}
                        className={cn(
                          "h-[110%] object-contain drop-shadow-md transition-transform",
                          !unlocked && "opacity-60 grayscale-[60%]",
                          active && "scale-105",
                        )}
                        loading="lazy"
                        draggable={false}
                      />
                      {!unlocked && (
                        <span
                          className={cn(
                            "absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-pop",
                            p.tier === "monthly" ? "bg-[hsl(42_95%_55%)]" : "bg-[hsl(258_75%_60%)]",
                          )}
                        >
                          {p.tier === "monthly" ? <Lock className="h-3.5 w-3.5" /> : <Diamond className="h-3.5 w-3.5" />}
                        </span>
                      )}
                      {active && (
                        <span className="absolute right-2 top-2 rounded-full bg-gradient-primary px-2 py-0.5 font-display text-[10px] font-extrabold text-primary-foreground shadow-pop">
                          陪伴中
                        </span>
                      )}
                    </div>

                    {/* 名字 + Lv */}
                    <div className="mt-2 flex items-center justify-between gap-1 px-1">
                      <span className="truncate font-display text-[16px] font-extrabold text-foreground">{p.name}</span>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-display text-[10px] font-extrabold text-foreground/70">
                        Lv {lv}
                      </span>
                    </div>

                    {/* 幸福度星星 */}
                    <div className="mt-1 flex items-center gap-1.5 px-1">
                      <span className="font-display text-[10px] font-bold text-muted-foreground">Happiness</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i <= hap ? "fill-[hsl(42_100%_60%)] text-[hsl(42_100%_60%)]" : "text-muted-foreground/40",
                            )}
                            strokeWidth={2}
                          />
                        ))}
                      </div>
                    </div>
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
