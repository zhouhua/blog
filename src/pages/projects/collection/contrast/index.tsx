/* eslint-disable style/max-len */
import { cn } from '@lib/utils';
import { HelpDrawer } from '@react/components/HelpDrawer';
import { LanguageSwitch } from '@react/components/LanguageSwitch';
import { Button } from '@react/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@react/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@react/ui/popover';
import { Toaster } from '@react/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@react/ui/tabs';
import { Chrome } from '@uiw/react-color';
import { random } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';
import List from '../List';
import collections from './collection';

function Contrast() {
  const { t } = useTranslation();
  const [pickedIndex, setPickedIndex] = useState(() => random(0, collections.length - 1));
  const [background, setBackground] = useState(collections[pickedIndex]![0]);
  const [foreground, setForeground] = useState(collections[pickedIndex]![1]);

  const handleSwapColors = () => {
    const temp = background;
    setBackground(foreground);
    setForeground(temp);
  };

  const handleCopy = () => {
    const css = `color: ${foreground};\nbackground-color: ${background};`;
    navigator.clipboard.writeText(css);
    toast.success(t('common.copySuccess'));
  };

  return (
    <div className="w-screen h-screen transition-colors duration-300" style={{ backgroundColor: foreground }}>
      <div className="fixed left-0 w-[60vw] top-0 bottom-10 transition-colors overflow-y-auto text-xl font-serif leading-8 duration-300">
        <article className="relative h-full">
          {[
            {
              background,
              className: 'absolute inset-0 px-16 py-32',
              clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
              color: foreground,
            },
            {
              background: foreground,
              className: 'px-16 py-32',
              clipPath: undefined,
              color: background,
            },
          ].map((style, index) => (
            <div
              key={index}
              className={cn('transition-colors duration-300', style.className)}
              style={{
                backgroundColor: style.background,
                clipPath: style.clipPath,
                color: style.color,
              }}
            >
              <h3 className="text-4xl font-bold mb-10">滕王阁序</h3>
              <p className="mb-6">
                豫章故郡，洪都新府。星分翼轸，地接衡庐。襟三江而带五湖，控蛮荆而引瓯越。物华天宝，龙光射牛斗之墟；人杰地灵，徐孺下陈蕃之榻。雄州雾列，俊彩星驰。台隍枕夷夏之交，宾主尽东南之美。都督阎公之雅望，綮戟遥临；宇文新州之懿范，襜帷暂驻。十旬休假，胜友如云。千里逢迎，高朋满座。腾蛟起凤，孟学士之词宗；紫电青霜，王将军之武库。家君作宰，路出名区。童子何知？躬逢胜饯。
              </p>
              <p className="mb-6">
                时维九月，序属三秋。潦水尽而寒潭清，烟光凝而暮山紫。俨骖騑于上路，访风景于崇阿。临帝子之长洲，得仙人之旧馆。层峦耸翠，上出重霄；飞阁流丹，下临无地。鹤汀凫渚，穷岛屿之萦回；桂殿兰宫，即冈峦之体势。
              </p>
              <p className="mb-6">
                披绣闼，俯雕甍。山原旷其盈视，川泽纡其骇瞩。闾阎扑地，钟鸣鼎食之家；舸舰迷津，青雀黄龙之舳。虹销雨霁，彩彻区明。落霞与孤鹜齐飞，秋水共长天一色。渔舟唱晚，响穷彭蠡之滨，雁阵惊寒，声断衡阳之浦。
              </p>
              <p className="mb-6">
                遥吟甫畅，逸兴遄飞。爽籁发而清风生，纤歌凝而白云遏。睢园绿竹，气凌彭泽之樽；邺水朱华，光照临川之笔。四美具，二难并。穷睇眄于中天，极娱游于暇日。天高地迥，觉宇宙之无穷；兴尽悲来，识盈虚之有数。望长安于日下，目吴会于云间。地势极而南溟深，天柱高而北辰远。关山难越，谁悲失路之人；萍水相逢，尽是他乡之客。怀帝阍而不见，奉宣室以何年？
              </p>
              <p className="mb-6">
                嗟乎！时运不齐，命途多舛。冯唐易老，李广难封。屈贾谊于长沙，非无圣主；窜梁鸿于海曲，岂乏明时？所赖君子安贫，达人知命。老当益壮，宁移白首之心；穷且 益坚，不坠青云之志。酌贪泉而觉爽，处涸辙以犹欢。北海虽赊，夫摇可接；东隅已逝，桑榆非晚。孟尝高洁，空余报国之情；阮籍猖狂，岂效穷途之哭？
              </p>
              <p className="mb-6">
                勃，三尺微命，一介书生。无路请缨，等终军之弱冠；有怀投笔，慕宗悫之长风。舍簪笏于百龄，奉晨昏于万里。非谢家之宝树，接孟氏之芳邻。他日趋庭，叨陪鲤对；今晨捧袂，喜托龙门。杨意不逢，抚凌云而自惜；钟期既遇，奏流水以何惭？
              </p>
              <p className="mb-6">
                鸣呼！胜地不常，盛筵难再。兰亭已矣，梓泽邱墟。临别赠言，幸承恩于伟饯；登高作赋，是所望于群公！敢竭鄙诚，恭疏短引。一言均赋，四韵俱成。请洒潘江，各倾陆海云尔。
              </p>
              <p className="text-center">
                滕王高阁临江渚，佩玉鸣鸾罢歌舞。
                <br />
                画栋朝飞南浦云，珠廉暮卷西山雨。
                <br />
                闲云潭影日悠悠，物换星移几度秋。
                <br />
                阁中帝子今何在？槛外长江空自流！
              </p>
            </div>
          ))}
        </article>
      </div>
      <Toaster position="bottom-right" />
      <div className="fixed top-9 right-9 flex gap-2 z-50">
        <HelpDrawer namespace="collection.contrast" />
        <LanguageSwitch />
      </div>
      <div className="fixed right-6 top-6 bottom-16 w-[435px] flex flex-col gap-4 flex-wrap-reverse">
        <List
          className="w-full bg-white"
          title={t('collection.contrast.title') + t('common.totalCount', { count: collections.length })}
          data={collections}
          renderItem={(item, index) => (
            <div
              key={index}
              className={cn(
                'size-8 shadow-md rounded-full cursor-pointer ring-offset-2 transition-all duration-200 flex gap-0.5 items-center justify-center bg-gray-100 border-4 border-gray-100 overflow-hidden',
                {
                  'hover:ring-white/50 hover:ring-2': index !== pickedIndex,
                  'ring-2': index === pickedIndex,
                },
              )}
              onClick={() => {
                setPickedIndex(index);
                setBackground(item[0]);
                setForeground(item[1]);
              }}
            >
              {item.map((color: string) => (
                <div
                  key={color}
                  className="flex-1 h-full w-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        />
        <Card className="bg-white w-full">
          <CardHeader>
            <CardTitle className="text-sm">{t('collection.contrast.colorSettings')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div
              className="flex items-center justify-center self-center group cursor-pointer rounded-md overflow-hidden relative"
            // style={{ backgroundImage: `linear-gradient(to right, ${background} 0%, ${background} 40%, ${foreground} 60%, ${foreground} 100%)` }}
            >
              <div className="absolute left-0 top-0 w-full h-full" style={{ backgroundImage: `linear-gradient(to right, ${background} 0%, ${background} 50%, ${foreground} 50%, ${foreground} 100%)` }} />
              <div className="absolute left-0 top-0 w-full h-full backdrop-blur-2xl" />
              <Popover>
                <PopoverTrigger>
                  <div
                    className="w-48 h-32 transition-opacity duration-300 flex items-center justify-center relative z-10"
                    style={{ color: foreground }}
                  >
                    {background}
                  </div>
                </PopoverTrigger>
                <PopoverContent>
                  <Chrome color={background} onChange={e => setBackground(e.hex)} />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger>
                  <div
                    className="w-48 h-32 transition-opacity duration-300 flex items-center justify-center relative z-10"
                    style={{ color: background }}
                  >
                    {foreground}
                  </div>
                </PopoverTrigger>
                <PopoverContent>
                  <Chrome color={foreground} onChange={e => setForeground(e.hex)} />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleSwapColors}>
              {t('collection.contrast.swapColors')}
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-white w-full pt-6">
          <CardContent>
            <Tabs defaultValue="css">
              <TabsList>
                <TabsTrigger value="css">{t('collection.contrast.exportCSS')}</TabsTrigger>
              </TabsList>
              <TabsContent value="css">
                <div className="flex flex-col gap-2 mt-4">
                  <SyntaxHighlighter language="css" style={oneLight} className="text-xs font-monospace max-h-32 overflow-auto max-w-[385px]">
                    {`color: ${foreground};\nbackground-color: ${background};`}
                  </SyntaxHighlighter>
                  <Button
                    className="mt-2"
                    onClick={handleCopy}
                  >
                    {t('collection.contrast.copyToClipboard')}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Contrast;
