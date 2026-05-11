import { useEffect, useState } from "react";
import { Baby, ShieldCheck, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Identity, INTEREST_TAGS, KidProfile, saveIdentity, saveKid, loadKid,
} from "@/lib/profile";

type Props = {
  open: boolean;
  onClose: () => void;
  onDone: (id: Identity, kid?: KidProfile) => void;
  /** 强制必须选择身份（首次开屏） */
  required?: boolean;
};

type Step = "choose" | "setup";

export const IdentityModal = ({ open, onClose, onDone, required }: Props) => {
  const [step, setStep] = useState<Step>("choose");
  const existing = loadKid();
  const [name, setName] = useState(existing?.name ?? "");
  const [age, setAge] = useState<number>(existing?.age ?? 5);
  const [interests, setInterests] = useState<string[]>(existing?.interests ?? []);

  useEffect(() => {
    if (open) setStep("choose");
  }, [open]);

  if (!open) return null;

  const pickKid = () => {
    if (existing) {
      saveIdentity("kid");
      onDone("kid", existing);
    } else {
      // 没有家长初始化过，引导家长先设置
      setStep("setup");
    }
  };
  const pickParent = () => setStep("setup");

  const toggle = (tag: string) =>
    setInterests((cur) =>
      cur.includes(tag) ? cur.filter((t) => t !== tag) : cur.length >= 6 ? cur : [...cur, tag],
    );

  const finishSetup = () => {
    const kid: KidProfile = { name: name.trim() || "小宝贝", age, interests };
    saveKid(kid);
    saveIdentity("parent");
    onDone("parent", kid);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center animate-fade-in">
      <div className="w-full max-w-[440px] rounded-t-[32px] bg-background p-5 shadow-pet sm:rounded-[32px] animate-scale-in">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-foreground">
            {step === "choose" ? "你是谁呀？" : existing ? "完善小宝贝资料" : "家长初始化"}
          </h2>
          {!required && (
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted active:scale-95" aria-label="关闭">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {step === "choose" ? (
          <>
            <p className="mt-1 text-[12px] text-muted-foreground">选一下身份，我会用最合适的方式陪你～</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={pickKid}
                className="flex flex-col items-center gap-2 rounded-3xl bg-gradient-to-br from-[hsl(195_80%_90%)] to-[hsl(280_80%_92%)] p-5 shadow-card active:scale-[0.97]"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-soft">
                  <Baby className="h-8 w-8 text-[hsl(220_80%_55%)]" strokeWidth={2.5} />
                </span>
                <span className="font-display text-base font-extrabold">我是小朋友</span>
                <span className="text-[11px] text-muted-foreground">来玩、来听故事</span>
              </button>
              <button
                onClick={pickParent}
                className="flex flex-col items-center gap-2 rounded-3xl bg-gradient-to-br from-[hsl(42_90%_92%)] to-[hsl(20_90%_92%)] p-5 shadow-card active:scale-[0.97]"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-soft">
                  <ShieldCheck className="h-8 w-8 text-[hsl(22_85%_55%)]" strokeWidth={2.5} />
                </span>
                <span className="font-display text-base font-extrabold">我是家长</span>
                <span className="text-[11px] text-muted-foreground">设置 · 管控 · 会员</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-[12px] text-muted-foreground">填好之后，故事和聊天都会用宝贝的名字哦～</p>

            <label className="mt-4 block font-display text-[12px] font-extrabold text-foreground/80">小宝贝的名字</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：糖糖"
              maxLength={10}
              className="mt-1 h-12 w-full rounded-2xl bg-muted px-4 font-display text-base font-bold placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />

            <label className="mt-4 block font-display text-[12px] font-extrabold text-foreground/80">年龄</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {[3, 4, 5, 6, 7, 8, 9, 10].map((a) => (
                <button
                  key={a}
                  onClick={() => setAge(a)}
                  className={cn(
                    "h-9 min-w-9 rounded-full px-3 font-display text-[13px] font-extrabold transition-all active:scale-95",
                    age === a ? "bg-gradient-primary text-primary-foreground shadow-pop" : "bg-card text-foreground/70 shadow-soft",
                  )}
                >
                  {a} 岁
                </button>
              ))}
            </div>

            <label className="mt-4 block font-display text-[12px] font-extrabold text-foreground/80">
              兴趣标签 <span className="text-muted-foreground">（最多 6 个，{interests.length}/6）</span>
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              {INTEREST_TAGS.map((t) => {
                const on = interests.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggle(t)}
                    className={cn(
                      "rounded-full px-3 py-1.5 font-display text-[12px] font-extrabold transition-all active:scale-95",
                      on ? "bg-gradient-primary text-primary-foreground shadow-pop" : "bg-card text-foreground/70 shadow-soft",
                    )}
                  >
                    {on && <Check className="mr-1 inline h-3 w-3" strokeWidth={3} />}
                    {t}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setStep("choose")}
                className="h-12 flex-1 rounded-2xl bg-card font-display text-sm font-extrabold text-foreground/70 shadow-soft active:scale-[0.98]"
              >
                返回
              </button>
              <button
                onClick={finishSetup}
                disabled={!name.trim()}
                className="h-12 flex-[2] rounded-2xl bg-gradient-primary font-display text-sm font-extrabold text-primary-foreground shadow-pop active:scale-[0.98] disabled:opacity-50"
              >
                ✨ 保存并开启陪伴
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
