import * as React from 'react';
import ReactPDF, { Text } from '@react-pdf/renderer';

const supportedTags = ['sub'] as const;
export type SupportedTag = typeof supportedTags[number];
type TagType = '#text' & SupportedTag;
type TagToken = { type: TagType; content: string };
type RenderOutput = 'PDF' | 'text';
type MapHTMLTagsOptions = {
  stylesByTag?: { [tag in SupportedTag]: ReactPDF.Styles[string] };
  output?: RenderOutput;
};

function tokenizeContent(text: string): TagToken[] {
  const tokens: { type: TagType; content: string }[] = [];
  const container = document.createElement('div');
  container.innerHTML = text;

  container.childNodes.forEach((node) => {
    tokens.push({ type: node.nodeName.toLowerCase() as TagType, content: node.textContent });
  });

  return tokens;
}

function renderPDF(token: TagToken, style?: ReactPDF.Styles[string]): React.ReactNode {
  const { type, content } = token;
  switch (type) {
    case '#text':
      return content;
    case 'sub':
      return style ? <Text style={style}>{content}</Text> : content;
    default:
      return content;
  }
}

function renderText(token: TagToken): string {
  return token.content;
}

function mapHTML(text: string, options: MapHTMLTagsOptions = {}): React.ReactNode[] {
  const { stylesByTag = {}, output = 'text' } = options;
  const tokens = tokenizeContent(text);
  const render = output === 'text' ? renderText : renderPDF;
  return tokens.map((token) => render(token, stylesByTag[token.type]));
}

export function parseAsPdf(
  text: string,
  stylesByTag?: { [tag in SupportedTag]: ReactPDF.Styles[string] }
) {
  return <>{mapHTML(text, { stylesByTag, output: 'PDF' })}</>;
}

export function parseAsText(text: string): string {
  return (mapHTML(text, { output: 'text' }) as string[]).join('');
}
