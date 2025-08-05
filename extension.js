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
  const lines = text.split('\n');

  // Loop through all lines and handle each one
  const processedLines = lines.map(line => {
    // Check if line is already commented
    if (line.includes('<%#')) {
      // Uncomment: Check if it's HTML wrapped in ERB comment
      if (line.match(/<%#\s*<.*>\s*%>/)) {
        // HTML wrapped in ERB: remove <%# and %>
        return line.replace(/<%#\s*(.*?)\s*%>/, '$1');
      } else {
        // ERB comment: remove <%# prefix only
        return line.replace(/<%#\s*/, '');
      }
    } else {
      // Comment: Check if line has ERB tags
      if (line.includes('<%')) {
        // ERB line: add <%# prefix
        return line.replace(/<%=?-?/, "<%# $&");
      } else if (line.trim().length > 0) {
        // HTML line: wrap with <%# %>
        const leadingWS = line.match(/^\s*/)?.[0] || "";
        return `${leadingWS}<%# ${line.trim()} %>`;
      }
      return line; // Empty line
    }
  });

  editBuilder.replace(range, processedLines.join('\n'));
}

function handleSingleLine(document, editBuilder, selection) {
  const line = document.lineAt(selection.start.line);
  const lineText = line.text;
  const cursorPos = selection.start.character;
  const leadingWS = lineText.match(/^\s*/)?.[0] || "";

  // Check if line is already commented first
  if (lineText.includes('<%#')) {
    toggleHtmlComment(lineText, leadingWS, editBuilder, line);
    return;
  }

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
    // Already commented => remove the <%# prefix
    const uncommented = lineText.replace("<%# ", "");
    editBuilder.replace(line.range, uncommented);
  } else {
    // Insert '<%# ' as prefix before the existing ERB tag
    const commented = lineText.replace(/<%=?-?/, "<%# $&");
    editBuilder.replace(line.range, commented);
  }
}

function toggleHtmlComment(lineText, leadingWS, editBuilder, line) {
  // Use the exact same logic as handleSelectedText
  if (lineText.includes('<%#')) {
    // Check if it's HTML wrapped in ERB comment (same regex as handleSelectedText)
    if (lineText.match(/<%#\s*<.*>\s*%>/)) {
      // HTML wrapped in ERB: remove <%# and %> (same regex as handleSelectedText)
      const uncommented = lineText.replace(/<%#\s*(.*?)\s*%>/, '$1');
      editBuilder.replace(line.range, uncommented);
    } else {
      // ERB comment: remove <%# prefix only (same logic as handleSelectedText)
      const uncommented = lineText.replace(/<%#\s*/, '');
      editBuilder.replace(line.range, uncommented);
    }
  } else {
    // Wrap with <%# %>
    const trimmed = lineText.trim();
    const commented = `${leadingWS}<%# ${trimmed} %>`;
    editBuilder.replace(line.range, commented);
  }
}

/**
 * This method is called when your extension is deactivated.
 */
function deactivate() { }

module.exports = {
  activate,
  deactivate,
};
