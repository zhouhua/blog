/* eslint-disable react/no-unstable-nested-components */
import type { HeadFC, PageProps } from 'gatsby';
import { useState, type FC, useEffect, useCallback } from 'react';
import Layout from '@components/Layout';
import Section from '@components/Section';
import clsx from 'clsx';
import type { OptionProps, SingleValueProps } from 'react-select';
import Select, { components } from 'react-select';
import { Icon } from '@iconify/react';
import copyToClipboard from 'copy-to-clipboard';
import { Tooltip } from 'react-tooltip';
import useColorMode from '@hooks/useColorMode';
import * as styles from './index.module.css';

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
      { text: 'a', values: ['', 'cv01'] },
      { text: 'g', values: ['', 'cv02'] },
      { text: 'i', values: ['', 'cv03', 'cv04', 'cv05', 'cv06'] },
      { text: 'l', values: ['', 'cv07', 'cv08', 'cv09', 'cv10'] },
      { text: 'r', values: ['', 'ss01'] },
      { text: '0', values: ['', 'zero', 'cv11', 'cv12', 'cv13'] },
      { text: '4679', values: ['', 'onum'], long: true },
      { text: '~', values: ['', 'cv17'] },
      { text: '@', values: ['', 'ss05'] },
      { text: '$', values: ['', 'ss04'] },
      { text: '%', values: ['', 'cv18'] },
      { text: '&', values: ['', 'ss03'] },
      { text: '*', values: ['', 'cv15', 'cv16'] },
      { text: '()', values: ['', 'cv31'] },
      { text: '{}', values: ['', 'ss29'] },
      { text: '|', values: ['', 'ss30'] }
    ]
  },
  {
    group: '连字特性变体',
    needLigatures: true,
    features: [
      { text: '<= >=', values: ['', 'ss02'], long: true },
      { text: '<=', values: ['', 'cv19', 'cv20'] },
      { text: '>=', values: ['', 'cv23'] },
      { text: '=<', values: ['', 'cv21', 'cv22'] },
      { text: '== === != !==', values: ['', 'ss08'], long: true },
      { text: '/=', values: ['', 'cv24'] },
      { text: '>>= <<= ||= |=', values: ['', 'ss09'], long: true },
      { text: '.-', values: ['', 'cv25'] },
      { text: ':-', values: ['', 'cv26'] },
      { text: '.=', values: ['', 'cv32'] },
      { text: '[]', values: ['', 'cv27'] },
      { text: '{. .}', values: ['', 'cv28'], long: true },
      { text: '\\\\', values: ['', 'ss06'] },
      { text: '=~ !~', values: ['', 'ss07'], long: true },
      { text: 'Fl Tl fi fj fl ft', values: ['', 'ss10'], long: true }
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

type LigaturesOptionType = { value: 'normal' | 'none'; label: string };
type CommonOptionType = { value: string; label: string };

const ligaturesOptions: LigaturesOptionType[] = [
  { value: 'normal', label: '开启' },
  { value: 'none', label: '关闭' }
];

const Option = (props: OptionProps<CommonOptionType>) => (
  // eslint-disable-next-line react/destructuring-assignment
  <div className="font-monospace" style={{ fontFeatureSettings: `'${props.data.value}'` }}>
    <components.Option {...props} />
  </div>
);
const SingleValue = ({ data, children, ...rest }: SingleValueProps<CommonOptionType>) => (
  <components.SingleValue {...rest} data={data}>
    <span
      className="font-monospace"
      style={{ fontFeatureSettings: data.value ? `'${data.value}'` : 'unset' }}
    >
      {children}
    </span>
  </components.SingleValue>
);

const Index: FC<PageProps> = () => {
  const featureValueMap: Record<string, string> = {};
  const [feature, setFeature] = useState('');
  const [ligatures, setLigatures] = useState<LigaturesOptionType>(ligaturesOptions[0]);
  useEffect(() => {
    console.log(ligatures.value);
  }, [ligatures.value]);
  const collect = useCallback((key: string, value: string) => {
    featureValueMap[key] = value;
    setFeature(
      Object.values(featureValueMap)
        .filter(Boolean)
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
      <Section narrow>
        <div className="mockup-window mt-20 border border-palette-gray/40 bg-palette-gray/10 text-palette-secondary">
          <div className="text bg-palette-bg px-4 py-10">
            <div className={clsx(styles.box, 'mb-8')}>
              <h3 className={clsx(styles.title)}>控制：</h3>
              <div className="flex cursor-pointer justify-between">
                <span className="mb-1 mt-2 text-palette-secondary/80">连字特性</span>
                <Select<LigaturesOptionType>
                  value={ligatures}
                  onChange={option => option && setLigatures({ ...option })}
                  options={ligaturesOptions}
                  className="text-palette-secondary dark:text-palette-card"
                />
              </div>

              {featureMap.map(
                ({ group, features, needLigatures }) =>
                  (!needLigatures || ligatures.value === 'normal') && (
                    <div key={group}>
                      <h4 className="mb-1 mt-2 text-palette-secondary/80">{group}</h4>
                      <div className="flex flex-wrap">
                        {features.map(({ text, values, long }) => (
                          <Select<CommonOptionType>
                            className={clsx(
                              'm-4',
                              long ? 'w-56' : 'w-24',
                              'text-palette-secondary dark:text-palette-card'
                            )}
                            defaultValue={{ value: values[0], label: text }}
                            onChange={option => collect(group + text, option?.value || '')}
                            options={values.map(value => {
                              return { value, label: text };
                            })}
                            components={{ Option, SingleValue }}
                            key={group + text}
                          />
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
            <div className={clsx(styles.box, 'mb-8')}>
              <h3 className={clsx(styles.title)}>预览：</h3>
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
                            className={clsx(styles.code, 'text-palette-secondary/80')}
                            style={{
                              fontFeatureSettings: feature,
                              fontVariantLigatures: ligatures.value
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
              <h3 className={clsx(styles.title)}>箭头：</h3>
              <div className="flex flex-wrap">
                <div className="mb-4 w-1/2 pl-4 sm:w-full">
                  {arrows.map(({ title, contents }) => (
                    <div key={title}>
                      <h4>{title}</h4>
                      {contents.map(content => (
                        <div
                          key={content}
                          className="font-monospace text-sm text-palette-secondary/80"
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
                        className="font-monospace text-sm text-palette-secondary/80"
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
        <div className="mockup-code relative mt-10 overflow-visible border border-palette-gray text-palette-secondary">
          <pre data-prefix="1">
            font-feature-settings: <i>{feature || 'unset'}</i>;
          </pre>
          <div
            id="copy-tooltip"
            className={clsx('absolute right-4 top-2')}
            data-tooltip-content={copySuccess ? '复制成功！' : '复制代码'}
            data-tooltip-id="copy-tooltip"
          >
            <div className="cursor-pointer rounded-md bg-palette-gray/20 px-5 py-1" onClick={copy}>
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
