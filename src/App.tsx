import { useCallback, useMemo, useState } from "react";
import { AppProvider, useApp } from "./lib/store";
import { AppBar, Footer, TabBar, Toast, type Tab } from "./components/chrome";
import { Landing } from "./components/Landing";
import { Results } from "./components/Results";
import { Journal } from "./components/Journal";
import { Comprendre } from "./components/Comprendre";
import { ScanSheet } from "./components/ScanSheet";
import { ProfileSheet } from "./components/ProfileSheet";

function Shell() {
  const { state, now, loadDemo, lastAdded } = useApp();
  const [tab, setTab] = useState<Tab>("soir");
  const [scanOpen, setScanOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const hasProfile = Boolean(state.profile);

  const openScan = useCallback(() => {
    if (!hasProfile) {
      setProfileOpen(true);
      return;
    }
    setScanOpen(true);
  }, [hasProfile]);

  const startApp = useCallback(() => {
    setProfileOpen(true);
  }, []);

  const onDemo = useCallback(() => {
    loadDemo();
    setTab("soir");
  }, [loadDemo]);

  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"ok" | "warn">("ok");

  const showToast = useCallback((msg: string, tone: "ok" | "warn" = "ok") => {
    setToast(msg);
    setToastTone(tone);
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const addedToast = useMemo(
    () => (lastAdded ? `${lastAdded.name} ajouté${lastAdded.count > 1 ? ` · ${lastAdded.count}ᵉ verre` : " au journal"}` : null),
    [lastAdded]
  );

  // routing minimaliste : onboarding → profil
  const showLanding = !state.onboarded && !hasProfile;

  return (
    <div className="min-h-screen bg-ivory font-sans text-marine-950 antialiased">
      {showLanding ? (
        <Landing
          onStart={startApp}
          onDemo={() => {
            onDemo();
            showToast("Soirée de démonstration chargée");
          }}
        />
      ) : (
        <>
          <AppBar
            tab={tab}
            onTab={setTab}
            onScan={openScan}
            onProfile={() => setProfileOpen(true)}
            profile={state.profile}
          />

          <main className="mx-auto max-w-5xl px-4 pb-8 pt-4 sm:px-6 sm:pt-6">
            {tab === "soir" && (
              <Results
                session={state.session}
                profile={state.profile}
                now={now}
                onScan={openScan}
                onOpenProfile={() => setProfileOpen(true)}
                onDemo={onDemo}
              />
            )}
            {tab === "journal" && (
              <Journal
                profile={state.profile}
                now={now}
                onScan={openScan}
                onDashboard={() => setTab("soir")}
              />
            )}
            {tab === "comprendre" && <Comprendre profile={state.profile} />}
          </main>

          <Footer />
          <TabBar tab={tab} onTab={setTab} onScan={openScan} />
        </>
      )}

      <ScanSheet open={scanOpen} onClose={() => setScanOpen(false)} />

      <ProfileSheet
        open={profileOpen}
        onboard={!hasProfile}
        onClose={() => setProfileOpen(false)}
      />

      <Toast message={toast ?? addedToast} tone={toastTone} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
