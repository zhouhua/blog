import type { Exif } from '@types';
import type { FC, ReactNode } from 'react';
import { cn } from '@lib/utils';
import dayjs from 'dayjs';

function formatShutter(shutter: number) {
  if (shutter >= 1) {
    return Math.round(shutter);
  }
  return `1/${Math.round(1 / shutter)}`;
}

const str = ['⅓', '⅔'];

function formatExposureBias(exposureBias: number) {
  if (!exposureBias) {
    return 0;
  }
  const sign = exposureBias < 0 ? '-' : '+';
  const facPart = str[Math.round((exposureBias % 1) * 3) - 1];
  if (!facPart) {
    return sign + Math.abs(exposureBias);
  }
  const intPart = Math.floor(Math.abs(exposureBias));
  return sign + (intPart || '') + facPart;
}

const brandMap: Record<string, { icon: ReactNode; text: string }> = {
  'HUAWEI': { icon: <span className="size-[72px] iconify simple-icons--huawei text-[#D00328]" />, text: '华为' },
  'NIKON CORPORATION': { icon: <span className="size-[72px] iconify simple-icons--nikon text-[#F7D71F]" />, text: '' },
  'SONY': { icon: <span className="size-[72px] iconify simple-icons--sony" />, text: 'SONY' },
};

const modelMap: Record<string, string> = {
  'CLT-AL00': 'P20 Pro',
  'ILCE-7C': 'ɑ7c',
  'NOP-AN00': 'Mate 40 Pro+',
};

const Meta: FC<{ exif?: Exif; useInLightbox?: boolean }> = ({
  exif,
  useInLightbox = false,
}) => {
  if (!exif) {
    return null;
  }
  const {
    DateTimeOriginal,
    ExposureBiasValue,
    ExposureTime,
    FNumber,
    FocalLength,
    FocalLengthIn35mmFormat,
    ISO,
  } = exif?.exif || {};
  const { Make, Model } = exif?.image || {};
  const isFullFrame = FocalLength === FocalLengthIn35mmFormat;
  return (
    <div
      className={cn('bg-palette-card text-palette-secondary absolute left-0 h-[72px]  w-full', {
        'bottom-0': !useInLightbox,
        'bottom-14': useInLightbox,
      })}
    >
      <div
        className={cn(
          'mx-auto flex max-w-[680px] items-center justify-between',
          'border-palette-bgAlt h-[72px] border-solid',
          { 'border-b': useInLightbox },
        )}
      >
        <div className="p-4 sm:hidden">
          <h3 className="leading-6">
            {[brandMap[Make! as string]!.text, modelMap[Model! as string] || Model].join(' ')}
          </h3>
          <div className="text-palette-gray text-xs">
            {dayjs(DateTimeOriginal as number).format('YYYY-MM-DD')}
          </div>
        </div>
        <div className="flex">
          <div className="h-[72px] px-4">
            {brandMap[Make! as string]!.icon}
          </div>
          <div className="border-l-palette-bgAlt my-3 h-12 border-l px-4">
            <div className="flex flex-col text-sm">
              <div className="flex h-6 items-center leading-6">
                <span className="mr-4">
                  {FocalLengthIn35mmFormat as string}
                  mm
                  {!isFullFrame && '(等效)'}
                </span>
                <span className={cn({ 'mr-4': isFullFrame })}>
                  {formatShutter(ExposureTime as number || 1)}
                  s
                </span>
                {isFullFrame && (
                  <span className="flex items-center">
                    <span className="iconify iconamoon--sign-f-fill size-5" />
                    <span>{(+FNumber!)?.toFixed(1)}</span>
                  </span>
                )}
              </div>
              <div className="flex h-6 items-center leading-6">
                {!isFullFrame && (
                  <span className="mr-4 flex items-center">
                    <span className="size-5 iconify iconamoon--sign-f-fill" />
                    <span>{(+FNumber!)?.toFixed(1)}</span>
                  </span>
                )}
                <span className="mr-4 flex items-center">
                  <span className="mr-1 iconify carbon--iso-outline size-5" />
                  <span>{ISO as string}</span>
                </span>
                <span className="flex items-center">
                  <span className="mr-1 iconify material-symbols--exposure size-5" />
                  <span>{formatExposureBias(ExposureBiasValue! as number)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Meta;
