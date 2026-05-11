import { Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onAgree: () => void;
  onReject: () => void;
};

/** 隐私协议弹窗：首启展示 */
export const PrivacyModal = ({ open, onAgree, onReject }: Props) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 sm:items-center",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="隐私协议"
    >
      <div
        className={cn(
          "mx-4 w-full max-w-[420px] rounded-[2rem] bg-card p-6 shadow-pet transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-8",
        )}
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h2 className="mt-3 font-display text-xl font-extrabold text-foreground">小小约定</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            我们非常重视小朋友的隐私安全。在你点击「同意」前，请家长帮忙阅读
            <span className="font-bold text-primary">《用户协议》</span>
            与
            <span className="font-bold text-primary">《隐私政策》</span>。
            我们承诺：不收集儿童敏感信息、不推送广告、所有对话本地存储。
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={onReject}
            className="h-12 rounded-2xl bg-muted font-display text-[15px] font-bold text-muted-foreground active:scale-[0.97]"
          >
            暂不使用
          </button>
          <button
            onClick={onAgree}
            className="h-12 rounded-2xl bg-gradient-primary font-display text-[15px] font-extrabold text-primary-foreground shadow-pop active:scale-[0.97]"
          >
            同意并开启
          </button>
        </div>
      </div>
    </div>
  );
};
