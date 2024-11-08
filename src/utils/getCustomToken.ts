import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import axios from "axios";

export async function getCustomToken() {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const themeFilePath = await findThemeFile(rootPath);
    if (!themeFilePath) {
      vscode.window.showInformationMessage(
        "No token.config.ts or token.config.js file found,original token will be used for code completion"
      );
      return;
    }

    const tokenConfig = await readThemeFile(themeFilePath);
    let remoteToken;

    if (tokenConfig?.fetchParams) {
      const { url, params, handleRes } = tokenConfig.fetchParams;
      const response = await axios.get(url, { params });
      remoteToken = handleRes ? handleRes(response) : response;
    }

    return { ...(tokenConfig?.token || {}), ...(remoteToken || {}) };
  } catch (e) {
    vscode.window.showErrorMessage(
      "error occuur when try to get customToken,original token will be used for code completion"
    );
  }
}

async function readThemeFile(filePath: string): Promise<any> {
  const ext = path.extname(filePath);
  const content = await fs.promises.readFile(filePath, "utf-8");

  if (ext === ".ts") {
    const transpiled = ts.transpileModule(content, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    });
    return eval(transpiled.outputText);
  } else if (ext === ".js") {
    const func = new Function(content + "; return tokenConfig;");
    return func();
  }

  return null;
}

async function findThemeFile(dir: string): Promise<string | null> {
  const files = await fs.promises.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.promises.stat(fullPath);
    if (stat.isDirectory()) {
      // 跳过 node_modules 文件夹
      if (file === "node_modules") {
        continue;
      }
      const result = await findThemeFile(fullPath);
      if (result) {
        return result;
      }
    } else if (file === "token.config.ts" || file === "token.config.js") {
      return fullPath;
    }
  }
  return null;
}

function getValueByPath(obj: any, path: string[]) {
  if (!Array.isArray(path) || path.length === 0) {
    return obj;
  }
  let current = obj;
  for (const key of path) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[key];
  }
  return current;
}
