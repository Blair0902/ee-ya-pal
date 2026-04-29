import { ReactNode } from "react";
import { PhoneShell } from "@/components/PhoneShell";

interface Props {
  emoji: string;
  title: string;
  hint: string;
  children?: ReactNode;
}

export const PlaceholderPage = ({ emoji, title, hint, children }: Props) => (
  <PhoneShell>
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-8 text-center animate-fade-in-up">
      <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-blob bg-gradient-card text-6xl shadow-card animate-float">
        {emoji}
      </div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">{title}</h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{hint}</p>
      {children}
    </div>
  </PhoneShell>
);
