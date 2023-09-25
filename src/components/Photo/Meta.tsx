import type { FC } from 'react';
import { Icon } from '@iconify-icon/react';
import dayjs from 'dayjs';
import clsx from 'clsx';

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

const brandMap: Record<string, { icon: string; text: string; color?: string }> = {
  'SONY': { icon: 'simple-icons:sony', text: 'SONY' },
  'NIKON CORPORATION': { icon: 'simple-icons:nikon', text: '', color: '#F7D71F' },
  'HUAWEI': { icon: 'simple-icons:huawei', text: '华为', color: '#D00328' }
};

const modelMap: Record<string, string> = {
  'CLT-AL00': 'P20 Pro',
  'NOP-AN00': 'Mate 40 Pro+',
  'ILCE-7C': 'ɑ7c'
};

const Meta: FC<{ exif?: Queries.ImageSharpFieldsExif; useInLightbox?: boolean }> = ({
  exif,
  useInLightbox = false
}) => {
  if (!exif) {
    return null;
  }
  const {
    FNumber,
    FocalLength,
    ExposureTime,
    DateTimeOriginal,
    ISO,
    ExposureBiasValue,
    FocalLengthIn35mmFormat
  } = exif.raw?.exif || {};
  const { Model, Make } = exif.raw?.image || {};
  const isFullFrame = FocalLength === FocalLengthIn35mmFormat;
  return (
    <div
      className={clsx('bg-palette-card text-palette-secondary absolute left-0 h-[72px]  w-full', {
        'bottom-14': useInLightbox,
        'bottom-0': !useInLightbox
      })}
    >
      <div
        className={clsx(
          'mx-auto flex max-w-[680px] items-center justify-between',
          'border-palette-bgAlt h-[72px] border-solid',
          { 'border-b': useInLightbox }
        )}
      >
        <div className="p-4 sm:hidden">
          <h3 className="leading-6">
            {[brandMap[Make!].text, modelMap[Model!] || Model].join(' ')}
          </h3>
          <div className="text-palette-gray text-xs">
            {dayjs(DateTimeOriginal).format('YYYY-MM-DD')}
          </div>
        </div>
        <div className="flex">
          <div className="h-[72px] px-4">
            <Icon
              width={72}
              height={72}
              icon={brandMap[Make!].icon}
              style={{
                color: brandMap[Make!].color || 'inherit'
              }}
            />
          </div>
          <div className="border-l-palette-bgAlt my-3 h-12 border-l px-4">
            <div className="flex flex-col text-sm">
              <div className="flex h-6 items-center leading-6">
                <span className="mr-4">
                  {FocalLengthIn35mmFormat}mm{!isFullFrame && '(等效)'}
                </span>
                <span className={clsx({ 'mr-4': isFullFrame })}>
                  {formatShutter(ExposureTime || 1)}s
                </span>
                {isFullFrame && (
                  <span className="flex items-center">
                    <Icon icon="iconamoon:sign-f-fill" width={20} />
                    <span>{(+FNumber!)?.toFixed(1)}</span>
                  </span>
                )}
              </div>
              <div className="flex h-6 items-center leading-6">
                {!isFullFrame && (
                  <span className="mr-4 flex items-center">
                    <Icon icon="iconamoon:sign-f-fill" width={20} />
                    <span>{(+FNumber!)?.toFixed(1)}</span>
                  </span>
                )}
                <span className="mr-4 flex items-center">
                  <Icon icon="carbon:iso-outline" width={20} className="mr-1" />
                  <span>{ISO}</span>
                </span>
                <span className="flex items-center">
                  <Icon icon="material-symbols:exposure" width={20} className="mr-1" />
                  <span>{formatExposureBias(ExposureBiasValue!)}</span>
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
