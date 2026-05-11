import { Mic, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
};

/** 麦克风长按 — 语音交互弹窗（演示态） */
export const VoiceModal = ({ open, onClose }: Props) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[55] flex items-end justify-center bg-foreground/40 backdrop-blur-sm transition-opacity duration-300",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "w-full max-w-[480px] rounded-t-[2rem] bg-card pb-safe shadow-tab transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 className="font-display text-base font-extrabold">我在听呢～</h2>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center px-6 py-8">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
            <span className="absolute inset-2 animate-pulse rounded-full bg-primary/40" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary shadow-pop">
              <Mic className="h-9 w-9 text-primary-foreground" />
            </div>
          </div>

          {/* 语音波形（装饰） */}
          <div className="mt-6 flex h-10 items-end gap-1.5">
            {[0.4, 0.7, 1, 0.5, 0.9, 0.6, 1, 0.4, 0.8].map((h, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-primary/60"
                style={{ height: `${h * 100}%`, animation: `pulse 1s ease-in-out ${i * 80}ms infinite` }}
              />
            ))}
          </div>

          <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            正在听你说话…
          </p>
          <button
            onClick={onClose}
            className="mt-6 h-11 w-44 rounded-2xl bg-muted font-display text-sm font-bold text-muted-foreground active:scale-95"
          >
            松开发送
          </button>
        </div>
      </div>
    </div>
  );
};
