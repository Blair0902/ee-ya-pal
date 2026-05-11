import { Check, X, Lock, Diamond } from "lucide-react";
import { PETS, PetId, getPet, MemberLevel, canUnlock, TIER_LABEL } from "@/lib/pets";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  currentId: PetId;
  member: MemberLevel;
  onPick: (id: PetId) => void;
  onLockedPick: (id: PetId) => void;
  onClose: () => void;
};

/** 底部抽屉：选择/切换萌宠（含锁状态） */
export const PetSwitcher = ({ open, currentId, member, onPick, onLockedPick, onClose }: Props) => {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="选择萌宠"
        className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] rounded-t-[2rem] bg-card pb-safe shadow-tab transition-transform duration-300 ease-out"
        style={{ transform: open ? "translate(-50%, 0)" : "translate(-50%, 100%)" }}
      >
        <div className="flex items-center justify-between px-5 pt-4">
          <div>
            <h2 className="font-display text-lg font-extrabold text-foreground">换个小伙伴</h2>
            <p className="text-xs text-muted-foreground">挑一只今天最想抱的</p>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 p-5 pb-7">
          {PETS.map((p) => {
            const active = p.id === currentId;
            const unlocked = canUnlock(member, p.tier);
            return (
              <button
                key={p.id}
                onClick={() => (unlocked ? onPick(p.id) : onLockedPick(p.id))}
                className={cn(
                  "group relative flex flex-col items-center rounded-3xl p-2 pt-3 transition-all active:scale-[0.97]",
                  active
                    ? "bg-gradient-primary shadow-pop"
                    : "bg-secondary/40 hover:bg-secondary/60",
                )}
              >
                {active && unlocked && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-card shadow-soft">
                    <Check className="h-3 w-3 text-primary" strokeWidth={3} />
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
                <div
                  className={cn(
                    "flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-card/70",
                    !unlocked && "opacity-60",
                  )}
                >
                  <img
                    src={p.images.idle}
                    alt={p.name}
                    width={1024}
                    height={1024}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    draggable={false}
                  />
                </div>
                <span
                  className={cn(
                    "mt-1.5 font-display text-[12px] font-extrabold",
                    active ? "text-primary-foreground" : "text-foreground",
                  )}
                >
                  {p.name}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold",
                    active ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {TIER_LABEL[p.tier]} · {p.species}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

/** 顶栏小入口：当前宠物头像 + 切换提示 */
export const PetSwitcherTrigger = ({
  currentId,
  onClick,
}: {
  currentId: PetId;
  onClick: () => void;
}) => {
  const pet = getPet(currentId);
  return (
    <button
      onClick={onClick}
      aria-label="切换萌宠"
      className="inline-flex items-center gap-1.5 rounded-full bg-card px-1 py-1 pr-2.5 shadow-soft transition-transform active:scale-95"
    >
      <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary-soft">
        <img
          src={pet.images.idle}
          alt={pet.name}
          width={1024}
          height={1024}
          className="h-full w-full object-contain"
          draggable={false}
        />
      </span>
      <span className="font-display text-[11px] font-extrabold text-foreground">{pet.name}</span>
      <span className="font-display text-[10px] font-bold text-primary">换</span>
    </button>
  );
};
