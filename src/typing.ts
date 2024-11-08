import * as vscode from "vscode";
import { genMarkdownString } from "./utils";
import { LANGUAGE_SELECTORS } from "./config";

/**
 * register provider for hover and typing antd design token
 */
export default function setupAntdTokenCompletion(
  fullToken: Record<string, string>
): vscode.Disposable {
  let disposeTyping: vscode.Disposable;

  const colorMap: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(fullToken)) {
    if (!colorMap[value]) {
      colorMap[value] = [];
    }
    colorMap[value].push(key);
  }

  const items: any[] | undefined = [];

  for (const [color, tokens] of Object.entries(colorMap)) {
    for (const token of tokens) {
      const item = new vscode.CompletionItem(`antd-${token}: ${color}`, 11);
      item.insertText = "token." + token;

      const colorSpan = genMarkdownString(color);
      let documentContent: vscode.MarkdownString | string = "";

      documentContent = new vscode.MarkdownString(
        `<h4>antd design token: ${token}</h4>${colorSpan}<code>${color}</code><br></br>`
      );
      documentContent.supportHtml = true;

      item.documentation = documentContent;

      items.push(item);
    }
  }

  disposeTyping = vscode.languages.registerCompletionItemProvider(
    LANGUAGE_SELECTORS,
    {
      provideCompletionItems(): any {
        return new vscode.CompletionList(items, false);
      },
    }
  );

  return disposeTyping;
}
