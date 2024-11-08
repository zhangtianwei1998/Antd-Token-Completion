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

  const colorMap: Record<string, string> = {};
  for (const [key, value] of Object.entries(fullToken)) {
    colorMap[value] = key;
  }

  // TYPING
  // Add antd token value tips on typing
  // Note: 11 is a `value` kind of completion items.
  // Based on the kind an icon is chosen by the editor.
  const items: any[] | undefined = [];

  for (let key in colorMap) {
    let value = colorMap[key as keyof typeof colorMap];
    const item = new vscode.CompletionItem(`antd-${value}: ${key}`, 11);
    item.insertText = "token." + value;

    // if (typeof value === "number") {
    //   const sortValue = String(value).padStart(5, "0");
    //   item.sortText = `a-${sortValue}-${key}`;
    // } else {
    //   item.sortText = `a-${key}`;
    // }

    const colorSpan = genMarkdownString(key);
    let documentContent: vscode.MarkdownString | string = "";

    documentContent = new vscode.MarkdownString(
      `<h4>antd design token: ${value}</h4>${colorSpan}<code>${key}</code><br></br>`
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
