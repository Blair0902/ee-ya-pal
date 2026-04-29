import { ReactNode } from "react";
import { TabBar } from "./TabBar";

/**
 * 移动端外壳 — 居中、最大 480px、奶油底色、底部预留 Tab 高度
 */
export const PhoneShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen w-full bg-gradient-sky">
      {/* 装饰：远景柔光 */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-sun opacity-70" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col">
        <main className="flex-1 pb-28">{children}</main>
        <TabBar />
      </div>
    </div>
  );
};
