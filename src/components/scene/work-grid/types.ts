/** One case study as the grid needs it — resolved on the server, serialised as a prop. */
export type GridTile = {
  slug: string;
  short: string;
  client: string;
  year: string;
  /** 0-based position in the work index */
  index: number;
  /** Optimised cover (≈960 px webp) or null when the cover has not been generated yet */
  src: string | null;
};
