import { describe, expect, it } from 'vitest';
import {
  buildGradientSvgMarkup,
  buildLinearGradientCss,
  deriveGradientStops,
} from './_logic';

describe('deriveGradientStops', () => {
  it('returns three identical stops and zero rotate in solid mode', () => {
    const stops = deriveGradientStops('#336699', 'solid', () => 0.5);
    expect(stops.rotate).toBe(0);
    expect(stops.color1.toHex()).toBe(stops.color2.toHex());
    expect(stops.color2.toHex()).toBe(stops.color3.toHex());
    expect(stops.color1.toHex()).toBe('#336699');
  });

  it('uses the injected random sequence for gradient mode', () => {
    const sequence = [0.12, 0.13, -60, 0.18, 0.25, 60, 0.5, 0.12, 180];
    let index = 0;
    const random = () => {
      const value = sequence[index] ?? 0;
      index += 1;
      return value;
    };

    const stops = deriveGradientStops('#336699', 'gradient', random);
    expect(stops.rotate).toBe(180);
    expect(stops.color1.toHex()).not.toBe(stops.color3.toHex());
  });
});

describe('buildLinearGradientCss', () => {
  it('builds a css linear-gradient string', () => {
    expect(buildLinearGradientCss(90, '#111111', '#222222', '#333333')).toBe(
      'linear-gradient(90deg, #111111, #222222, #333333)',
    );
  });
});

describe('buildGradientSvgMarkup', () => {
  it('includes gradient stops and omits noise when disabled', () => {
    const svg = buildGradientSvgMarkup({
      color1Hex: '#111111',
      color2Hex: '#222222',
      color3Hex: '#333333',
      enableNoise: false,
      height: 50,
      noiseFrequency: 0.5,
      opacity: 0.4,
      rotate: 45,
      width: 100,
    });

    expect(svg).toContain('width="100"');
    expect(svg).toContain('height="50"');
    expect(svg).toContain('stop-color="#222222"');
    expect(svg).not.toContain('id="noise"');
  });

  it('includes the noise filter when enabled', () => {
    const svg = buildGradientSvgMarkup({
      color1Hex: '#000000',
      color2Hex: '#000000',
      color3Hex: '#000000',
      enableNoise: true,
      height: 10,
      noiseFrequency: 0.65,
      opacity: 0.5,
      rotate: 0,
      width: 10,
    });

    expect(svg).toContain('id="noise"');
    expect(svg).toContain('baseFrequency="0.65"');
    expect(svg).toContain('opacity="0.5"');
  });
});
