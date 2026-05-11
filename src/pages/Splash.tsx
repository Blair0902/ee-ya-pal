import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import appLogo from "@/assets/app-logo.png";
import { useState } from "react";
import { PrivacyModal } from "@/components/modals/PrivacyModal";

const PRIVACY_KEY = "privacyAgreed";

const Splash = () => {
  const navigate = useNavigate();
  const [askPrivacy, setAskPrivacy] = useState(false);

  useEffect(() => {
    const agreed = window.localStorage.getItem(PRIVACY_KEY) === "1";
    if (!agreed) setAskPrivacy(true);
  }, []);

  const enter = () => {
    if (window.localStorage.getItem(PRIVACY_KEY) === "1") navigate("/home");
    else setAskPrivacy(true);
  };

  const onAgree = () => {
    window.localStorage.setItem(PRIVACY_KEY, "1");
    setAskPrivacy(false);
    navigate("/home");
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-sky">
      <div className="pointer-events-none fixed inset-0 bg-gradient-sun opacity-80" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center px-8 pb-10 pt-safe">
        {/* 装饰：柔光圆 */}
        <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-soft opacity-60 blur-3xl" />
        <div className="pointer-events-none absolute bottom-40 -left-10 h-44 w-44 rounded-full bg-secondary/40 blur-3xl" />

        <div className="mt-[28vh] flex flex-col items-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] bg-card/80 shadow-pet">
            <img
              src={appLogo}
              alt="伊呀"
              width={128}
              height={128}
              className="h-24 w-24 object-contain"
            />
          </div>
          <h1 className="mt-8 font-display text-[28px] font-extrabold tracking-tight text-foreground">
            我的萌宠AI小伙伴
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">陪你说话、讲故事、晚安抱抱</p>
        </div>

        <div className="flex-1" />

        <button
          onClick={enter}
          className="h-14 w-full rounded-[2rem] bg-gradient-primary font-display text-lg font-extrabold text-primary-foreground shadow-pop transition-transform active:scale-[0.98]"
        >
          开启陪伴
        </button>
        <p className="mt-3 text-[11px] text-muted-foreground">点击开启即代表同意《隐私政策》</p>
      </div>

      <PrivacyModal
        open={askPrivacy}
        onAgree={onAgree}
        onReject={() => setAskPrivacy(false)}
      />
    </div>
  );
};

export default Splash;
