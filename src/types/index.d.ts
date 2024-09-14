import type { FC } from 'react';

export type IAuthor = Queries.AuthorsYaml;

export type IArticle = Queries.MarkdownRemark;

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
  className?: string;
}>;

export interface IImg
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder' | 'onLoad' | 'src' | 'srcSet'> {
  src: string | Queries.File | Queries.ImageSharp;
  alt: string;
}

interface CustomPhotoType {
  image: Queries.ImageSharp;
  count: number;
  date: string;
  slug: string;
}
