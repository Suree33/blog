export interface OgImage {
  src: string;
}

export type Tag = string;

export interface Frontmatter {
  title: string;
  pubDate: Date;
  updatedDate?: Date;
  description: string;
  tags: Tag[];
  draft?: boolean;
  ogimage?: {
    src: string;
    alt: string;
  };
  image?: {
    src: string;
    alt: string;
  };
}

export interface Post {
  frontmatter: Frontmatter;
  url: string;
  compiledContent: () => string;
}
