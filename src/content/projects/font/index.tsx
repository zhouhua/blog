import { cn } from '@lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@react/ui/select';
import { Toaster } from '@react/ui/sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@react/ui/tooltip';
import copyToClipboard from 'copy-to-clipboard';
import { type FC, useCallback, useState } from 'react';
import { toast } from 'sonner';
import styles from './index.module.css';

const charSets = [
  {
    category: '文字',
    sets: [
      { content: ['0123456789'], name: '数字' },
      { content: ['abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'], name: '字母' },
    ],
  },
  {
    category: '编程',
    sets: [
      { content: ['++ -- /= && || ||='], name: 'Arithmetics' },
      { content: ['-> => :: __'], name: 'Scope' },
      { content: ['== === != =/= != !=='], name: 'Equality' },
      { content: ['<= >= <=>'], name: 'Comparisons' },
      { content: ['/* */ // ///'], name: 'Comment' },
      { content: ['\\n \\\\'], name: 'Escaped Chars' },
      { content: ['<< <<< <<= >> >>> >>= |= ^='], name: 'Bit Operations' },
      { content: ['0xFF 1920x1080'], name: 'Hexadecimal Ex' },
      { content: ['</ <!-- </> --> /> www'], name: 'HTML' },
      {
        content: [
          '# ## ### #### ##### ######',
          '- -- --- ---- ----- ------',
          '= == === ==== ===== ======',
          '|-|--|---|----|-----|------|',
        ],
        name: 'Markdown',
      },
      { content: ['<> <~>'], name: 'Java' },
      { content: ['=!= =:= ::: <:<'], name: 'Scala' },
      { content: ['#{ #( #_ #_( #? #: .- ;; ~@'], name: 'Clojure' },
      { content: ['<- -> #{} |> <>'], name: 'Elixir' },
      {
        content: [
          '=>> =<< >=> <=< =>= =<=',
          '<$ <$> $> <+ <+> +> <* <*> *>',
          '<> <|> .= #= +++ *** :>: :<:',
        ],
        name: 'Haskell',
      },
      { content: ['<||| <|| <| |> ||> |||>', '<- {[| |] ~- ~~ %%'], name: 'F#' },
      { content: ['/\\ \\/ -| _|_ |- ||- |= ||='], name: 'Logic' },
      {
        content: [
          '?? ?. .. ... =~ !~ ..< !! ..=',
          ':> :< >: <: ::> ::< >:: <::',
          '{| |} #[ ]# ::= #! #=',
        ],
        name: 'Other',
      },
    ],
  },
];

const featureMap = [
  {
    features: [
      { text: 'a', values: ['unset', 'cv01'] },
      { text: 'g', values: ['unset', 'cv02'] },
      { text: 'i', values: ['unset', 'cv03', 'cv04', 'cv05', 'cv06'] },
      { text: 'l', values: ['unset', 'cv07', 'cv08', 'cv09', 'cv10'] },
      { text: 'r', values: ['unset', 'ss01'] },
      { text: '0', values: ['unset', 'zero', 'cv11', 'cv12', 'cv13'] },
      { long: true, text: '4679', values: ['unset', 'onum'] },
      { text: '~', values: ['unset', 'cv17'] },
      { text: '@', values: ['unset', 'ss05'] },
      { text: '$', values: ['unset', 'ss04'] },
      { text: '%', values: ['unset', 'cv18'] },
      { text: '&', values: ['unset', 'ss03'] },
      { text: '*', values: ['unset', 'cv15', 'cv16'] },
      { text: '()', values: ['unset', 'cv31'] },
      { text: '{}', values: ['unset', 'ss29'] },
      { text: '|', values: ['unset', 'ss30'] },
    ],
    group: '字符变体',
    needLigatures: false,
  },
  {
    features: [
      { long: true, text: '<= >=', values: ['unset', 'ss02'] },
      { text: '<=', values: ['unset', 'cv19', 'cv20'] },
      { text: '>=', values: ['unset', 'cv23'] },
      { text: '=<', values: ['unset', 'cv21', 'cv22'] },
      { long: true, text: '== === != !==', values: ['unset', 'ss08'] },
      { text: '/=', values: ['unset', 'cv24'] },
      { long: true, text: '>>= <<= ||= |=', values: ['unset', 'ss09'] },
      { text: '.-', values: ['unset', 'cv25'] },
      { text: ':-', values: ['unset', 'cv26'] },
      { text: '.=', values: ['unset', 'cv32'] },
      { text: '[]', values: ['unset', 'cv27'] },
      { long: true, text: '{. .}', values: ['unset', 'cv28'] },
      { text: '\\\\', values: ['unset', 'ss06'] },
      { long: true, text: '=~ !~', values: ['unset', 'ss07'] },
      { long: true, text: 'Fl Tl fi fj fl ft', values: ['unset', 'ss10'] },
    ],
    group: '连字特性变体',
    needLigatures: true,
  },
];

const arrows = [
  {
    contents: [
      '-> ->> >- >>- |- ||- ->- ->>-',
      '=> =>> >= >>= |= ||= =>= =>>=',
      '>>-> >>=> |-> |=> ~> ~~> //=>',
    ],
    title: '右箭头',
  },
  {
    contents: [
      '<- <<- -< -<< -| -|| -<- -<<-',
      '<= <<= =< =<< =| =|| =<= =<<=',
      '<-<< <=<< <-| <=| <~ <~~ <=//',
    ],
    title: '左箭头',
  },
  {
    contents: ['<-> <<=>> |-|-| |=|=| /=/ <~>'],
    title: '双向箭头',
  },
];

const arrowConbine = [
  {
    char: '-',
    title: '单线箭头',
    variant: ['-', '<', '<<', '>', '>>', '|', '||'],
  },
  {
    char: '=',
    title: '双线箭头',
    variant: ['=', '<', '<<', '>', '>>', '|', '||', '/', '//', ':', '!'],
  },
];

type LigaturesType = 'none' | 'normal';
interface LigaturesOptionType { value: LigaturesType; label: string }

const ligaturesOptions: LigaturesOptionType[] = [
  { label: '开启', value: 'normal' },
  { label: '关闭', value: 'none' },
];

const Font: FC = () => {
  const featureValueMap: Record<string, string> = {};
  const [feature, setFeature] = useState('');
  const [ligatures, setLigatures] = useState<LigaturesType>('normal');
  const collect = useCallback((key: string, value: string) => {
    featureValueMap[key] = value;
    setFeature(
      Object.values(featureValueMap)
        .filter(Boolean)
        .filter(v => v !== 'unset')
        .map(v => `'${v}'`)
        .join(', '),
    );
  }, []);

  const copy = useCallback(() => {
    copyToClipboard(`font-feature-settings: ${feature || 'unset'};`, {
      onCopy() {
        toast('复制成功!');
      },
    });
  }, [feature]);
  return (
    <>
      <div className="colorModeTransition mockup-window mt-20 border border-palette-gray/40 bg-palette-gray/10 text-palette-secondary">
        <div className="text colorModeTransition bg-palette-bg px-4 py-10">
          <div className={cn(styles.box, 'mb-8')}>
            <h3 className={cn(styles.title, 'colorModeTransition')}>控制：</h3>
            <div className="flex cursor-pointer justify-between">
              <span className="colorModeTransition mb-1 mt-2 text-palette-secondary/80">
                连字特性
              </span>
              <Select value={ligatures} onValueChange={value => setLigatures(value as LigaturesType)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ligaturesOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {featureMap.map(
              ({ features, group, needLigatures }) =>
                (!needLigatures || ligatures === 'normal') && (
                  <div key={group}>
                    <h4 className="colorModeTransition mb-1 mt-2 text-palette-secondary/80">
                      {group}
                    </h4>
                    <div className="flex flex-wrap">
                      {features.map(({ long, text, values }) => (
                        <Select
                          key={group + text}
                          defaultValue={values[0]!}
                          onValueChange={value => collect(group + text, value)}
                        >
                          <SelectTrigger className={cn('m-4', long ? 'w-56' : 'w-24')}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {values.map(value => (
                              <SelectItem key={value} value={value}>
                                <span
                                  className="font-monospace"
                                  style={{
                                    fontFeatureSettings: value !== 'unset' ? `'${value}'` : 'unset',
                                  }}
                                >
                                  {text}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ))}
                    </div>
                  </div>
                ),
            )}
          </div>
          <div className={cn(styles.box, 'mb-8')}>
            <h3 className={cn(styles.title, 'colorModeTransition')}>预览：</h3>
            <div>
              {charSets.map(({ category, sets }) => (
                <div key={category}>
                  <h4 className="mb-1 mt-2">{category}</h4>
                  <div className="flex flex-wrap">
                    {sets.map(({ content, name }) => (
                      <div
                        key={name}
                        className="mt-2 flex w-1/2 pl-4 text-sm leading-6 md:w-full"
                      >
                        <div className="w-36">{name}</div>
                        <div
                          className={cn(
                            styles.code,
                            'colorModeTransition text-palette-secondary/80',
                          )}
                          style={{
                            fontFeatureSettings: feature,
                            fontVariantLigatures: ligatures,
                          }}
                        >
                          {content.map(str => (
                            <div key={str}>{str}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(styles.box)}>
            <h3 className={cn(styles.title, 'colorModeTransition')}>箭头：</h3>
            <div className="flex flex-wrap">
              <div className="mb-4 w-1/2 pl-4 sm:w-full">
                {arrows.map(({ contents, title }) => (
                  <div key={title}>
                    <h4>{title}</h4>
                    {contents.map(content => (
                      <div
                        key={content}
                        className="colorModeTransition font-monospace text-sm text-palette-secondary/80"
                      >
                        <div style={{ fontVariantLigatures: 'normal' }}>{content}</div>
                        <div className=" opacity-40" style={{ fontVariantLigatures: 'none' }}>
                          {content}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {arrowConbine.map(({ char, title, variant }) => (
                <div key={title} className="w-1/4 pl-4 sm:w-1/2">
                  <h4>{title}</h4>
                  {variant.map(v => (
                    <div
                      key={`${title}${v}`}
                      className="colorModeTransition font-monospace text-sm text-palette-secondary/80"
                    >
                      <div style={{ fontVariantLigatures: 'normal' }}>
                        {[0, 1, 2]
                          .map((i) => {
                            const template = [char, char, char];
                            template.splice(i, 1, v);
                            return template.join('');
                          })
                          .join('')}
                      </div>
                      <div className="opacity-40" style={{ fontVariantLigatures: 'none' }}>
                        {[0, 1, 2]
                          .map((i) => {
                            const template = [char, char, char];
                            template.splice(i, 1, v);
                            return template.join('');
                          })
                          .join('')}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="colorModeTransition mockup-code relative mt-10 overflow-visible border border-palette-gray/40 bg-palette-gray/10 text-palette-secondary">
        <pre data-prefix="1">
          font-feature-settings:
          {' '}
          <i>{feature || 'unset'}</i>
          ;
        </pre>
        <div className={cn('absolute right-4 top-2')}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className="colorModeTransition cursor-pointer rounded-md bg-palette-gray/20 px-5 py-1"
                  onClick={copy}
                >
                  <span className="uil--copy iconify" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div>复制代码</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default Font;
