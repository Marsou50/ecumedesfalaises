import { useCallback, useRef, useState } from "react";
import { Announcement, Navbar, Footer, Toast, FloatingActions } from "./components/chrome";
import { Hero, SocialProof, Features, Showcase } from "./components/sections-top";
import { Benefits, Testimonials, Pricing, FAQ, FinalCTA } from "./components/sections-bottom";

export default function App() {
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAdd = useCallback((label: string, count = 1) => {
    setCartCount((c) => c + count);
    setToast(label);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const handleCart = useCallback(() => {
    setToast(
      cartCount === 0
        ? "Votre panier est vide — laissez-vous tenter par la marée de jeudi"
        : `${cartCount} article${cartCount > 1 ? "s" : ""} dans votre panier · -15% appliqué`
    );
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, [cartCount]);

  return (
    <div className="min-h-screen bg-ivory font-sans text-marine-950 antialiased">
      <a
        href="#coffrets"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-marine-950 focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
      >
        Aller directement à la commande
      </a>
      <Announcement />
      <Navbar cartCount={cartCount} onCart={handleCart} />
      <main>
        <Hero onAdd={handleAdd} />
        <SocialProof />
        <Features />
        <Showcase onAdd={handleAdd} />
        <Benefits />
        <Testimonials />
        <Pricing onAdd={handleAdd} />
        <FAQ />
        <FinalCTA onAdd={handleAdd} />
      </main>
      <Footer />
      <Toast message={toast} />
      <FloatingActions cartCount={cartCount} />
    </div>
  );
}
