declare module '*.module.css' {
  const classes: { [key: string]: string };
  export = classes;
}
declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

type ColorMode = 'light' | 'dark';
