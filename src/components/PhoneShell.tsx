import { ReactNode } from "react";
import { TabBar } from "./TabBar";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** 隐藏底部 Tab（启动页用） */
  hideTab?: boolean;
  /** 暗色调（哄睡页） */
  dark?: boolean;
};

/**
 * 移动端外壳 — 居中、最大 480px、奶油底色（或暗色）、底部预留 Tab 高度
 */
export const PhoneShell = ({ children, hideTab, dark }: Props) => {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full",
        dark ? "bg-[hsl(230_30%_10%)]" : "bg-gradient-sky",
      )}
    >
      {!dark && <div className="pointer-events-none fixed inset-0 bg-gradient-sun opacity-70" />}
      <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col">
        <main className={cn("flex-1", hideTab ? "" : "pb-28")}>{children}</main>
        {!hideTab && <TabBar dark={dark} />}
      </div>
    </div>
  );
};
