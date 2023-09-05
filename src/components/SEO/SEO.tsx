/**
 * This react helmt code is adapted from
 * https://themeteorchef.com/tutorials/reusable-seo-with-react-helmet.
 *
 * A great tutorial explaining how to setup a robust version of an
 * SEO friendly react-helmet instance.
 *
 *
 * Use the Helmt on pages to generate SEO and meta content!
 *
 * Usage:
 * <SEO
 *   title={title}
 *   description={description}
 *   image={image}
 * />
 *
 */

// FIXME! later
import type { FC, PropsWithChildren } from 'react';
import React from 'react';
import Helmet from 'react-helmet';
import useSiteMetadata from '@hooks/useSiteMetaData';

interface HelmetProps {
  articlepathName?: string;
  authorName?: string;
  authorsBio?: string;
  authorsSlug?: string;
  canonicalUrl?: string;
  dateforSEO?: string;
  description?: string;
  image?: string;
  isBlogPost: boolean;
  pathname: string;
  published?: string;
  title: string;
}

const SEO: FC<PropsWithChildren<HelmetProps>> = ({
  articlepathName,
  authorName,
  authorsBio,
  authorsSlug,
  canonicalUrl,
  children,
  dateforSEO,
  description,
  image,
  isBlogPost,
  pathname,
  published,
  title
}) => {
  const site = useSiteMetadata();
  const pageUrl = site.siteUrl + pathname;
  const fullURL = (path: string) => (path ? `${path}` : site.siteUrl);

  // If no image is provided lets looks for a default novela static image
  let siteImage = image || `${site.siteUrl}/preview.jpg`;

  siteImage = fullURL(siteImage);

  const siteSchema = `{
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "${site.siteUrl}/#organization",
        "name": "${site.title}",
        "url": "${site.siteUrl}",
        "logo": {
          "@type": "ImageObject",
          "@id": "${site.siteUrl}/#logo",
          "inLanguage": "en-US",
          "url": "${site.siteUrl}/icons/icon-512x512.png",
          "width": 512,
          "height": 512,
          "caption": "${site.title}"
        },
        "image": {
          "@id": "${site.siteUrl}/#logo"
        }
      },
      {
        "@type": "WebSite",
        "@id": "${site.siteUrl}/#website",
        "url": "${site.siteUrl}",
        "name": "${site.title}",
        "description": "${site.subtitle}",
        "publisher": {
          "@id": "${site.siteUrl}/#organization"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": [
          "WebPage"
        ],
        "@id": "${pageUrl}/#webpage",
        "url": "${pageUrl}",
        "name": "${title || site.title}",
        "isPartOf": {
          "@id": "${site.siteUrl}/#website"
        },
        "about": {
          "@id": "${site.siteUrl}/#organization"
        },
        "description": "${description || site.subtitle}",
        "inLanguage": "en-US"
      },
      {
        "@type": "BreadcrumbList",
        "description": "Breadcrumbs list",
        "itemListElement": [
          {
            "@type": "ListItem",
            "item": "${site.siteUrl}",
            "name": "Homepage",
            "position": "1"
          }
        ],
        "name": "Breadcrumbs"
      }
    ]
  }
`.replace(/"[^"]+"|(\s)/gm, (matched, group1) => {
    if (!group1) {
      return matched;
    }

    return '';
  });

  const blogSchema = `{
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "${site.siteUrl}/#organization",
        "name": "${site.title}",
        "url": "${site.siteUrl}",
        "logo": {
          "@type": "ImageObject",
          "@id": "${site.siteUrl}/#logo",
          "inLanguage": "en-US",
          "url": "${site.siteUrl}/icons/icon-512x512.png",
          "width": 512,
          "height": 512,
          "caption": "${site.title}"
        },
        "image": {
          "@id": "${site.siteUrl}/#logo"
        }
      },
      {
        "@type": "WebSite",
        "@id": "${site.siteUrl}/#website",
        "url": "${site.siteUrl}",
        "name": "${site.title}",
        "description": "${site.subtitle.replace(/"/g, '\\"')}",
        "publisher": {
          "@id": "${site.siteUrl}/#organization"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "ImageObject",
        "@id": "${articlepathName}/#primaryimage",
        "inLanguage": "en-US",
        "url": "${siteImage}",
        "width": 1200,
        "height": 628
      },
      {
        "@type": [
          "WebPage"
        ],
        "@id": "${articlepathName}/#webpage",
        "url": "${articlepathName}",
        "name": "${title}",
        "isPartOf": {
          "@id": "${site.siteUrl}/#website"
        },
        "primaryImageOfPage": {
          "@id": "${articlepathName}/#primaryimage"
        },
        "datePublished": "${dateforSEO}",
        "dateModified": "${dateforSEO}",
        "description": "${description}",
        "breadcrumb": {
          "@id": "${articlepathName}/#breadcrumb"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "BreadcrumbList",
        "@id": "${articlepathName}/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "WebPage",
              "@id": "${site.siteUrl}",
              "url": "${site.siteUrl}",
              "name": "Home"
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "WebPage",
              "@id": "${articlepathName}",
              "url": "${articlepathName}",
              "name": "${title}"
            }
          }
        ]
      },
      {
        "@type": "Article",
        "@id": "${articlepathName}/#article",
        "isPartOf": {
          "@id": "${articlepathName}/#webpage"
        },
        "author": {
          "@id": "${site.siteUrl}/#/schema${authorsSlug}"
        },
        "headline": "${title}",
        "datePublished": "${dateforSEO}",
        "dateModified": "${dateforSEO}",
        "mainEntityOfPage": {
          "@id": "${articlepathName}/#webpage"
        },
        "publisher": {
          "@id": "${site.siteUrl}/#organization"
        },
        "image": {
          "@id": "${articlepathName}/#primaryimage"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": [
          "Person"
        ],
        "@id": "${site.siteUrl}/#/schema${authorsSlug}",
        "name": "${authorName}",
        "image": {
          "@type": "ImageObject",
        "@id": "${site.siteUrl}/#personlogo",
          "inLanguage": "en-US",
          "caption": "${authorName}"
        },
        "description": "${authorsBio}"
      }
    ]
  }
`.replace(/"[^"]+"|(\s)/gm, (matched, group1) => {
    if (!group1) {
      return matched;
    }

    return '';
  });

  const schema = isBlogPost ? blogSchema : siteSchema;

  const metaTags = [
    { charset: 'utf-8' },
    {
      'http-equiv': 'X-UA-Compatible',
      'content': 'IE=edge'
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    },
    { itemprop: 'name', content: title || site.title },
    { itemprop: 'description', content: description || site.subtitle },
    { itemprop: 'image', content: siteImage },
    { name: 'description', content: description || site.subtitle },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title || site.title },
    { property: 'og:url', content: articlepathName || pageUrl },
    { property: 'og:image', content: siteImage },
    { property: 'og:description', content: description || site.subtitle },
    { property: 'og:site_name', content: site.title }
  ];

  if (published) {
    metaTags.push({ name: 'article:published_time', content: published });
  }

  return (
    <Helmet title={title || site.title} htmlAttributes={{ lang: 'en' }} meta={metaTags}>
      <script type="application/ld+json">{schema}</script>
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {children}
    </Helmet>
  );
};

export default SEO;
