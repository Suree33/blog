export interface Post {
  frontmatter: {
    title: string;
    pubDate: string;
    tags?: string[];
    draft?: boolean;
  };
  url?: string;
}
