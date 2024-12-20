import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';

extend([mixPlugin]);

export const groups: Record<string, string> = {
  '3d': '3D',
  'brick': '砖块',
  'grid': '网格',
  'shape': '几何',
  'wave': '波形',
  'zigzag': '锯齿',
};

export interface IPattern {
  type: 'css' | 'svg';
  rotate?: number;
  zoom?: number;
  colors: string[];
  translate?: [number, number];
  stroke?: number;
  render: (params: Omit<IPattern, 'group' | 'render' | 'type'>) => string;
  disabled?: (keyof IPattern)[];
  group: keyof typeof groups;
}

const defaultFront = '#444cf7';
const defaultBack = '#e5e5f7';

const collections: [IPattern, ...IPattern[]] = [
  {
    colors: [defaultFront, defaultBack],
    group: 'brick',
    render: ({ colors, rotate = 0, stroke = 1, translate = [0, 0], zoom = 1 }) => {
      const [front = defaultFront, back = defaultBack] = colors || [];
      return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(${translate[0]} ${translate[1]}) rotate(${rotate}) scale(${zoom})"><path data-color="outline" fill="none" stroke="${front}" stroke-width="${stroke}" d="M0 0h100v50H0zM-50 50h100v50h-100zM50 50h100v50h-100z"></path></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="${back}"/><rect fill="url(#p)" width="100%" height="100%"></rect></svg>`;
    },
    type: 'svg',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: ['stroke'],
    group: 'shape',
    render: ({ colors, rotate = 0, translate = [0, 0], zoom = 1 }) => {
      const [front = defaultFront, back = defaultBack] = colors || [];
      return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(${translate[0]} ${translate[1]}) rotate(${rotate}) scale(${zoom})"><path id="a" data-color="fill" fill="${front}" stroke="${front}" stroke-width="0" d="M50 50h50v50H50zM0 0h50v50H0z"></path><use xlink:href="#a" x="50" y="-50"></use><use xlink:href="#a" x="-50" y="50"></use></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="${back}"/><rect fill="url(#p)" width="100%" height="100%"></rect></svg>`;
    },
    type: 'svg',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: ['stroke'],
    group: 'zigzag',
    render: ({ colors, rotate = 0, translate = [0, 0], zoom = 1 }) => {
      const [front = defaultFront, back = defaultBack] = colors || [];
      return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(${translate[0]} ${translate[1]}) rotate(${rotate}) scale(${zoom})"><path id="a" data-color="fill" fill="${front}" stroke="${front}" stroke-width="0" d="M50 100L0 50V0l50 50 50-50h0v50l-50 50z"></path><use xlink:href="#a" y="-100"></use><use xlink:href="#a" y="100"></use></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="${back}"/><rect fill="url(#p)" width="100%" height="100%"></rect></svg>`;
    },
    type: 'svg',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: ['stroke'],
    group: 'shape',
    render: ({ colors, rotate = 0, translate = [0, 0], zoom = 1 }) => {
      const [front = defaultFront, back = defaultBack] = colors || [];
      return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(${translate[0]} ${translate[1]}) rotate(${rotate}) scale(${zoom})"><path id="a" data-color="fill" fill="${front}" stroke="${front}" stroke-width="0" d="M50 0C22 0 0 22 0 50c28 0 50 22 50 50 0-28 22-50 50-50 0-28-22-50-50-50z"></path><use xlink:href="#a" y="-100"></use><use xlink:href="#a" y="100"></use></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="${back}"/><rect fill="url(#p)" width="100%" height="100%"></rect></svg>`;
    },
    type: 'svg',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: ['stroke'],
    group: 'shape',
    render: ({ colors, rotate = 0, translate = [0, 0], zoom = 1 }) => {
      const [front = defaultFront, back = defaultBack] = colors || [];
      return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(${translate[0]} ${translate[1]}) rotate(${rotate}) scale(${zoom})"><path data-color="outline" fill="${front}" stroke="${front}" stroke-width="0" d="M50 0C22.4 0 0 22.4 0 50c27.6 0 50-22.4 50-50zM0 50c0 27.6 22.4 50 50 50 0-27.6-22.4-50-50-50zM100 50c-27.6 0-50 22.4-50 50 27.6 0 50-22.4 50-50zM100 50c0-27.6-22.4-50-50-50 0 27.6 22.4 50 50 50z"></path></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="${back}"/><rect fill="url(#p)" width="100%" height="100%"></rect></svg>`;
    },
    type: 'svg',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: ['stroke'],
    group: 'shape',
    render: ({ colors, rotate = 0, translate = [0, 0], zoom = 1 }) => {
      const [front = defaultFront, back = defaultBack] = colors || [];
      return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(${translate[0]} ${translate[1]}) rotate(${rotate}) scale(${zoom})"><path id="a" data-color="fill" fill="${front}" stroke="${front}" stroke-width="0" d="M0 50v50h50C22.386 100 0 77.614 0 50zM50 0c27.614 0 50 22.386 50 50V0H50zM50 0C22.386 0 0 22.386 0 50h50V0zM50 100c27.614 0 50-22.386 50-50H50v50z"></path><use xlink:href="#a" y="-100"></use><use xlink:href="#a" y="100"></use><use xlink:href="#a" x="-100"></use><use xlink:href="#a" x="100"></use></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="${back}"/><rect fill="url(#p)" width="100%" height="100%"></rect></svg>`;
    },
    type: 'svg',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: ['stroke'],
    group: 'shape',
    render: ({ colors, rotate = 0, translate = [0, 0], zoom = 1 }) => {
      const [front = defaultFront, back = defaultBack] = colors || [];
      return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(${translate[0]} ${translate[1]}) rotate(${rotate}) scale(${zoom})"><circle data-color="fill" fill="${front}" stroke="${front}" stroke-width="0" cx="50" cy="50" r="50"></circle></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="${back}"/><rect fill="url(#p)" width="100%" height="100%"></rect></svg>`;
    },
    type: 'svg',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: ['stroke'],
    group: 'shape',
    render: ({ colors, rotate = 0, translate = [0, 0], zoom = 1 }) => {
      const [front = defaultFront, back = defaultBack] = colors || [];
      return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(${translate[0]} ${translate[1]}) rotate(${rotate}) scale(${zoom})"><path id="a" data-color="fill" fill="${front}" stroke="${front}" stroke-width="0" d="M50 50H0V0h50v50zM35 35V15H15v20h20zM100 100H50V50h50v50zM85 85V65H65v20h20zM35 64.9571v20H15v-20zM85 14.9571v20H65v-20z"></path><use xlink:href="#a" y="-100"></use><use xlink:href="#a" y="100"></use><use xlink:href="#a" x="-100"></use><use xlink:href="#a" x="100"></use></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="${back}"/><rect fill="url(#p)" width="100%" height="100%"></rect></svg>`;
    },
    type: 'svg',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: [],
    group: 'shape',
    render: ({ colors, rotate = 0, stroke = 25, translate = [0, 0], zoom = 1 }) => {
      const [front = defaultFront, back = defaultBack] = colors || [];
      return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(${translate[0]} ${translate[1]}) rotate(${rotate}) scale(${zoom})"><circle id="a" data-color="outline" fill="none" stroke="${front}" stroke-width="${stroke}" r=".5"></circle><use xlink:href="#a" y="100"></use><use xlink:href="#a" x="100"></use><use xlink:href="#a" x="100" y="100"></use><use xlink:href="#a" x="50" y="50"></use></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="${back}"/><rect fill="url(#p)" width="100%" height="100%"></rect></svg>`;
    },
    stroke: 25,
    type: 'svg',
  },
  {
    colors: [defaultFront, defaultBack],
    group: 'shape',
    render: ({ colors, rotate = 0, stroke = 10, translate = [0, 0], zoom = 1 }) => {
      const [front = defaultFront, back = defaultBack] = colors || [];
      return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(${translate[0]} ${translate[1]}) rotate(${rotate}) scale(${zoom})"><path data-color="outline" fill="none" stroke="${front}" stroke-width="${stroke}" d="M50 0v100M100 50H0"></path></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="${back}"/><rect fill="url(#p)" width="100%" height="100%"></rect></svg>`;
    },
    stroke: 10,
    type: 'svg',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: ['stroke'],
    group: 'shape',
    render: ({ colors, rotate = 0, translate = [0, 0], zoom = 1 }) => {
      const [front = defaultFront, back = defaultBack] = colors || [];
      return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><pattern id="p" width="50" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(${translate[0]} ${translate[1]}) rotate(${rotate}) scale(${zoom})"><path data-color="outline" fill="${front}" stroke="${front}" stroke-width="0" d="M50 50c0 24.1-25 25-25 50C25 75 0 74.1 0 50S25 25 25 0c0 25 25 25.9 25 50z"></path></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="${back}"/><rect fill="url(#p)" width="100%" height="100%"></rect></svg>`;
    },
    type: 'svg',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: ['stroke'],
    group: 'shape',
    render: ({ colors, rotate = 0, translate = [0, 0], zoom = 1 }) => {
      const [front = defaultFront, back = defaultBack] = colors || [];
      return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(${translate[0]} ${translate[1]}) rotate(${rotate}) scale(${zoom})"><g data-color="fill" fill="${front}" stroke="${front}" stroke-width="0"><path id="a" d="M50-37S28-15 28 0s22 37 22 37S72 15 72 0 50-37 50-37z"></path><path id="b" d="M37 50S15 28 0 28s-37 22-37 22 22 22 37 22 37-22 37-22z"></path><use xlink:href="#a" y="100"></use><use xlink:href="#b" x="100"></use></g></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="${back}"/><rect fill="url(#p)" width="100%" height="100%"></rect></svg>`;
    },
    type: 'svg',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: [],
    group: 'shape',
    render: ({ colors, rotate = 0, stroke = 5, translate = [0, 0], zoom = 1 }) => {
      const [front = defaultFront, back = defaultBack] = colors || [];
      return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(${translate[0]} ${translate[1]}) rotate(${rotate}) scale(${zoom})"><path data-color="outline" fill="none" stroke="${front}" stroke-width="${stroke}" d="M33.5 100V66.5H0v-33h33.5V0h33v33.5H100v33H66.5V100z"></path></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="${back}"/><rect fill="url(#p)" width="100%" height="100%"></rect></svg>`;
    },
    stroke: 5,
    type: 'svg',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: [],
    group: 'shape',
    render: ({ colors, rotate = 0, stroke = 48, translate = [0, 0], zoom = 1 }) => {
      const [front = defaultFront, back = defaultBack] = colors || [];
      return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="translate(${translate[0]} ${translate[1]}) rotate(${rotate}) scale(${zoom})"><path data-color="outline" fill="none" stroke="${front}" stroke-width="${stroke}" d="M49-1h2v102h-2z"></path></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="${back}"/><rect fill="url(#p)" width="100%" height="100%"></rect></svg>`;
    },
    stroke: 48,
    type: 'svg',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: ['translate', 'rotate'],
    group: 'shape',
    render: ({ colors, zoom = 1 }) => {
      const [front = defaultFront, back = defaultBack] = colors || [];
      const alpha = colord(front).alpha() / 3;
      const c = colord(front).alpha(alpha).toHex();
      const size = zoom * 20;
      return `
      background-color: ${back};
      background-image:
        repeating-radial-gradient(circle at 0 0, transparent 0, ${back} ${size}px), 
        repeating-linear-gradient(${c}, ${front});`;
    },
    type: 'css',
  },
  {
    colors: colord(defaultFront).tints(3).map(c => c.toHex()),
    group: 'shape',
    render: ({ colors, translate, zoom = 1 }) => {
      const [c1, c2, c3] = colors || [];
      const size = zoom * 84;
      return `
      background:
        conic-gradient(at 83.3333% 33.3333%,${c3} 0 120deg,#0000 0),
        conic-gradient(from -120deg at 16.6667% 33.3333%,${c2} 0 120deg,#0000 0),
        conic-gradient(from 120deg at 33.3333% 83.3333%,${c1} 0 120deg,#0000 0),
        conic-gradient(from 120deg at 66.6667% 83.3333%,${c1} 0 120deg,#0000 0),
        conic-gradient(from -180deg at 33.3333% 50%,${c2} 60deg,${c1} 0 120deg,#0000 0),
        conic-gradient(from  60deg at 66.6667% 50%,${c1} 60deg,${c3} 0 120deg,#0000 0),
        conic-gradient(from -60deg at 50% 33.3333%,${c1} 120deg,${c2} 0 240deg,${c3} 0);
      background-size: calc(${size}px * sqrt(3)) ${size}px;
      background-position: ${translate?.[0] || 0}px ${translate?.[1] || 0}px;`;
    },
    type: 'css',
  },
  {
    colors: colord(defaultFront).tints(3).map(c => c.toHex()),
    disabled: ['translate'],
    group: 'shape',
    render: ({ colors, zoom = 1 }) => {
      const [c1, c2, c3] = colors || [];
      const size = zoom * 200;
      return `
      background:
        repeating-conic-gradient(from 30deg,#0000 0 120deg,${c3} 0 50%) ${size / 2}px calc(${size / 2}px*tan(30deg)),
        repeating-conic-gradient(from 30deg,${c1} 0 60deg,${c2} 0 120deg,${c3} 0 50%);
      background-size: ${size}px calc(${size}px*tan(30deg));`;
    },
    type: 'css',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: ['translate'],
    group: 'shape',
    render: ({ colors, zoom = 1 }) => {
      const [c1, c2] = colors || [];
      const size = zoom * 150;
      const repeat = `${c1} 0%  5% ,${c2} 6%  15%,${c1} 16% 25%,${c2} 26% 35%,${c1} 36% 45%,
        ${c2} 46% 55%,${c1} 56% 65%,${c2} 66% 75%,${c1} 76% 85%,${c2} 86% 95%,
        #0000 96%`;
      return `
      background:
        radial-gradient(50% 50% at 100% 0,${repeat}),
        radial-gradient(50% 50% at 0 100%,${repeat}),
        radial-gradient(50% 50%,${repeat}),
        radial-gradient(50% 50%,${repeat}) ${size / 2}px ${size / 2}px ${c1};
      background-size: ${size}px ${size}px;`;
    },
    type: 'css',
  },
  {
    colors: colord(defaultFront).tints(3).map(c => c.toHex()),
    disabled: ['translate'],
    group: 'shape',
    render: ({ colors, zoom = 1 }) => {
      const [c1, c2, c3] = colors || [];
      const size = zoom * 100;
      return `
      background: 
        radial-gradient(47% 50% at -10% 50%,#0000 37%,${c1} 39% 70%,#0000 72%) 0 calc(${size}px/2),
        radial-gradient(47% 50% at -10% 50%,#0000 37%,${c1} 39% 70%,#0000 72%) calc(${size}px/2) 0,
        radial-gradient(47% 50% at 110% 50%,#0000 37%,${c1} 39% 70%,#0000 72%),
        radial-gradient(47% 50% at 110% 50%,#0000 37%,${c1} 39% 70%,#0000 72%) calc(${size}px/2) calc(${size}px/2),
        conic-gradient(from   0deg at 55% 50%,${c2} 40deg,${c3} 0 140deg,${c2} 0 180deg,#0000 0) calc(${size}px/4) 0,
        conic-gradient(from 180deg at 45% 50%,${c2} 40deg,${c3} 0 140deg,${c2} 0 180deg,#0000 0) calc(${size}px/4) 0,
        ${c2};
      background-size: ${size}px ${size}px;`;
    },
    type: 'css',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: ['translate'],
    group: 'shape',
    render: ({ colors, zoom = 1 }) => {
      const [c1, c2] = colors || [];
      const size = zoom * 140;
      const repeat = `#0000 52%,${c1} 54% 57%,#0000 59%`;
      return `
      background:
        radial-gradient(farthest-side at -33.33% 50%,${repeat}) 0 ${size / 2}px,
        radial-gradient(farthest-side at 50% 133.33%,${repeat}) ${size / 2}px 0,
        radial-gradient(farthest-side at 133.33% 50%,${repeat}),
        radial-gradient(farthest-side at 50% -33.33%,${repeat}),
        ${c2};
      background-size: ${size / 4.667}px ${size}px,${size}px ${size / 4.667}px;`;
    },
    type: 'css',
  },
  {
    colors: [defaultFront, defaultBack],
    disabled: ['translate'],
    group: 'grid',
    render: ({ colors, zoom = 1 }) => {
      const [c1, c2] = colors || [];
      const size = zoom * 100;
      return `
      background: 
        conic-gradient(from 90deg at 2px 2px,#0000 90deg,${c1} 0),
        conic-gradient(from 90deg at 1px 1px,#0000 90deg,${c1} 0),
        ${c2};
      background-size: ${size}px ${size}px, ${size / 5}px ${size / 5}px;`;
    },
    type: 'css',
  },
  {
    colors: colord(defaultFront).tints(3).map(c => c.toHex()),
    disabled: ['translate'],
    group: '3d',
    render: ({ colors, zoom = 1 }) => {
      const [c1, c2, c3] = colors || [];
      const size = zoom * 222;
      const repeat = `${c1} 10%,${c2} 10.5% 19%,#0000 19.5% 80.5%,${c2} 81% 89.5%,${c3} 90%`;
      return `
      background: 
        linear-gradient(145deg,${repeat}), linear-gradient(145deg,${repeat}) ${size / 2}px ${size}px,
        linear-gradient( 35deg,${repeat}), linear-gradient( 35deg,${repeat}) ${size / 2}px ${size}px,
        conic-gradient(from -90deg at 37.5% 50%,#0000 75%,${c1} 0) ${size / 8}px 0,
        conic-gradient(from -90deg at 37.5% 50%,#0000 75%,${c3} 0) ${size / 2}px 0,
        linear-gradient(90deg,${c3} 38%,${c1} 0 50%,${c3} 0 62%,${c1} 0);
      background-size: ${size}px ${size * 2 / 3}px;`;
    },
    type: 'css',
  },
];

export default collections;
