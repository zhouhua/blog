import type { GetImageResult } from 'astro';
import type exif from 'fast-exif';

export interface Site {
  NAME: string;
  EMAIL: string;
  NUM_POSTS_ON_HOMEPAGE: number;
  NUM_WORKS_ON_HOMEPAGE: number;
  NUM_PROJECTS_ON_HOMEPAGE: number;
}

export interface Metadata {
  TITLE: string;
  DESCRIPTION: string;
}

export type Socials = {
  NAME: string;
  HREF: string;
}[];

export interface Menu {
  name: string;
  path: string;
  icon: string;
  iconComponent: React.ReactNode;
}

export interface CustomPhotoType {
  alt: string;
  count: number;
  date: Date;
  slug: string;
  transformed: GetImageResult;
  width: number;
  height: number;
}

type getExifType<T> = T extends (...args: any[]) => Promise<infer R> ? R : never;

export type Exif = getExifType<typeof exif.read>;

export interface PhotoImage {
  title: string;
  transformed: GetImageResult;
  width: number;
  height: number;
  exif: Exif;
}
