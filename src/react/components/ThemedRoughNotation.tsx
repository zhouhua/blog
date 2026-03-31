import { useEffect, useState } from 'react';
import { RoughNotation, type RoughNotationProps } from 'react-rough-notation';

interface Props extends Omit<RoughNotationProps, 'color'> {
  colorVar?: string;
  color?: string;
  colorAlpha?: number;
}

export function ThemedRoughNotation({ children, color, colorAlpha, colorVar, show, ...props }: Props) {
  const [resolvedColor, setResolvedColor] = useState(color ?? 'currentColor');

  useEffect(() => {
    if (!colorVar)
      return;
    const raw = getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
    if (raw) {
      const next = colorAlpha !== undefined
        ? `oklch(from ${raw} l c h / ${colorAlpha})`
        : raw;
      queueMicrotask(() => {
        setResolvedColor(next);
      });
    }
  }, [colorVar, colorAlpha]);

  return (
    <RoughNotation color={resolvedColor} show={show} {...props}>
      {children}
    </RoughNotation>
  );
}
