import * as vscode from "vscode";
import { genMarkdownString } from "./utils";
import { LANGUAGE_SELECTORS } from "./config";

/**
 * register provider for hover and typing antd design token
 */
export default function setupAntdTokenCompletion(
  fullToken: any
): vscode.Disposable {
  let disposeTyping: vscode.Disposable;

  const items: any[] | undefined = [];

  for (let key in fullToken) {
    let value = fullToken[key as keyof typeof fullToken];
    const item = new vscode.CompletionItem(`antd-${key}: ${value}`, 11);
    item.insertText = key.includes("-") ? `token['${key}']` : `token.${key}`;

    if (typeof value === "number") {
      const sortValue = String(value).padStart(5, "0");
      item.sortText = `a-${sortValue}-${key}`;
    } else {
      item.sortText = `a-${key}`;
    }

    const colorSpan = genMarkdownString(value);
    let documentContent: vscode.MarkdownString | string = "";

    documentContent = new vscode.MarkdownString(
      `<h4>antd design token: ${key}</h4>${colorSpan}<code>${value}</code><br></br>`
    );
    documentContent.supportHtml = true;

    item.documentation = documentContent;

    items.push(item);
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
