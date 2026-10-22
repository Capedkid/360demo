"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type NavItem = { id: string; label: string };

type Props = {
  name: string;
  items: NavItem[];
};

export function SiteHeader({ name, items }: Props) {
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Transparent over the hero, solid once the hero has scrolled away
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section currently in the middle of the screen
  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const light = !solid && !open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,color,box-shadow] duration-500 ${
          light ? "text-white" : "text-ink"
        } ${solid && !open ? "bg-paper/85 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : ""}`}
      >
        <div className="container-x flex h-16 items-center justify-between md:h-[4.5rem]">
          <a href="#top" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-full border border-current font-display text-sm italic"
            >
              {name.charAt(0)}
            </span>
            <span className="text-[0.95rem] font-medium tracking-tight">{name}</span>
          </a>

          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`relative rounded-full px-3.5 py-2 text-[0.82rem] transition-opacity hover:opacity-100 ${
                      active === item.id ? "opacity-100" : "opacity-70"
                    }`}
                  >
                    {item.label}
                    {active === item.id && (
                      <motion.span
                        layoutId="nav-dot"
                        className="absolute inset-x-0 -bottom-0.5 mx-auto block size-1 rounded-full bg-current"
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#contact"
              className={`hidden rounded-full border px-4 py-2 text-[0.82rem] transition-colors sm:inline-block ${
                light ? "border-white/50 hover:bg-white hover:text-ink" : "border-ink/25 hover:bg-ink hover:text-paper"
              }`}
            >
              Arrange a viewing
            </a>
            <button
              type="button"
              className="grid size-10 place-items-center lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-6">
                <span
                  className={`absolute left-0 block h-px w-6 bg-current transition-transform duration-300 ${
                    open ? "top-1.5 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-px w-6 bg-current transition-transform duration-300 ${
                    open ? "top-1.5 -rotate-45" : "top-3"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-paper pt-24 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav aria-label="Sections" className="container-x">
              <ul className="space-y-1">
                {[...items, { id: "contact", label: "Contact" }].map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <a
                      href={`#${item.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline gap-4 border-b border-line py-3 font-display text-4xl"
                    >
                      <span className="w-6 font-sans text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
