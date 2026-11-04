import type { Milestone } from "@/content/types";
import type { StationId } from "./geometry";

/** A manifest image resolved on the server (largest WebP ≤ 2048 px) */
export type SceneImage = {
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
};

export type RouteStation = {
  id: StationId;
  city: string;
  country: string;
  label: string;
  from: string;
  to?: string;
  coords: string;
  alt: string;
  image: SceneImage | null;
  layer: SceneImage | null;
};

export type RouteMilestone = {
  id: string;
  at: StationId;
  kind: Milestone["kind"];
  date: string;
  dateLabel: string;
  title: string;
  subtitle?: string;
  summary: string;
  href?: string;
};
