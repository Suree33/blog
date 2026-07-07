import {
  defineHastPlugin,
  type HastNode,
  type HastPluginDefinition,
} from 'satteri';
import { icons } from '@iconify-json/lucide';

type HastElement = Extract<HastNode, { type: 'element' }>;

function isParagraph(node: HastNode): node is HastElement {
  return node.type === 'element' && node.tagName === 'p';
}

const CALLOUTS = {
  INFO: { icon: 'info', title: 'Info', type: 'info' },
  NOTE: { icon: 'pen', title: 'Note', type: 'note' },
  WARNING: {
    icon: 'message-square-warning',
    title: 'Warning',
    type: 'warning',
  },
} as const;

const CALLOUT_MARKER = /^\[!(INFO|NOTE|WARNING)\](?:\r?\n|$)/;

function getIconBody(name: string): string {
  const icon = icons.icons[name];
  if (!icon) throw new Error(`Lucide icon not found: ${name}`);
  return icon.body;
}

export function createCalloutPlugin(): HastPluginDefinition {
  return defineHastPlugin({
    name: 'callout',
    element: {
      filter: ['blockquote'],
      visit(node) {
        const paragraph = node.children?.find(isParagraph);
        const marker = paragraph?.children?.[0];

        if (marker?.type !== 'text') {
          return;
        }

        const match = marker.value.match(CALLOUT_MARKER);
        if (!match) return;

        const callout = CALLOUTS[match[1] as keyof typeof CALLOUTS];

        return {
          type: 'element',
          tagName: 'div',
          properties: {
            ariaLabel: callout.title,
            className: ['callout', `callout-${callout.type}`],
            dataCallout: callout.type,
          },
          children: [
            {
              type: 'element',
              tagName: 'p',
              properties: { className: ['callout-title'] },
              children: [
                {
                  type: 'raw',
                  value: `<svg class="callout-icon" data-icon="lucide:${callout.icon}" viewBox="0 0 24 24" aria-hidden="true">${getIconBody(callout.icon)}</svg>`,
                },
                { type: 'text', value: callout.title },
              ],
            },
            ...node.children.map((child) =>
              child === paragraph
                ? {
                    ...paragraph,
                    children: [
                      {
                        ...marker,
                        value: marker.value.replace(CALLOUT_MARKER, ''),
                      },
                      ...paragraph.children.slice(1),
                    ],
                  }
                : child,
            ),
          ],
        };
      },
    },
  });
}
