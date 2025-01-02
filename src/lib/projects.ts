export interface SizeOption {
  category: string;
  height: number;
  labelKey: string;
  width: number;
}

export const sizeOptions: SizeOption[] = [
  { category: 'size.icon', height: 16, labelKey: 'size.16x16', width: 16 },
  { category: 'size.icon', height: 32, labelKey: 'size.32x32', width: 32 },
  { category: 'size.icon', height: 48, labelKey: 'size.48x48', width: 48 },
  { category: 'size.icon', height: 64, labelKey: 'size.64x64', width: 64 },
  { category: 'size.icon', height: 128, labelKey: 'size.128x128', width: 128 },
  { category: 'size.icon', height: 256, labelKey: 'size.256x256', width: 256 },
  { category: 'size.mobile', height: 1136, labelKey: 'size.640x1136', width: 640 },
  { category: 'size.mobile', height: 1334, labelKey: 'size.750x1334', width: 750 },
  { category: 'size.mobile', height: 1792, labelKey: 'size.828x1792', width: 828 },
  { category: 'size.mobile', height: 1920, labelKey: 'size.1080x1920', width: 1080 },
  { category: 'size.mobile', height: 2532, labelKey: 'size.1170x2532', width: 1170 },
  { category: 'size.mobile', height: 2778, labelKey: 'size.1284x2778', width: 1284 },
  { category: 'size.desktop', height: 768, labelKey: 'size.1366x768', width: 1366 },
  { category: 'size.desktop', height: 1080, labelKey: 'size.1920x1080', width: 1920 },
  { category: 'size.desktop', height: 1440, labelKey: 'size.2560x1440', width: 2560 },
  { category: 'size.desktop', height: 2160, labelKey: 'size.3840x2160', width: 3840 },
  { category: 'size.social', height: 800, labelKey: 'size.800x800_wechat', width: 800 },
  { category: 'size.social', height: 1080, labelKey: 'size.1080x1080_ins', width: 1080 },
  { category: 'size.social', height: 630, labelKey: 'size.1200x630_fb', width: 1200 },
  { category: 'size.social', height: 500, labelKey: 'size.1500x500_twitter', width: 1500 },
  { category: 'size.social', height: 1152, labelKey: 'size.2048x1152_youtube', width: 2048 },
  { category: 'size.ratio', height: 800, labelKey: 'size.1_1', width: 800 },
  { category: 'size.ratio', height: 768, labelKey: 'size.4_3', width: 1024 },
  { category: 'size.ratio', height: 720, labelKey: 'size.16_9', width: 1280 },
  { category: 'size.ratio', height: 1080, labelKey: 'size.21_9', width: 2560 },
];
