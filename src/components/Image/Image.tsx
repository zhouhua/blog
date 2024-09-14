import type { FC } from 'react';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import type { FileNode } from 'gatsby-plugin-image/dist/src/components/hooks';
import type { IImg } from '../../types';

const Image: FC<IImg> = ({ src, ...props }) => {
  // TODO : Find where you have src null returns
  if (!src) {
    return null;
  }

  // Create a bool to tell us if the src is a string (vanilla img) or object (Gatsby)
  const isGatsby = typeof src !== 'string';

  // Retrun either the GatsbyImg component or a regular img tag with the spread props
  return isGatsby
    ? (
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        <GatsbyImage image={getImage(src as unknown as FileNode)!} {...props} />
      )
    : (
        <img {...props} />
      );
};

export default Image;
