import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Crown, Lock, Moon, FileText, Shield, ChevronRight, Bell,
  CalendarHeart, Heart, Mountain, Hand, Bone, Compass, Map as MapIcon, Award,
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { Sparkles } from "@/components/Sparkles";
import { MembershipModal } from "@/components/modals/MembershipModal";
import { PrivacyModal } from "@/components/modals/PrivacyModal";
import { loadMember, MemberLevel, loadPetId, getPet } from "@/lib/pets";
import { loadKid } from "@/lib/profile";
import { cn } from "@/lib/utils";

const Me = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState<MemberLevel>(() => loadMember());
  const [duration, setDuration] = useState(60);
  const [filter, setFilter] = useState(true);
  const [memberOpen, setMemberOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [locked, setLocked] = useState(false);

  const pet = useMemo(() => getPet(loadPetId()), []);
  const kid = loadKid();
  const kidName = kid?.name || "小宝贝";

  const stats = [
    { icon: CalendarHeart, label: "陪伴天数", v: "120", u: "天",  bg: "bg-[hsl(348_85%_92%)]", fg: "text-[hsl(348_70%_50%)]" },
    { icon: Hand,          label: "累计互动", v: "2,500", u: "次", bg: "bg-[hsl(42_95%_88%)]",  fg: "text-[hsl(28_70%_45%)]" },
    { icon: Heart,         label: "获得爱心", v: "4,000", u: "颗", bg: "bg-[hsl(310_70%_92%)]", fg: "text-[hsl(330_70%_50%)]" },
    { icon: Mountain,      label: "冒险次数", v: "35",   u: "次",  bg: "bg-[hsl(140_55%_88%)]", fg: "text-[hsl(160_55%_35%)]" },
  ];

  const medals = [
    { icon: Bone,    label: "摸气勋章", color: "from-[hsl(22_95%_72%)] to-[hsl(14_88%_66%)]",  earned: true },
    { icon: Compass, label: "头铁勋章", color: "from-[hsl(348_85%_75%)] to-[hsl(330_85%_70%)]", earned: true },
    { icon: Award,   label: "首萌宠勋章", color: "from-[hsl(258_75%_75%)] to-[hsl(280_75%_70%)]", earned: true },
    { icon: MapIcon, label: "旅行勋章", color: "from-[hsl(140_55%_60%)] to-[hsl(170_60%_55%)]", earned: true },
    { icon: Heart,   label: "长期养护",  color: "from-muted to-muted",  earned: false },
    { icon: Bone,    label: "收果所有爱心", color: "from-muted to-muted", earned: false },
    { icon: Award,   label: "熊巨过大勋章", color: "from-muted to-muted", earned: false },
    { icon: Award,   label: "收藏全部勋章", color: "from-muted to-muted", earned: false },
  ];

  return (
    <PhoneShell>
      <div className="relative px-5 pt-4 pt-safe pb-8">
        <Sparkles />

        {/* 顶部 Lv + 心 + 金币 */}
        <div className="relative flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(258_70%_92%)] px-3 py-1 font-display text-[12px] font-extrabold text-[hsl(258_60%_45%)] shadow-soft">
            ✦ Lv.{member === "yearly" ? "9" : member === "monthly" ? "5" : "3"}
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 font-display text-[12px] font-extrabold text-[hsl(348_85%_55%)] shadow-soft">
              <Heart className="h-3.5 w-3.5 fill-current" /> 150
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 font-display text-[12px] font-extrabold text-[hsl(42_85%_45%)] shadow-soft">
              🪙 300
            </span>
          </div>
        </div>

        {/* 大头像 + 称号 */}
        <div className="relative mt-4 flex flex-col items-center">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-card p-2 shadow-pet ring-4 ring-white">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[hsl(48_95%_92%)]">
              <img src={pet.images.idle} alt={pet.name} className="h-[120%] object-contain" draggable={false} />
            </div>
            <span className="absolute -right-1 -top-1 text-2xl">✨</span>
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-card px-5 py-2 shadow-soft">
            <span className="font-display text-[18px] font-extrabold text-foreground">{kidName} · 爱宠达人</span>
          </div>
        </div>

        {/* 2x2 数据卡 */}
        <div className="relative mt-5 grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-[26px] bg-card p-3.5 shadow-card">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", s.bg)}>
                <s.icon className={cn("h-6 w-6", s.fg)} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <div className="font-display text-[12px] font-bold text-muted-foreground">{s.label}</div>
                <div className="mt-0.5 flex items-baseline gap-0.5">
                  <span className="font-display text-[20px] font-extrabold leading-none text-foreground">{s.v}</span>
                  <span className="text-[11px] text-muted-foreground">{s.u}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 会员卡片 */}
        <button
          onClick={() => setMemberOpen(true)}
          className="relative mt-5 block w-full overflow-hidden rounded-[28px] bg-gradient-to-br from-[hsl(42_100%_72%)] via-[hsl(22_95%_70%)] to-[hsl(348_90%_75%)] p-5 text-left shadow-pop active:scale-[0.99]"
        >
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/25 blur-2xl" />
          <span className="absolute right-4 top-3 text-xl text-white/80">✦</span>
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/30 backdrop-blur">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-display text-base font-extrabold text-white">
                {member === "yearly" ? "年卡 VIP 已开通" : member === "monthly" ? "月卡 VIP 已开通" : "开通伊呀会员"}
              </div>
              <div className="text-[12px] text-white/85">
                {member === "none" ? "解锁全部 9 只萌宠 + 睡前哄睡" : "感谢支持，享受全部权益"}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/90" />
          </div>
        </button>

        {/* 成就勋章 */}
        <h2 className="mt-6 font-display text-[18px] font-extrabold text-foreground">成就勋章</h2>
        <div className="mt-3 grid grid-cols-4 gap-3 rounded-[26px] bg-card p-4 shadow-card">
          {medals.map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br shadow-soft",
                  m.color,
                  !m.earned && "opacity-50 grayscale",
                )}
              >
                <m.icon className="h-6 w-6 text-white" strokeWidth={2.2} />
              </div>
              <span className={cn("text-center font-display text-[10px] font-extrabold leading-tight", m.earned ? "text-foreground" : "text-muted-foreground")}>
                {m.label}
              </span>
            </div>
          ))}
        </div>

        {/* 使用时长 */}
        <h2 className="mt-6 font-display text-[16px] font-extrabold text-foreground">使用时长控制</h2>
        <div className="mt-2 rounded-[26px] bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">每日上限</span>
            <span className="font-display text-base font-extrabold text-primary">{duration} 分钟</span>
          </div>
          <input
            type="range" min={30} max={90} step={30}
            value={duration} onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-3 w-full accent-[hsl(22_92%_68%)]"
          />
          <div className="mt-1 flex justify-between text-[10px] font-bold text-muted-foreground">
            <span>30</span><span>60</span><span>90</span>
          </div>
        </div>

        {/* 一键锁屏 */}
        <button
          onClick={() => setLocked((v) => !v)}
          className={cn(
            "mt-3 flex w-full items-center justify-between rounded-[26px] p-4 shadow-card transition-all active:scale-[0.99]",
            locked ? "bg-foreground text-background" : "bg-card",
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", locked ? "bg-background/20" : "bg-primary-soft text-primary")}>
              <Lock className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-display text-[14px] font-extrabold">一键锁屏</div>
              <div className={cn("text-[11px]", locked ? "text-background/70" : "text-muted-foreground")}>
                {locked ? "孩子端已锁定" : "立即暂停所有功能"}
              </div>
            </div>
          </div>
          <span className={cn("rounded-full px-3 py-1 font-display text-[11px] font-extrabold", locked ? "bg-background/20" : "bg-foreground/10")}>
            {locked ? "已锁" : "锁屏"}
          </span>
        </button>

        {/* 敏感词 */}
        <div className="mt-3 flex items-center justify-between rounded-[26px] bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-[14px] font-extrabold">安全敏感词过滤</div>
              <div className="text-[11px] text-muted-foreground">自动屏蔽不良内容</div>
            </div>
          </div>
          <button
            onClick={() => setFilter((v) => !v)}
            aria-label="敏感词开关"
            className={cn("relative h-7 w-12 rounded-full transition-colors", filter ? "bg-gradient-primary" : "bg-muted")}
          >
            <span className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-soft transition-transform", filter ? "translate-x-5" : "translate-x-0.5")} />
          </button>
        </div>

        {/* 列表 */}
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-[26px] bg-card shadow-card">
          {[
            { icon: Moon,     label: "睡前哄睡模式", to: "/sleep" },
            { icon: Bell,     label: "通知提醒",     action: () => alert("通知提醒设置（演示）") },
            { icon: FileText, label: "关于我们",     action: () => alert("伊呀 — 儿童 AI 萌宠陪伴 v1.0") },
            { icon: Shield,   label: "隐私协议",     action: () => setPrivacyOpen(true) },
          ].map((row) => (
            <li key={row.label}>
              <button
                onClick={() => row.to ? navigate(row.to) : row.action?.()}
                className="flex w-full items-center gap-3 p-4 text-left active:bg-muted/40"
              >
                <row.icon className="h-5 w-5 text-foreground/70" />
                <span className="flex-1 font-display text-[14px] font-bold text-foreground">{row.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <MembershipModal
        open={memberOpen}
        onClose={() => setMemberOpen(false)}
        onSubscribed={(lv) => { setMember(lv); setMemberOpen(false); }}
      />
      <PrivacyModal open={privacyOpen} onAgree={() => setPrivacyOpen(false)} onReject={() => setPrivacyOpen(false)} />
    </PhoneShell>
  );
};

export default Me;
