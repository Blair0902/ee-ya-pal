import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";

interface Props {
  emoji: string;
  title: string;
  hint: string;
  children?: ReactNode;
}

export const PlaceholderPage = ({ emoji, title, hint, children }: Props) => {
  const navigate = useNavigate();
  return (
    <PhoneShell>
      <header className="flex items-center gap-2 px-5 pt-4 pt-safe">
        <button
          onClick={() => navigate("/home")}
          aria-label="返回"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-soft active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-foreground/70" />
        </button>
      </header>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-8 text-center animate-fade-in-up">
        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-blob bg-gradient-card text-6xl shadow-card animate-float">
          {emoji}
        </div>
        <h1 className="font-display text-3xl font-extrabold text-foreground">{title}</h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{hint}</p>
        {children}
      </div>
    </PhoneShell>
  );
};
