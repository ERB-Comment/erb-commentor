// Import the VS Code extensibility API
const vscode = require("vscode");

/**
 * This method is called when your extension is activated.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Register the command defined in package.json
  const disposable = vscode.commands.registerCommand(
    "erb-commentor.toggleErbComment",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return; // Exit if no active editor

      const document = editor.document;
      const selections = editor.selections;

      editor.edit((editBuilder) => {
        selections.forEach((selection) => {
          if (!selection.isEmpty) {
            // Case 1: Selected text -> Wrap with <!-- -->
            handleSelectedText(document, editBuilder, selection);
          } else {
            // Case 2: No selection -> Handle single line
            handleSingleLine(document, editBuilder, selection);
          }
        });
      });
    }
  );

  context.subscriptions.push(disposable);
}

/**
 * Handle commenting/uncommenting for selected text.
 * @param {vscode.TextDocument} document
 * @param {vscode.TextEditorEdit} editBuilder
 * @param {vscode.Selection} selection
 */
function handleSelectedText(document, editBuilder, selection) {
  const range = new vscode.Range(selection.start, selection.end);
  const text = document.getText(range);
  const leadingWhitespace = text.match(/^\s*/)?.[0] || "";

  if (text.trim().startsWith("<!--") && text.trim().endsWith("-->")) {
    // Uncomment: Remove <!-- and -->
    const uncommented = text.trim().slice(4, -3).trim();
    editBuilder.replace(range, `${leadingWhitespace}${uncommented}`);
  } else {
    // Comment: Wrap with <!-- -->
    const commented = `${leadingWhitespace}<!-- ${text.trim()} -->`;
    editBuilder.replace(range, commented);
  }
}

function handleSingleLine(document, editBuilder, selection) {
  const line = document.lineAt(selection.start.line);
  const lineText = line.text;
  const cursorPos = selection.start.character;
  const leadingWS = lineText.match(/^\s*/)?.[0] || "";

  const startIndex = lineText.indexOf("<%");
  const endIndex = lineText.indexOf("%>");

  // 1) If there's NO ERB tag on this line, just do HTML comment toggle.
  if (startIndex === -1) {
    toggleHtmlComment(lineText, leadingWS, editBuilder, line);
    return;
  }

  // 2) If there's <% but NO %> on this line, treat it like multi-line ERB — just toggle <%#.
  if (endIndex === -1 || endIndex < startIndex) {
    toggleErbComment(lineText, editBuilder, line);
    return;
  }

  // 3) If we have BOTH <% and %> on this line, check if cursor is inside that range:
  const isInsideErb = cursorPos >= startIndex && cursorPos <= endIndex + 2;

  if (isInsideErb) {
    // Cursor is inside <...%> => Toggle <%# ... %>
    toggleErbComment(lineText, editBuilder, line);
  } else {
    // Cursor is outside => do HTML comment
    toggleHtmlComment(lineText, leadingWS, editBuilder, line);
  }
}

function toggleErbComment(lineText, editBuilder, line) {
  if (lineText.includes("<%#")) {
    // Already commented => remove '#'
    const uncommented = lineText.replace("<%#", "<%");
    editBuilder.replace(line.range, uncommented);
  } else {
    // Insert '#' right after <%
    // Regex covers <% or <%= or <%-, etc.
    const commented = lineText.replace(/<%=?-?/, "<%#");
    editBuilder.replace(line.range, commented);
  }
}

function toggleHtmlComment(lineText, leadingWS, editBuilder, line) {
  const trimmed = lineText.trim();

  if (trimmed.startsWith("<!--") && trimmed.endsWith("-->")) {
    // Already in <!-- --> => unwrap
    const uncommented = trimmed.slice(4, -3).trim();
    editBuilder.replace(line.range, leadingWS + uncommented);
  } else {
    // Wrap with <!-- -->
    const commented = `${leadingWS}<!-- ${trimmed} -->`;
    editBuilder.replace(line.range, commented);
  }
}

/**
 * This method is called when your extension is deactivated.
 */
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
