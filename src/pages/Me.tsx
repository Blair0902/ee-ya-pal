import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Crown, Lock, Moon, FileText, Shield, BarChart3, Bell, ChevronRight, Clock, Flame, MessageCircle, ArrowLeft,
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { MembershipModal } from "@/components/modals/MembershipModal";
import { PrivacyModal } from "@/components/modals/PrivacyModal";
import { loadMember, MemberLevel } from "@/lib/pets";
import { cn } from "@/lib/utils";

const Me = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState<MemberLevel>(() => loadMember());
  const [duration, setDuration] = useState(60);
  const [filter, setFilter] = useState(true);
  const [memberOpen, setMemberOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [locked, setLocked] = useState(false);

  return (
    <PhoneShell>
      <div className="px-5 pt-4 pt-safe pb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            aria-label="返回"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-soft active:scale-95"
          >
            <ArrowLeft className="h-5 w-5 text-foreground/70" />
          </button>
          <div>
            <h1 className="font-display text-[22px] font-extrabold">家长中心</h1>
            <p className="text-[12px] text-muted-foreground">陪伴的同时，安心守护</p>
          </div>
        </div>

        {/* 会员卡 */}
        <button
          onClick={() => setMemberOpen(true)}
          className="relative mt-4 block w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(42_100%_72%)] via-[hsl(22_95%_70%)] to-[hsl(348_90%_75%)] p-5 text-left shadow-pop active:scale-[0.99]"
        >
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/30 backdrop-blur">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-display text-base font-extrabold text-white">
                {member === "yearly" ? "年卡 VIP 已开通" : member === "monthly" ? "月卡 VIP 已开通" : "开通伊呀会员"}
              </div>
              <div className="text-[12px] text-white/80">
                {member === "none" ? "解锁全部 9 只萌宠 + 睡前哄睡" : "感谢支持，享受全部权益"}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/80" />
          </div>
        </button>

        {/* 数据统计 */}
        <h2 className="mt-6 font-display text-sm font-extrabold text-foreground">今日成长</h2>
        <div className="mt-2 grid grid-cols-3 gap-2.5">
          {[
            { v: "23", u: "分钟", l: "陪伴时长", icon: Clock, color: "bg-primary-soft text-primary" },
            { v: "12", u: "次", l: "聊天对话", icon: MessageCircle, color: "bg-secondary text-secondary-foreground" },
            { v: "3", u: "个", l: "故事完成", icon: Flame, color: "bg-accent text-accent-foreground" },
          ].map((s) => (
            <div key={s.l} className="rounded-3xl bg-card p-3 shadow-card">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", s.color)}>
                <s.icon className="h-4 w-4" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-0.5">
                <span className="font-display text-xl font-extrabold text-foreground">{s.v}</span>
                <span className="text-[10px] text-muted-foreground">{s.u}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>

        {/* 使用时长 */}
        <h2 className="mt-6 font-display text-sm font-extrabold text-foreground">使用时长控制</h2>
        <div className="mt-2 rounded-3xl bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">每日上限</span>
            <span className="font-display text-base font-extrabold text-primary">{duration} 分钟</span>
          </div>
          <input
            type="range"
            min={30}
            max={90}
            step={30}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
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
            "mt-3 flex w-full items-center justify-between rounded-3xl p-4 shadow-card transition-all active:scale-[0.99]",
            locked ? "bg-foreground text-background" : "bg-card",
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", locked ? "bg-background/20" : "bg-primary-soft text-primary")}>
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
        <div className="mt-3 flex items-center justify-between rounded-3xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
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
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors",
              filter ? "bg-gradient-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-soft transition-transform",
                filter ? "translate-x-5" : "translate-x-0.5",
              )}
            />
          </button>
        </div>

        {/* 功能列表 */}
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-3xl bg-card shadow-card">
          {[
            { icon: Moon, label: "睡前哄睡模式", to: "/sleep" },
            { icon: BarChart3, label: "成长报告（周）", action: () => alert("演示原型：本周报告生成中…") },
            { icon: Bell, label: "通知提醒", action: () => alert("通知提醒设置（演示）") },
            { icon: FileText, label: "关于我们", action: () => alert("伊呀 — 儿童 AI 萌宠陪伴 v1.0") },
            { icon: Shield, label: "隐私协议", action: () => setPrivacyOpen(true) },
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
      <PrivacyModal
        open={privacyOpen}
        onAgree={() => setPrivacyOpen(false)}
        onReject={() => setPrivacyOpen(false)}
      />
    </PhoneShell>
  );
};

export default Me;
