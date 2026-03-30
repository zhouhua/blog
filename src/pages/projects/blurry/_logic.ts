export type BlurryType = 'type1' | 'type2';

const TYPE2_BACKGROUND = '#ffffffff';

export function getBackgroundValueUpdate(
  currentBackground: string,
  type: BlurryType,
  primaryColor: string,
): null | string {
  const nextBackground = type === 'type2' ? TYPE2_BACKGROUND : primaryColor;

  return currentBackground === nextBackground ? null : nextBackground;
}
