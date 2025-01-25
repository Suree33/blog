export interface Post {
  frontmatter: {
    /**
     * Astroレイアウト
     */
    layout: string;
    title: string;
    pubDate: string;
    updatedDate?: string;
    description?: string;
    tags?: string[];
    draft?: boolean;
    ogimage?: string;
  };
  url?: string;
}
