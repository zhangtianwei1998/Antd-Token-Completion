import getDesignToken from "antd-token-previewer/es/utils/getDesignToken";
import * as vscode from "vscode";
import setupEventListenerAndDecorations, {
  DisposableAndClear,
} from "./listener";
import setupAntdTokenCompletion from "./typing";
import { checkAntdProject } from "./utils";
import { getCustomToken } from "./utils/getCustomToken";

export async function activate(context: vscode.ExtensionContext) {
  let isActive = true;
  let disposeTyping: vscode.Disposable | undefined;
  let disposableAndClear: DisposableAndClear | undefined;
  let disposeEditor: vscode.Disposable | undefined;
  let customToken: Record<string, string>;

  if (isActive || isActive === undefined) {
    await setup();
  }

  const disposable = vscode.commands.registerCommand(
    "antd-design-token.toggle",
    () => {
      isActive = !isActive;
      disposeAll();

      if (isActive) {
        setup();
        vscode.window.showInformationMessage(
          "antd design token is active now."
        );
      } else {
        vscode.window.showInformationMessage(
          "antd design token is inactive now."
        );
      }
    }
  );

  context.subscriptions.push(disposable);

  async function setup() {
    const originToken = getDesignToken();

    const customToken = await getCustomToken();

    const fullToken = { ...originToken, ...customToken };
    console.log("testfullToken", fullToken.colorPrimary);

    if (!fullToken) {
      vscode.window.showErrorMessage("Failed to get antd fullToken.");
      return;
    }

    activeEditorListener(fullToken);

    const isAntdProject = checkAntdProject();
    if (isAntdProject) {
      setupDecorationsAndCompletion(context, fullToken);
    }
  }

  function setupDecorationsAndCompletion(
    context: vscode.ExtensionContext,
    fullToken: any
  ) {
    disposeTyping = setupAntdTokenCompletion(fullToken);
    disposableAndClear = setupEventListenerAndDecorations(context, fullToken);
  }

  function disposeAll() {
    if (disposeTyping) {
      disposeTyping.dispose();
      disposeTyping = undefined;
    }

    if (disposableAndClear) {
      disposableAndClear.disposable.forEach((disposable) =>
        disposable?.dispose()
      );
      disposableAndClear.clear();
      disposableAndClear = undefined;
    }

    if (disposeEditor) {
      disposeEditor.dispose();
    }
  }

  function activeEditorListener(fullToken: any) {
    disposeEditor = vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        if (editor) {
          const isAntdProject = checkAntdProject();

          if (isAntdProject) {
            if (!disposeTyping && !disposableAndClear) {
              setupDecorationsAndCompletion(context, fullToken);
            }
          } else {
            disposeAll();
          }
        }
      },
      null,
      context.subscriptions
    );
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
