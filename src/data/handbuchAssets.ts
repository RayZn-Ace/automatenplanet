/**
 * Image asset manifest for the Boxautomat handbook.
 *
 * Each entry maps an `assetKey` (used inside HANDBUCH_BOXAUTOMAT_SECTIONS image
 * blocks) to:
 *   - publicUrl: path served by Vite/CDN, used by the React page <img src=…>
 *   - filePath:  path relative to the project root, used by the build-time
 *                PDF generator (scripts/generate-handbuch-pdf.ts) to embed the
 *                binary, and by the build sync to inline the bytes as base64
 *                into the edge function's data mirror.
 */
export type HandbuchImageAsset = {
  publicUrl: string;
  filePath: string;
};

export const HANDBUCH_IMAGE_ASSETS: Record<string, HandbuchImageAsset> = {
  "premium-platine": {
    publicUrl: "/images/handbuch/premium-platine-boxautomat.jpg",
    filePath: "public/images/handbuch/premium-platine-boxautomat.jpg",
  },
};
