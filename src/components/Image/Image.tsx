import type { ImgHTMLAttributes } from 'react';
import React from 'react';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import type { FileNode } from 'gatsby-plugin-image/dist/src/components/hooks';
import type { IImg } from '../../types';

const Image: React.FC<IImg> = ({ src, ...props }) => {
  // TODO : Find where you have src null returns
  if (!src) {
    return null;
  }

  // Create a bool to tell us if the src is a string (vanilla img) or object (Gatsby)
  const isGatsby = typeof src !== 'string';

  // Retrun either the GatsbyImg component or a regular img tag with the spread props
  return isGatsby ? (
    <GatsbyImage image={getImage(src as unknown as FileNode)!} {...props} />
  ) : (
    <img alt="" {...(props as ImgHTMLAttributes<HTMLImageElement>)} />
  );
};

export default Image;
