import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import labPlugin from 'colord/plugins/lab';

extend([a11yPlugin, labPlugin]);

type ContrastColor = [string, string];

// 检查两个对比色组合是否相似
function areContrastPairsSimilar(pair1: ContrastColor, pair2: ContrastColor): [boolean, number, number] {
  const delta1 = colord(pair1[0]).delta(pair2[0]);
  const delta2 = colord(pair1[1]).delta(pair2[1]);
  const delta3 = colord(pair1[0]).delta(pair2[1]);
  const delta4 = colord(pair1[1]).delta(pair2[0]);

  // 正向比较
  const normalMatch = delta1 < 0.09 && delta2 < 0.09;
  // 反向比较
  const reverseMatch = delta3 < 0.09 && delta4 < 0.09;

  return [
    normalMatch || reverseMatch,
    normalMatch ? Math.max(delta1, delta2) : Math.max(delta3, delta4),
    normalMatch ? 0 : 1, // 0表示正向匹配，1表示反向匹配
  ];
}

const collections: ContrastColor[] = [
  ['#28517F', '#C7E1FA'],
  ['#012696', '#A4E2C6'],
  ['#0C567D', '#EDB79C'],
  ['#425066', '#E4C6D0'],
  ['#549688', '#F4EAC5'],
  ['#56765E', '#CBDA99'],
  ['#01847F', '#F9D2E4'],
  ['#AEFFDE', '#333333'],
  ['#465E65', '#C99E8C'],
  ['#64FE14', '#1547FD'],
  ['#FADADB', '#5A3094'],
  ['#3780FF', '#FEFAA1'],
  ['#FE7400', '#353F41'],
  ['#515B55', '#EEF7F2'],
  ['#3E3F4C', '#BE9BAA'],
  ['#E1DAD9', '#4D3A59'],
  ['#002FA7', '#C8C7C5'],
  ['#800020', '#DCD2C6'],
  ['#467897', '#E7CD79'],
  ['#DBE196', '#BA77A5'],
  ['#314A43', '#C6E6E8'],
  ['#2B333E', '#FBF2E3'],
  ['#74759B', '#E2E1E4'],
  ['#1661AB', '#F9F1DB'],
  ['#BB4B5B', '#ECE3C2'],
  ['#69A4A4', '#585753'],
  ['#9F899E', '#F2EEEB'],
  ['#063050', '#D4B49E'],
  ['#4F5397', '#DEE22E'],
  ['#F0C3A0', '#EB1E23'],
  ['#FF780F', '#E6E1C3'],
  ['#000000', '#82D2C8'],
  ['#E6CDB9', '#026441'],
  ['#1B312A', '#FA7E1F'],
  ['#6463FC', '#FDCD06'],
  ['#163273', '#F9517C'],
  ['#2B4A78', '#F5A13D'],
  ['#F1C948', '#474062'],
  ['#56C4C3', '#940F16'],
  ['#FB8416', '#403939'],
  ['#331B3F', '#ACC7B4'],
  ['#04908A', '#FBFFF1'],
  ['#213F67', '#DF5D45'],
  ['#044080', '#93B7E3'],
  ['#31654F', '#FE9525'],
  ['#127896', '#D4B49E'],
  ['#0F308B', '#F5C41C'],
  ['#155856', '#ED7232'],
  ['#02343F', '#F0EDCC'],
  ['#0A174E', '#F5D042'],
  ['#07553B', '#CED46A'],
  ['#990011', '#FCF6F5'],
  ['#364B44', '#D64161'],
  ['#CBCE91', '#76528B'],
  ['#FAEBEF', '#333D79'],
  ['#C72D1B', '#FDD20E'],
  ['#F2EDD7', '#755139'],
  ['#1A7A4C', '#101820'],
  ['#F95700', '#FFFFFF'],
  ['#FFD662', '#00539C'],
  ['#D7C49E', '#343148'],
  ['#DF6589', '#3C1053'],
  ['#FFE77A', '#2C5F2D'],
  ['#E9877E', '#9E1030'],
  ['#FCF951', '#422057'],
  ['#4B878B', '#921416'],
  ['#1C1C1B', '#CE4A7E'],
  ['#558600', '#FF9967'],
  ['#00239C', '#ED6A66'],
  ['#F96167', '#FCE77D'],
  ['#F9D142', '#292826'],
  ['#CCF381', '#4831D4'],
  ['#4A274F', '#F0A07B'],
  ['#50586C', '#DCE2F0'],
  ['#815854', '#F9EBDE'],
  ['#A4193D', '#FFDFB9'],
  ['#1AAFBC', '#80634C'],
  ['#FFDFDE', '#6A7BA2'],
  ['#3B1877', '#DA5A2A'],
  ['#5F4B8B', '#E69A8D'],
  ['#00203F', '#ADEFD1'],
  ['#606060', '#D6ED17'],
  ['#2C5F2D', '#97BC62'],
  ['#0063B2', '#9CC3D5'],
  ['#101820', '#FEE715'],
  ['#CBCE91', '#D3687F'],
  ['#B1624E', '#5CC8D7'],
  ['#7B9ACC', '#FCF6F5'],
  ['#101820', '#F2AA4C'],
  ['#A07855', '#D4B996'],
  ['#195190', '#A2A2A1'],
  ['#603F83', '#C7D3D4'],
  ['#2BAE66', '#FCF6F5'],
  ['#FAD0C9', '#6E6E6D'],
  ['#2D2926', '#ED6F63'],
  ['#DAA03D', '#616247'],
];

// 检查相似的颜色组合
collections.forEach((pair1, i) => {
  collections.slice(i + 1).forEach((pair2, j) => {
    const [isSimilar, similarity, matchType] = areContrastPairsSimilar(pair1, pair2);
    if (isSimilar) {
      const similarityPercent = ((1 - similarity) * 100).toFixed(1);
      console.warn(
        `发现相似的颜色组合 (相似度: ${similarityPercent}%):\n`
        + `组合 ${i + 1}: ${pair1[0]} - ${pair1[1]}\n`
        + `组合 ${j + i + 2}: ${pair2[0]} - ${pair2[1]}`
        + `\n匹配方式: ${matchType === 0 ? '正向匹配' : '反向匹配'}`,
      );
    }
  });
});

// 检查对比度不足的组合
collections.forEach((pair, index) => {
  const contrast = colord(pair[0]).contrast(pair[1]);
  if (contrast < 2) {
    console.warn(
      `组合 ${index + 1} 的对比度不足 (${contrast.toFixed(2)}):\n`
      + `${pair[0]} - ${pair[1]}`,
    );
  }
});

export default collections;
