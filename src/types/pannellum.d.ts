// Minimal typings for the parts of Pannellum 2.5 this site uses.
// Full reference: https://pannellum.org/documentation/reference/

declare module "pannellum/build/pannellum.js";

interface PannellumHotSpot {
  pitch: number;
  yaw: number;
  type: "scene" | "info";
  text?: string;
  sceneId?: string;
  targetYaw?: number | "sameAzimuth";
  targetPitch?: number | "same";
  cssClass?: string;
  createTooltipFunc?: (div: HTMLDivElement, args: unknown) => void;
  createTooltipArgs?: unknown;
  clickHandlerFunc?: (event: MouseEvent, args: unknown) => void;
  clickHandlerArgs?: unknown;
}

interface PannellumScene {
  title?: string;
  type: "equirectangular";
  panorama: string;
  preview?: string;
  yaw?: number;
  pitch?: number;
  hfov?: number;
  hotSpots?: PannellumHotSpot[];
}

interface PannellumConfig {
  default: Record<string, unknown> & { firstScene: string };
  scenes: Record<string, PannellumScene>;
}

interface PannellumViewer {
  on(event: "load" | "scenechange" | "error" | "mousedown" | "touchstart" | "animatefinished", cb: (arg?: unknown) => void): PannellumViewer;
  loadScene(sceneId: string, pitch?: number, yaw?: number, hfov?: number): PannellumViewer;
  getScene(): string;
  resize(): void;
  destroy(): void;
  startAutoRotate(speed?: number, pitch?: number): PannellumViewer;
  stopAutoRotate(): PannellumViewer;
  isOrientationSupported(): boolean;
  isOrientationActive(): boolean;
  startOrientation(): void;
  stopOrientation(): void;
  getHfov(): number;
  setHfov(hfov: number, animated?: number | boolean): PannellumViewer;
  getHfovBounds(): [number, number];
}

interface Window {
  pannellum?: { viewer(container: HTMLElement | string, config: PannellumConfig): PannellumViewer };
}
