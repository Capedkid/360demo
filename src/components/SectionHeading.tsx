import { Reveal } from "./Reveal";

type Props = {
  index: string;
  label: string;
  heading: string;
  intro?: string;
  tone?: "light" | "dark";
};

export function SectionHeading({ index, label, heading, intro, tone = "light" }: Props) {
  const muted = tone === "dark" ? "text-white/55" : "text-muted";
  return (
    <div className="grid gap-6 md:grid-cols-12 md:gap-10">
      <Reveal className="md:col-span-3">
        <p className={`eyebrow flex items-center gap-3 ${muted}`}>
          <span>{index}</span>
          <span className="block h-px w-8 bg-current opacity-60" />
          <span>{label}</span>
        </p>
      </Reveal>
      <div className="md:col-span-9">
        <Reveal delay={0.05}>
          <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.75rem)] leading-[0.98] tracking-[-0.015em]">{heading}</h2>
        </Reveal>
        {intro && (
          <Reveal delay={0.12}>
            <p className={`mt-5 max-w-2xl text-base leading-relaxed md:text-lg ${tone === "dark" ? "text-white/70" : "text-ink-2"}`}>
              {intro}
            </p>
          </Reveal>
        )}
      </div>
    </div>
  );
}
