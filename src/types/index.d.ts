import type { FC } from 'react';

export interface IAuthor extends Queries.AuthorsYaml {}

export interface IArticle extends Queries.MarkdownRemark {}

interface IArticleQuery {
  edges: {
    node: IArticle;
  }[];
}

export interface IProgress {
  height: number;
  offset: number;
  title: string;
  mode: string;
  onClose?: () => void;
}

export type Icon = FC<{
  fill: string;
}>;

export interface IImg
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    'placeholder' | 'onLoad' | 'src' | 'srcSet' | 'width' | 'height'
  > {
  src: string | Queries.File;
  alt: string;
}
