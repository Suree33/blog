export interface Frontmatter {
  title: string;
  pubDate: string;
  updatedDate?: string;
  description: string;
  tags: string[];
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
}
