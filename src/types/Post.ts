export interface Post {
  frontmatter: {
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
  };
  url: string;
}
