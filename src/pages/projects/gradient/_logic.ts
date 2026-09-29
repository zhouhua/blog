import type { Colord } from 'colord';
import { colord } from 'colord';

export type GradientColorMode = 'gradient' | 'solid';

export type RandomFn = (min: number, max: number) => number;

export interface GradientStops {
  color1: Colord;
  color2: Colord;
  color3: Colord;
  rotate: number;
}

export function deriveGradientStops(
  baseHex: string,
  mode: GradientColorMode,
  random: RandomFn,
): GradientStops {
  if (mode === 'solid') {
    const solid = colord(baseHex);
    return {
      color1: solid,
      color2: solid,
      color3: solid,
      rotate: 0,
    };
  }

  const color2 = colord(baseHex).alpha(1).desaturate(random(0.1, 0.15)).lighten(random(0.1, 0.15));
  const color1 = color2.rotate(random(-70, -50)).saturate(random(0.15, 0.2)).lighten(random(0, 0.5));
  const color3 = color2.rotate(random(50, 70)).saturate(random(0.45, 0.55)).darken(random(0.1, 0.15));
  const rotate = Math.floor(random(0, 360));

  return { color1, color2, color3, rotate };
}

export function buildLinearGradientCss(
  rotate: number,
  color1Hex: string,
  color2Hex: string,
  color3Hex: string,
): string {
  return `linear-gradient(${rotate}deg, ${color1Hex}, ${color2Hex}, ${color3Hex})`;
}

export interface BuildGradientSvgMarkupInput {
  width: number;
  height: number;
  rotate: number;
  color1Hex: string;
  color2Hex: string;
  color3Hex: string;
  enableNoise: boolean;
  noiseFrequency: number;
  opacity: number;
}

export function buildGradientSvgMarkup({
  color1Hex,
  color2Hex,
  color3Hex,
  enableNoise,
  height,
  noiseFrequency,
  opacity,
  rotate,
  width,
}: BuildGradientSvgMarkupInput): string {
  const filterContent = `
        <filter id="noise" x="0" y="0">
          <feTurbulence type="fractalNoise" baseFrequency="${noiseFrequency}" numOctaves="3" stitchTiles="stitch" />
          <feBlend mode="normal" />
        </filter>
      `;

  return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <defs>
            <linearGradient id="lineGradient" gradientTransform="rotate(${rotate})">
              <stop offset="0%" stop-color="${color1Hex}" />
              <stop offset="50%" stop-color="${color2Hex}" />
              <stop offset="100%" stop-color="${color3Hex}" />
            </linearGradient>
            ${enableNoise ? filterContent : ''}
          </defs>
          <rect x="0" y="0" width="${width}" height="${height}" fill="url(#lineGradient)" />
          ${enableNoise ? `<rect width="${width}" height="${height}" x="0" y="0" filter="url(#noise)" opacity="${opacity}" />` : ''}
        </svg>
      `;
}
