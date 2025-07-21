import { toc } from 'mdast-util-toc';

/**
 * Custom remark plugin for auto-generating table of contents
 * without requiring manual heading markers in markdown files
 */
export default function remarkAutoToc(options = {}) {
  const settings = {
    maxDepth: 3,
    tight: true,
    ...options
  };

  return function (tree) {
    const result = toc(tree, settings);
    
    if (!result.map || result.map.children.length === 0) {
      return; // No headings found, skip TOC generation
    }

    const tocHeading = {
      type: 'heading',
      depth: 2,
      children: [{ type: 'text', value: '目次' }]
    };

    const insertIndex = tree.children.findIndex(node => 
      node.type === 'heading' && node.depth === 1
    );
    
    const targetIndex = insertIndex >= 0 ? insertIndex + 1 : 0;
    
    tree.children.splice(targetIndex, 0, tocHeading, result.map);
  };
}
