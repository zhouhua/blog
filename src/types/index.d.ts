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
  className?: string;
}>;

export interface IImg
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder' | 'onLoad' | 'src' | 'srcSet'> {
  src: string | Queries.File;
  alt: string;
}

type CustomPhotoType = {
  image: Queries.ImageSharp;
  count: number;
  date: string;
  slug: string;
};
