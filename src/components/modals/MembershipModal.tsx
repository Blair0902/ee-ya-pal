import { Crown, X, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { MemberLevel, saveMember } from "@/lib/pets";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubscribed: (level: MemberLevel) => void;
  /** 触发原因：哪只锁定宠物 / 还是普通入口 */
  reason?: string;
};

const PLANS: {
  id: MemberLevel;
  title: string;
  price: string;
  per: string;
  badge?: string;
  perks: string[];
  highlight?: boolean;
}[] = [
  {
    id: "monthly",
    title: "月卡会员",
    price: "¥18",
    per: "/月",
    perks: ["解锁 6 只汪星萌宠", "每天无限次聊聊", "故事工坊全部模板"],
  },
  {
    id: "yearly",
    title: "年卡典藏",
    price: "¥168",
    per: "/年",
    badge: "省 ¥48",
    highlight: true,
    perks: ["解锁全部 9 只萌宠", "猫咪专属典藏皮肤", "睡前哄睡白噪音库", "年度成长报告"],
  },
];

export const MembershipModal = ({ open, onClose, onSubscribed, reason }: Props) => {
  const [picked, setPicked] = useState<MemberLevel>("yearly");

  const subscribe = () => {
    saveMember(picked);
    onSubscribed(picked);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 backdrop-blur-sm transition-opacity duration-300",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="会员开通"
    >
      <div
        className={cn(
          "w-full max-w-[480px] rounded-t-[2rem] bg-card pb-safe shadow-tab transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex items-start justify-between px-5 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(42_95%_60%)] shadow-pop">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-foreground">开通伊呀会员</h2>
              <p className="text-[11px] text-muted-foreground">
                {reason || "解锁更多萌宠和睡前故事"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 px-5">
          {PLANS.map((p) => {
            const active = picked === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPicked(p.id)}
                className={cn(
                  "relative w-full overflow-hidden rounded-3xl p-4 text-left transition-all active:scale-[0.99]",
                  active
                    ? "bg-gradient-to-br from-[hsl(42_100%_82%)] to-[hsl(22_100%_80%)] shadow-pop ring-2 ring-primary"
                    : "bg-muted/60",
                )}
              >
                {p.badge && (
                  <span className="absolute right-4 top-4 rounded-full bg-[hsl(348_88%_70%)] px-2 py-0.5 font-display text-[10px] font-extrabold text-white">
                    {p.badge}
                  </span>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-base font-extrabold text-foreground">{p.title}</span>
                  {p.highlight && <Sparkles className="h-4 w-4 text-[hsl(42_95%_50%)]" />}
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-display text-2xl font-extrabold text-primary">{p.price}</span>
                  <span className="text-xs text-muted-foreground">{p.per}</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {p.perks.map((k) => (
                    <li key={k} className="flex items-center gap-1.5 text-[12px] text-foreground/80">
                      <Check className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
                      {k}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="px-5 pb-6 pt-4">
          <button
            onClick={subscribe}
            className="h-12 w-full rounded-2xl bg-gradient-primary font-display text-[15px] font-extrabold text-primary-foreground shadow-pop active:scale-[0.98]"
          >
            立即开通
          </button>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            演示原型：点击即视为已开通，无需真实支付
          </p>
        </div>
      </div>
    </div>
  );
};
