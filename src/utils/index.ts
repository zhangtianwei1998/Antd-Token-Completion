import rgbHex from "rgb-hex";
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
/**
 * Generate the MarkdownString for vscode.MarkdownString function
 * Note: should convert rgb color to hex
 *
 * vscode hover widget only support color style in <span></span>
 * https://github.com/microsoft/vscode/blob/6d2920473c6f13759c978dd89104c4270a83422d/src/vs/base/browser/markdownRenderer.ts#L296
 * @param value string
 * @returns MarkdownString | string
 */
export function genMarkdownString(value: string): string {
  const hexColor = getColorTokenValue(value);

  return hexColor
    ? `<span style='background-color:${hexColor};'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;`
    : "";
}

export function getColorTokenValue(value: string): string {
  const stringValue = String(value);

  let result: string = "";
  if (/#[0-9a-fA-F]+/.test(stringValue)) {
    result = stringValue;
  } else if (stringValue.startsWith("rgb")) {
    result = `#${rgbHex(stringValue)}`;
  }

  return result;
}

export function getProjectPath(): string | undefined {
  const fileName = vscode.window.activeTextEditor?.document?.fileName;

  return vscode.workspace.workspaceFolders
    ?.map((folder) => folder.uri.fsPath)
    .filter((fsPath) => fileName?.startsWith(fsPath))[0];
}

function checkAntdInPackageJson(filePath: string): boolean {
  if (fs.existsSync(filePath)) {
    const packageJson = fs.readFileSync(filePath, "utf-8");
    if (packageJson.includes("antd") || packageJson.includes("rc-")) {
      return true;
    }
  }
  return false;
}

function checkAntdInDirectory(directory: string): boolean {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);

    if (fs.statSync(fullPath).isDirectory()) {
      if (checkAntdInDirectory(fullPath)) {
        return true;
      }
    } else if (file === "package.json") {
      if (checkAntdInPackageJson(fullPath)) {
        return true;
      }
    }
  }

  return false;
}

export function checkAntdProject(): boolean {
  const projectPath = getProjectPath();

  if (projectPath) {
    return checkAntdInDirectory(projectPath);
  }

  return false;
}
