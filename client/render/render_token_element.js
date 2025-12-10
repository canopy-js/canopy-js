import Path from 'models/path';
import { requestJson } from 'requests/request_json';

import renderTextToken from './token_elements/render_text_token';
import {
  renderLocalLink,
  renderGlobalLink,
  renderDisabledLink,
  renderFragmentReference,
  renderExternalLink,
} from './token_elements/render_links';
import { renderImage } from './token_elements/render_image';
import renderHtmlElement from './token_elements/render_html';
import { renderFootnoteSymbol, renderFootnoteLines } from './token_elements/render_footnotes';
import { renderCodeBlock, renderInlineCodeText } from './token_elements/render_code';
import renderBlockQuote from './token_elements/render_blockquote';
import renderList from './token_elements/render_list';
import renderTable from './token_elements/render_table';
import renderMenu from './token_elements/render_menu';
import { renderBoldText, renderUnderlineText, renderItalicText } from './token_elements/render_text_styles';
import renderToolTip from './token_elements/render_tooltip';
import renderCenterBlock from './token_elements/render_center_block';

function renderTokenElements(token, renderContext) {
  if (token.type === 'text') {
    return renderTextToken(token);
  } else if (token.type === 'local') {
    renderContext.localLinkSubtreeCallback(token);
    return renderLocalLink(token, renderContext, renderTokenElements);
  } else if (token.type === 'global') {
    Path.for(token.pathString).topicArray.map(topic => requestJson(topic)); // eager load
    return renderGlobalLink(token, renderContext, renderTokenElements);
  } else if (token.type === 'disabled_reference') {
    return renderDisabledLink(token, renderContext, renderTokenElements);
  } else if (token.type === 'fragment_reference') {
    return renderFragmentReference(token, renderContext, renderTokenElements);
  } else if (token.type === 'external') {
    return renderExternalLink(token, renderContext, renderTokenElements);
  } else if (token.type === 'image') {
    return renderImage(token, renderContext, renderTokenElements);
  } else if (token.type === 'html_element') {
    return renderHtmlElement(token, renderContext, renderTokenElements);
  } else if (token.type === 'footnote_marker') {
    return renderFootnoteSymbol(token);
  } else if (token.type === 'code_block') {
    return renderCodeBlock(token);
  } else if (token.type === 'block_quote') {
    return renderBlockQuote(token, renderContext, renderTokenElements);
  } else if (token.type === 'list') {
    return renderList(token.topLevelNodes, renderContext, renderTokenElements);
  } else if (token.type === 'table') {
    return renderTable(token, renderContext, renderTokenElements);
  } else if (token.type === 'menu') {
    return renderMenu(token, renderContext, renderTokenElements);
  } else if (token.type === 'footnote_lines') {
    return renderFootnoteLines(token, renderContext, renderTokenElements);
  } else if (token.type === 'bold') {
    return renderBoldText(token, renderContext, renderTokenElements);
  } else if (token.type === 'underlined') {
    return renderUnderlineText(token, renderContext, renderTokenElements);
  } else if (token.type === 'italics') {
    return renderItalicText(token, renderContext, renderTokenElements);
  } else if (token.type === 'inline_code') {
    return renderInlineCodeText(token);
  } else if (token.type === 'tool_tip') {
    return renderToolTip(token, renderContext, renderTokenElements);
  } else if (token.type === 'center_block') {
    return renderCenterBlock(token, renderContext, renderTokenElements);
  } else {
    throw `Unhandled token type: ${token.type}`;
  }
}

export default renderTokenElements;
