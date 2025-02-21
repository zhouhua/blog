import { colord, extend } from 'colord';
import labPlugin from 'colord/plugins/lab';

extend([labPlugin]);

interface GradientCollection {
  colors: [string, ...string[]];
  type?: 'linear' | 'radial';
  rotate?: number;
}

const collections: [GradientCollection, ...GradientCollection[]] = [
  { colors: ['#a18cd1', '#fbc2eb'], rotate: 0 },
  { colors: ['#fad0c4', '#ffd1ff'], rotate: 0 },
  { colors: ['#ffecd2', '#fcb69f'], rotate: 90 },
  { colors: ['#ff9a9e', '#fecfef'], rotate: 0 },
  { colors: ['#FB5B4B', '#FBC726'], rotate: 120 },
  { colors: ['#fbc2eb', '#e6dee9'], rotate: 0 },
  { colors: ['#a1c4fd', '#c2e9fb'], rotate: 120 },
  { colors: ['#84fab0', '#8fd3f4'], rotate: 120 },
  { colors: ['#e0c3fc', '#8ec5fc'], rotate: 120 },
  { colors: ['#f093fb', '#f5576c'], rotate: 120 },
  { colors: ['#fa709a', '#fee140'], rotate: 90 },
  { colors: ['#a8edea', '#fed6e3'], rotate: 0 },
  { colors: ['#16d9e3', '#30c7ec', '#46aef7'], type: 'radial' },
  { colors: ['#fdfcfb', '#e2d1c3'], rotate: 120 },
  { colors: ['#89f7fe', '#66a6ff'], rotate: 120 },
  { colors: ['#fddb92', '#d1fdff'], rotate: 0 },
  { colors: ['#9890e3', '#b1f4cf'], rotate: 0 },
  { colors: ['#96fbc4', '#f9f586'], rotate: 0 },
  { colors: ['#2af598', '#009efd'], rotate: 0 },
  { colors: ['#cd9cf2', '#f6f3ff'], rotate: 0 },
  { colors: ['#b8cbb8', '#e2c58b', '#c2ce9c', '#7edbdc'], rotate: 90 },
  { colors: ['#37ecba', '#72afd3'], rotate: 0 },
  { colors: ['#ebbba7', '#cfc7f8'], rotate: 0 },
  { colors: ['#fff1eb', '#ace0f9'], rotate: 0 },
  { colors: ['#eea2a2', '#bbc1bf', '#57c6e1', '#b49fda', '#7ac5d8'], rotate: 90 },
  { colors: ['#c471f5', '#fa71cd'], rotate: 0 },
  { colors: ['#feada6', '#f5efef'], rotate: 0 },
  { colors: ['#accbee', '#e7f0fd'], rotate: 0 },
  { colors: ['#e9defa', '#fbfcdb'], rotate: 0 },
  { colors: ['#c1dfc4', '#deecdd'], rotate: 0 },
  { colors: ['#0ba360', '#3cba92'], rotate: 0 },
  { colors: ['#00c6fb', '#005bea'], rotate: 0 },
  { colors: ['#6a85b6', '#bac8e0'], rotate: 0 },
  { colors: ['#f43b47', '#453a94'], rotate: 0 },
  { colors: ['#0250c5', '#d43f8d'], rotate: 0 },
  { colors: ['#88d3ce', '#6e45e2'], rotate: 0 },
  { colors: ['#d9afd9', '#97d9e1'], rotate: 0 },
  { colors: ['#93a5cf', '#e4efe9'], rotate: 45 },
  { colors: ['#ff758c', '#ff7eb3'], rotate: 90 },
  { colors: ['#868f96', '#596164'], rotate: 90 },
  { colors: ['#c79081', '#dfa579'], rotate: 0 },
  { colors: ['#8baaaa', '#ae8b9c'], rotate: 45 },
  { colors: ['#b721ff', '#21d4fd'], rotate: -20 },
  { colors: ['#09203f', '#537895'], rotate: 0 },
  { colors: ['#ddd6f3', '#faaca8'], rotate: -20 },
  { colors: ['#c4c5c7', '#dcdddf', '#ebebeb'], rotate: 0 },
  { colors: ['#dad4ec', '#f3e7e9'], rotate: 0 },
  { colors: ['#e8198b', '#c7eafd'], rotate: 0 },
  { colors: ['#4481eb', '#04befe'], rotate: 0 },
  { colors: ['#dfe9f3', '#ffffff'], rotate: 0 },
  { colors: ['#2CD8D5', '#C5C1FF', '#FFBAC3'], rotate: -225 },
  { colors: ['#2CD8D5', '#6B8DD6', '#8E37D7'], rotate: -225 },
  { colors: ['#5D9FFF', '#B8DCFF', '#6BBBFF'], rotate: -225 },
  { colors: ['#5271C4', '#B19FFF', '#ECA1FE'], rotate: -225 },
  { colors: ['#B6CEE8', '#F578DC'], rotate: -225 },
  { colors: ['#FFFEFF', '#D7FFFE'], rotate: -225 },
  { colors: ['#E3FDF5', '#FFE6FA'], rotate: -225 },
  { colors: ['#7DE2FC', '#B9B6E5'], rotate: -225 },
  { colors: ['#CBBACC', '#2580B3'], rotate: -225 },
  { colors: ['#B7F8DB', '#50A7C2'], rotate: -225 },
  { colors: ['#7085B6', '#87A7D9', '#DEF3F8'], rotate: -225 },
  { colors: ['#77FFD2', '#6297DB', '#1EECFF'], rotate: -225 },
  { colors: ['#AC32E4', '#7918F2', '#4801FF'], rotate: -225 },
  { colors: ['#9EFBD3', '#57E9F2', '#45D4FB'], rotate: -225 },
  { colors: ['#FF057C', '#7C64D5', '#4CC3FF'], rotate: -225 },
  { colors: ['#69EACB', '#EACCF8', '#6654F1'], rotate: -225 },
  { colors: ['#231557', '#44107A', '#FF1361', '#FFF800'], rotate: -225 },
  { colors: ['#3D4E81', '#5753C9', '#6E7FF3'], rotate: -225 },
  { colors: ['#EF6837', '#114468'], rotate: 90 },
  { colors: ['#217B9C', '#210C52'], rotate: 90 },
  { colors: ['#EC6476', '#111D68'], rotate: 90 },
  { colors: ['#7925B0', '#091142'], rotate: 90 },
  { colors: ['#C8447D', '#005F66'], rotate: 90 },
  { colors: ['#CCA819', '#0E3457'], rotate: 90 },
  { colors: ['#89338D', '#072939'], rotate: 90 },
  { colors: ['#52AB21', '#001516'], rotate: 90 },
  { colors: ['#740E00', '#051F22'], rotate: 90 },
  { colors: ['#05E4AB', '#95E061'], rotate: 120 },
  { colors: ['#4B19AC', '#A2AAF5'], rotate: 120 },
  { colors: ['#FC9B68', '#FDCD79'], rotate: 120 },
  { colors: ['#3A1272', '#FF5F3F'], rotate: 120 },
  { colors: ['#7DAFC2', '#2F4F4F'], rotate: 270 },
  { colors: ['#CC9999', '#663333'], rotate: 45 },
  { colors: ['#233A4E', '#9C6DB0'], rotate: 180 },
  { colors: ['#0D0D1B', '#F88973'], rotate: 45 },
  { colors: ['#4A3A34', '#C990AB'], rotate: 90 },
  { colors: ['#F5CB86', '#7E5936'], rotate: 60 },
  { colors: ['#333333', '#76CCB1'], rotate: 0 },
  { colors: ['#FD8785', '#8C4351'], rotate: 90 },
];

function areGradientsSimilar(a: GradientCollection, b: GradientCollection): [boolean, number] {
  if (a.colors.length === b.colors.length) {
    const forwardDeltas = a.colors.map((color, i) => colord(color).delta(b.colors[i]));
    const reverseDeltas = a.colors.map((color, i) => colord(color).delta(b.colors[b.colors.length - 1 - i]));

    const maxForwardDelta = Math.max(...forwardDeltas);
    const maxReverseDelta = Math.max(...reverseDeltas);

    const minDelta = Math.min(maxForwardDelta, maxReverseDelta);
    return [minDelta < 0.09, minDelta];
  }

  const minLength = Math.min(a.colors.length, b.colors.length);
  const deltas = a.colors.slice(0, minLength).map((color, i) =>
    colord(color).delta(b.colors[i]));
  const maxDelta = Math.max(...deltas);

  return [maxDelta < 0.09, maxDelta];
}

collections.forEach((gradient1, i) => {
  collections.slice(i + 1).forEach((gradient2, j) => {
    const [isSimilar, similarity] = areGradientsSimilar(gradient1, gradient2);
    if (isSimilar) {
      const similarityPercent = ((1 - similarity) * 100).toFixed(1);
      console.warn(
        `发现相似的渐变组合 (相似度: ${similarityPercent}%):\n`
        + `组合 ${i + 1}: ${JSON.stringify(gradient1)}\n`
        + `组合 ${j + i + 2}: ${JSON.stringify(gradient2)}`,
      );
    }
  });
});

export default collections;
