"use client";

import { useState } from "react";

// Ground floor plan, drawn in plan units: 30 units = 1 m.
type Room = {
  id: string;
  name: string;
  area: string;
  x: number;
  y: number;
  w: number;
  h: number;
  outdoor?: boolean;
};

const ROOMS: Room[] = [
  { id: "entrance", name: "Entrance Hall", area: "23 m²", x: 330, y: 100, w: 140, h: 150 },
  { id: "study", name: "Study", area: "17 m²", x: 230, y: 100, w: 100, h: 150 },
  { id: "stair", name: "Stair & Fireplace", area: "17 m²", x: 470, y: 100, w: 100, h: 150 },
  { id: "living", name: "Living Hall · double height", area: "68 m²", x: 330, y: 250, w: 290, h: 210 },
  { id: "kitchen", name: "Kitchen", area: "42 m²", x: 570, y: 100, w: 250, h: 150 },
  { id: "dining", name: "Dining", area: "47 m²", x: 620, y: 250, w: 200, h: 210 },
  { id: "ensuite", name: "En-suite", area: "14 m²", x: 820, y: 100, w: 130, h: 100 },
  { id: "guest", name: "Guest Suite", area: "38 m²", x: 820, y: 200, w: 130, h: 260 },
  { id: "utility", name: "Utility & Boot Room", area: "12 m²", x: 230, y: 250, w: 100, h: 110 },
  { id: "wc", name: "WC & Shower", area: "11 m²", x: 230, y: 360, w: 100, h: 100 },
  { id: "garage", name: "Garage", area: "42 m²", x: 50, y: 100, w: 180, h: 210 },
  { id: "terrace", name: "Covered Terrace", area: "48 m²", x: 590, y: 460, w: 360, h: 120, outdoor: true },
  { id: "pool", name: "Pool", area: "10 × 3 m", x: 250, y: 520, w: 300, h: 90, outdoor: true },
];

// Openings cut through walls: [x, y, w, h]
const CUTS: [number, number, number, number][] = [
  [370, 94, 60, 12], // front door
  [70, 94, 140, 12], // garage door
  [224, 275, 12, 30], // garage → utility
  [326, 200, 8, 30], // study
  [326, 320, 8, 30], // utility
  [326, 410, 8, 30], // wc
  [345, 246, 110, 8], // entrance → living
  [466, 120, 8, 115], // entrance → stair
  [816, 300, 8, 30], // guest suite
  [835, 196, 30, 8], // en-suite
];

// Door leaves and swings
const DOORS = [
  "M370 100 L370 130 M400 100 A30 30 0 0 1 370 130",
  "M430 100 L430 130 M400 100 A30 30 0 0 0 430 130",
  "M230 275 L260 275 M230 305 A30 30 0 0 0 260 275",
  "M330 200 L300 200 M330 230 A30 30 0 0 1 300 200",
  "M330 350 L300 350 M330 320 A30 30 0 0 0 300 350",
  "M330 440 L300 440 M330 410 A30 30 0 0 0 300 440",
  "M820 300 L850 300 M820 330 A30 30 0 0 0 850 300",
  "M835 200 L835 170 M865 200 A30 30 0 0 0 835 170",
];

// Glazing on external walls: [x1, y1, x2, y2]
const WINDOWS: [number, number, number, number][] = [
  [255, 100, 305, 100],
  [600, 100, 790, 100],
  [865, 100, 910, 100],
  [950, 250, 950, 425],
  [350, 460, 600, 460],
  [640, 460, 800, 460],
  [845, 460, 925, 460],
  [230, 385, 230, 435],
];

const INTERNAL_WALLS = "M330 100 V460 M230 250 H330 M230 360 H330 M470 100 V250 M570 100 V250 M330 250 H570 M820 100 V460 M820 200 H950";

export function FloorPlan() {
  const [active, setActive] = useState<string | null>(null);
  const indexOf = (id: string) => ROOMS.findIndex((r) => r.id === id) + 1;

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <figure className="min-w-0 lg:col-span-8">
        {/* On phones the plan keeps a readable size and scrolls sideways */}
        <div className="overflow-x-auto border border-line bg-[#f8f6f1] p-3 md:p-6">
          <svg
            viewBox="0 0 1100 690"
            className="h-auto w-full min-w-[680px] text-ink md:min-w-0"
            role="img"
            aria-label="Ground floor plan of the residence with numbered rooms"
            onMouseLeave={() => setActive(null)}
          >
            {/* Outdoor areas */}
            <g>
              <rect x="590" y="460" width="360" height="120" fill="#ece7dd" />
              {Array.from({ length: 7 }, (_, i) => (
                <line key={i} x1="590" x2="950" y1={475 + i * 15} y2={475 + i * 15} stroke="#d9d2c4" strokeWidth="1" />
              ))}
              <rect x="590" y="460" width="360" height="120" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="8 6" />
              <rect x="250" y="520" width="300" height="90" fill="#d5e1de" stroke="currentColor" strokeWidth="1.5" />
              <path d="M266 520 V610 M282 520 V610" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
            </g>

            {/* Room fills: hover targets and highlights */}
            {ROOMS.map((r) => (
              <rect
                key={r.id}
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                fill={active === r.id ? "var(--color-accent)" : "transparent"}
                fillOpacity={active === r.id ? 0.18 : 0}
                className="cursor-pointer transition-[fill-opacity] duration-300"
                onMouseEnter={() => setActive(r.id)}
              />
            ))}

            {/* Furniture and fixtures */}
            <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" pointerEvents="none">
              <rect x="245" y="118" width="70" height="22" />
              <rect x="235" y="258" width="18" height="96" />
              <ellipse cx="252" cy="405" rx="9" ry="13" />
              <rect x="280" y="370" width="42" height="36" />
              <rect x="70" y="135" width="62" height="150" rx="14" strokeDasharray="5 4" />
              <rect x="150" y="135" width="62" height="150" rx="14" strokeDasharray="5 4" />
              <rect x="575" y="104" width="240" height="18" />
              <rect x="635" y="165" width="130" height="34" />
              <rect x="665" y="315" width="110" height="64" rx="4" />
              {[680, 705, 730, 755].map((x) => (
                <g key={x}>
                  <rect x={x - 7} y="301" width="14" height="10" rx="2" />
                  <rect x={x - 7} y="383" width="14" height="10" rx="2" />
                </g>
              ))}
              <path d="M378 320 H408 V395 H565 V425 H378 Z" />
              <rect x="445" y="318" width="80" height="40" rx="3" />
              <rect x="845" y="330" width="82" height="96" />
              <path d="M845 348 H927" />
              <rect x="900" y="108" width="42" height="74" rx="10" />
              <rect x="828" y="108" width="44" height="18" />
            </g>

            {/* Stair */}
            <g stroke="currentColor" strokeWidth="1" opacity="0.7" pointerEvents="none">
              {Array.from({ length: 11 }, (_, i) => (
                <line key={i} x1="485" x2="555" y1={115 + i * 12} y2={115 + i * 12} />
              ))}
              <path d="M520 232 V122 M513 132 L520 122 L527 132" fill="none" strokeWidth="1.4" />
            </g>

            {/* Walls */}
            <g fill="none" stroke="currentColor" strokeLinejoin="miter" pointerEvents="none">
              <rect x="230" y="100" width="720" height="360" strokeWidth="9" />
              <path d="M230 100 H50 V310 H230" strokeWidth="9" />
              <path d={INTERNAL_WALLS} strokeWidth="4" />
            </g>
            <rect x="495" y="250" width="50" height="13" fill="currentColor" pointerEvents="none" />

            {/* Openings, doors, glazing */}
            <g pointerEvents="none">
              {CUTS.map(([x, y, w, h], i) => (
                <rect key={i} x={x} y={y} width={w} height={h} fill="#f8f6f1" />
              ))}
              <path d="M70 100 H210" stroke="currentColor" strokeWidth="1.2" strokeDasharray="6 4" />
              <g fill="none" stroke="currentColor" strokeWidth="1">
                {DOORS.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
              {WINDOWS.map(([x1, y1, x2, y2], i) => {
                const vertical = x1 === x2;
                return (
                  <g key={i}>
                    <rect
                      x={vertical ? x1 - 5 : x1}
                      y={vertical ? y1 : y1 - 5}
                      width={vertical ? 10 : x2 - x1}
                      height={vertical ? y2 - y1 : 10}
                      fill="#f8f6f1"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" />
                  </g>
                );
              })}
            </g>

            {/* Room numbers */}
            {ROOMS.map((r, i) => {
              const on = active === r.id;
              const cx = r.x + r.w / 2;
              const cy = r.id === "stair" ? r.y + r.h - 22 : r.y + r.h / 2;
              return (
                <g key={r.id} pointerEvents="none">
                  <circle cx={cx} cy={cy} r={on ? 15 : 12} fill={on ? "var(--color-accent)" : "currentColor"} className="transition-all duration-300" />
                  <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="500">
                    {i + 1}
                  </text>
                </g>
              );
            })}

            {/* Overall dimension */}
            <g stroke="currentColor" strokeWidth="1" opacity="0.7" pointerEvents="none">
              <path d="M50 60 H950 M50 52 V68 M950 52 V68 M230 55 V65" />
            </g>
            <text x="500" y="50" textAnchor="middle" fontSize="13" fill="currentColor" opacity="0.75">
              30.0 m
            </text>

            {/* North arrow and scale */}
            <g transform="translate(1040 120)" pointerEvents="none">
              <circle r="24" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M0 -18 L7 8 L0 3 L-7 8 Z" fill="currentColor" />
              <text y="-30" textAnchor="middle" fontSize="13" fill="currentColor">
                N
              </text>
            </g>
            <g transform="translate(800 650)" pointerEvents="none">
              <rect width="75" height="6" fill="currentColor" />
              <rect x="75" width="75" height="6" fill="none" stroke="currentColor" strokeWidth="1" />
              <text y="24" fontSize="11" fill="currentColor">
                0
              </text>
              <text x="150" y="24" fontSize="11" textAnchor="end" fill="currentColor">
                5 m
              </text>
            </g>
          </svg>
        </div>
        <figcaption className="mt-3 flex justify-between text-xs text-muted">
          <span>Ground floor plan</span>
          <span className="md:hidden">Swipe to see the full plan</span>
          <span className="hidden md:inline">Indicative, not to scale</span>
        </figcaption>
      </figure>

      <div className="lg:col-span-4">
        <p className="eyebrow text-muted">Schedule of spaces</p>
        <ol className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
          {ROOMS.map((r) => {
            const on = active === r.id;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(r.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(r.id)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive(on ? null : r.id)}
                  className={`flex w-full items-baseline gap-3 border-b border-line py-2.5 text-left text-sm transition-colors ${
                    on ? "text-accent" : "text-ink-2 hover:text-ink"
                  }`}
                  aria-pressed={on}
                >
                  <span className="w-5 shrink-0 text-xs tabular-nums text-muted">{indexOf(r.id)}</span>
                  <span className="flex-1">
                    {r.name}
                    {r.outdoor && <span className="ml-2 text-xs text-muted">outdoor</span>}
                  </span>
                  <span className="tabular-nums text-muted">{r.area}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
