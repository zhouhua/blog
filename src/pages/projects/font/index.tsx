/* eslint-disable react/no-unstable-nested-components */
import type { HeadFC, PageProps } from 'gatsby';
import { useState, type FC, useCallback } from 'react';
import Layout from '@components/Layout';
import Section from '@components/Section';
import clsx from 'clsx';
import { Icon } from '@iconify/react';
import copyToClipboard from 'copy-to-clipboard';
import { Tooltip } from 'react-tooltip';
import useColorMode from '@hooks/useColorMode';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import * as styles from './index.module.css';
import ProjectHeader from '../../../sections/project/Project.Header';
import list from '../../../utils/projects';

let clock: number;

const charSets = [
  {
    category: '文字',
    sets: [
      { name: '数字', content: ['0123456789'] },
      { name: '字母', content: ['abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'] }
    ]
  },
  {
    category: '编程',
    sets: [
      { name: 'Arithmetics', content: ['++ -- /= && || ||='] },
      { name: 'Scope', content: ['-> => :: __'] },
      { name: 'Equality', content: ['== === != =/= != !=='] },
      { name: 'Comparisons', content: ['<= >= <=>'] },
      { name: 'Comment', content: ['/* */ // ///'] },
      { name: 'Escaped Chars', content: ['\\n \\\\'] },
      { name: 'Bit Operations', content: ['<< <<< <<= >> >>> >>= |= ^='] },
      { name: 'Hexadecimal Ex', content: ['0xFF 1920x1080'] },
      { name: 'HTML', content: ['</ <!-- </> --> /> www'] },
      {
        name: 'Markdown',
        content: [
          '# ## ### #### ##### ######',
          '- -- --- ---- ----- ------',
          '= == === ==== ===== ======',
          '|-|--|---|----|-----|------|'
        ]
      },
      { name: 'Java', content: ['<> <~>'] },
      { name: 'Scala', content: ['=!= =:= ::: <:<'] },
      { name: 'Clojure', content: ['#{ #( #_ #_( #? #: .- ;; ~@'] },
      { name: 'Elixir', content: ['<- -> #{} |> <>'] },
      {
        name: 'Haskell',
        content: [
          '=>> =<< >=> <=< =>= =<=',
          '<$ <$> $> <+ <+> +> <* <*> *>',
          '<> <|> .= #= +++ *** :>: :<:'
        ]
      },
      { name: 'F#', content: ['<||| <|| <| |> ||> |||>', '<- {[| |] ~- ~~ %%'] },
      { name: 'Logic', content: ['/\\ \\/ -| _|_ |- ||- |= ||='] },
      {
        name: 'Other',
        content: [
          '?? ?. .. ... =~ !~ ..< !! ..=',
          ':> :< >: <: ::> ::< >:: <::',
          '{| |} #[ ]# ::= #! #='
        ]
      }
    ]
  }
];

const featureMap = [
  {
    group: '字符变体',
    needLigatures: false,
    features: [
      { text: 'a', values: ['unset', 'cv01'] },
      { text: 'g', values: ['unset', 'cv02'] },
      { text: 'i', values: ['unset', 'cv03', 'cv04', 'cv05', 'cv06'] },
      { text: 'l', values: ['unset', 'cv07', 'cv08', 'cv09', 'cv10'] },
      { text: 'r', values: ['unset', 'ss01'] },
      { text: '0', values: ['unset', 'zero', 'cv11', 'cv12', 'cv13'] },
      { text: '4679', values: ['unset', 'onum'], long: true },
      { text: '~', values: ['unset', 'cv17'] },
      { text: '@', values: ['unset', 'ss05'] },
      { text: '$', values: ['unset', 'ss04'] },
      { text: '%', values: ['unset', 'cv18'] },
      { text: '&', values: ['unset', 'ss03'] },
      { text: '*', values: ['unset', 'cv15', 'cv16'] },
      { text: '()', values: ['unset', 'cv31'] },
      { text: '{}', values: ['unset', 'ss29'] },
      { text: '|', values: ['unset', 'ss30'] }
    ]
  },
  {
    group: '连字特性变体',
    needLigatures: true,
    features: [
      { text: '<= >=', values: ['unset', 'ss02'], long: true },
      { text: '<=', values: ['unset', 'cv19', 'cv20'] },
      { text: '>=', values: ['unset', 'cv23'] },
      { text: '=<', values: ['unset', 'cv21', 'cv22'] },
      { text: '== === != !==', values: ['unset', 'ss08'], long: true },
      { text: '/=', values: ['unset', 'cv24'] },
      { text: '>>= <<= ||= |=', values: ['unset', 'ss09'], long: true },
      { text: '.-', values: ['unset', 'cv25'] },
      { text: ':-', values: ['unset', 'cv26'] },
      { text: '.=', values: ['unset', 'cv32'] },
      { text: '[]', values: ['unset', 'cv27'] },
      { text: '{. .}', values: ['unset', 'cv28'], long: true },
      { text: '\\\\', values: ['unset', 'ss06'] },
      { text: '=~ !~', values: ['unset', 'ss07'], long: true },
      { text: 'Fl Tl fi fj fl ft', values: ['unset', 'ss10'], long: true }
    ]
  }
];

const arrows = [
  {
    title: '右箭头',
    contents: [
      '-> ->> >- >>- |- ||- ->- ->>-',
      '=> =>> >= >>= |= ||= =>= =>>=',
      '>>-> >>=> |-> |=> ~> ~~> //=>'
    ]
  },
  {
    title: '左箭头',
    contents: [
      '<- <<- -< -<< -| -|| -<- -<<-',
      '<= <<= =< =<< =| =|| =<= =<<=',
      '<-<< <=<< <-| <=| <~ <~~ <=//'
    ]
  },
  {
    title: '双向箭头',
    contents: ['<-> <<=>> |-|-| |=|=| /=/ <~>']
  }
];

const arrowConbine = [
  {
    title: '单线箭头',
    char: '-',
    variant: ['-', '<', '<<', '>', '>>', '|', '||']
  },
  {
    title: '双线箭头',
    char: '=',
    variant: ['=', '<', '<<', '>', '>>', '|', '||', '/', '//', ':', '!']
  }
];

type LigaturesType = 'normal' | 'none';
type LigaturesOptionType = { value: LigaturesType; label: string };

const ligaturesOptions: LigaturesOptionType[] = [
  { value: 'normal', label: '开启' },
  { value: 'none', label: '关闭' }
];

const Index: FC<PageProps> = () => {
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
        .join(', ')
    );
  }, []);

  const [colorMode] = useColorMode();

  const [copySuccess, setCopySuccess] = useState(false);

  const copy = useCallback(() => {
    copyToClipboard(`font-feature-settings: ${feature || 'unset'};`, {
      onCopy() {
        if (clock) {
          clearTimeout(clock);
        }
        setCopySuccess(true);
        clock = setTimeout(() => {
          setCopySuccess(false);
        }, 3000) as unknown as number;
      }
    });
  }, [feature]);
  return (
    <Layout>
      <ProjectHeader title={list[0].name} description={list[0].description} />
      <Section narrow>
        <div className="colorModeTransition mockup-window mt-20 border border-palette-gray/40 bg-palette-gray/10 text-palette-secondary">
          <div className="text colorModeTransition bg-palette-bg px-4 py-10">
            <div className={clsx(styles.box, 'mb-8')}>
              <h3 className={clsx(styles.title, 'colorModeTransition')}>控制：</h3>
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
                      <SelectItem value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {featureMap.map(
                ({ group, features, needLigatures }) =>
                  (!needLigatures || ligatures === 'normal') && (
                    <div key={group}>
                      <h4 className="colorModeTransition mb-1 mt-2 text-palette-secondary/80">
                        {group}
                      </h4>
                      <div className="flex flex-wrap">
                        {features.map(({ text, values, long }) => (
                          <Select
                            defaultValue={values[0]}
                            onValueChange={value => collect(group + text, value)}
                            key={group + text}
                          >
                            <SelectTrigger className={clsx('m-4', long ? 'w-56' : 'w-24')}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {values.map(value => (
                                <SelectItem value={value}>
                                  <span
                                    className="font-monospace"
                                    style={{
                                      fontFeatureSettings: value !== 'unset' ? `'${value}'` : 'unset'
                                    }}
                                  >
                                    {text}
                                  </span></SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
            <div className={clsx(styles.box, 'mb-8')}>
              <h3 className={clsx(styles.title, 'colorModeTransition')}>预览：</h3>
              <div>
                {charSets.map(({ category, sets }) => (
                  <div key={category}>
                    <h4 className="mb-1 mt-2">{category}</h4>
                    <div className="flex flex-wrap">
                      {sets.map(({ name, content }) => (
                        <div
                          className="mt-2 flex w-1/2 pl-4 text-sm leading-6 md:w-full"
                          key={name}
                        >
                          <div className="w-36">{name}</div>
                          <div
                            className={clsx(
                              styles.code,
                              'colorModeTransition text-palette-secondary/80'
                            )}
                            style={{
                              fontFeatureSettings: feature,
                              fontVariantLigatures: ligatures
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

            <div className={clsx(styles.box)}>
              <h3 className={clsx(styles.title, 'colorModeTransition')}>箭头：</h3>
              <div className="flex flex-wrap">
                <div className="mb-4 w-1/2 pl-4 sm:w-full">
                  {arrows.map(({ title, contents }) => (
                    <div key={title}>
                      <h4>{title}</h4>
                      {contents.map(content => (
                        <div
                          key={content}
                          className="colorModeTransition font-monospace text-sm text-palette-secondary/80"
                        >
                          <div style={{ fontVariantLigatures: 'normal' }}>{content}</div>
                          <div style={{ fontVariantLigatures: 'none' }} className=" opacity-40">
                            {content}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {arrowConbine.map(({ title, char, variant }) => (
                  <div key={title} className="w-1/4 pl-4 sm:w-1/2">
                    <h4>{title}</h4>
                    {variant.map(v => (
                      <div
                        key={`${title}${v}`}
                        className="colorModeTransition font-monospace text-sm text-palette-secondary/80"
                      >
                        <div style={{ fontVariantLigatures: 'normal' }}>
                          {[0, 1, 2]
                            .map(i => {
                              const template = [char, char, char];
                              template.splice(i, 1, v);
                              return template.join('');
                            })
                            .join('')}
                        </div>
                        <div style={{ fontVariantLigatures: 'none' }} className="opacity-40">
                          {[0, 1, 2]
                            .map(i => {
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
            font-feature-settings: <i>{feature || 'unset'}</i>;
          </pre>
          <div
            id="copy-tooltip"
            className={clsx('absolute right-4 top-2')}
            data-tooltip-content={copySuccess ? '复制成功！' : '复制代码'}
            data-tooltip-id="copy-tooltip"
          >
            <div
              className="colorModeTransition cursor-pointer rounded-md bg-palette-gray/20 px-5 py-1"
              onClick={copy}
            >
              <Icon icon="uil:copy" />
            </div>
          </div>
          {!copySuccess && (
            <Tooltip
              anchorSelect="#copy-tooltip"
              content="复制代码"
              variant={colorMode === 'dark' ? 'light' : 'dark'}
            />
          )}
          {copySuccess && (
            <Tooltip
              anchorSelect="#copy-tooltip"
              isOpen={copySuccess}
              content="复制成功！"
              variant={colorMode === 'dark' ? 'info' : 'success'}
            />
          )}
        </div>
      </Section>
    </Layout>
  );
};

export default Index;

export const Head: HeadFC = () => <title>周骅的博客</title>;
