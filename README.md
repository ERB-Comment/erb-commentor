# ERB Snip Comment

A super-simple extension to toggle ERB comments or HTML comments in `.erb` files.

## Features

- **Toggle ERB comment**: Automatically insert `#` to turn `<%` into `<%#` (or remove it if it’s already there).
- **HTML comment toggle**: Wrap an entire line (or selected text) in `<!-- ... -->`.

## How It Works

- **Single-line**:  
  - If your cursor is inside `<% ... %>`, it toggles `<%#`.  
  - If your cursor is outside, it toggles `<!-- ... -->`.  
- **Multi-line ERB**:  
  - If `<%` is present on a line but there’s no closing `%>`, it treats it as multi-line and just toggles `<%#`.  

## Keybindings

- **Mac**: `Cmd + /`
- **Windows/Linux**: `Ctrl + /`

*(You can also run the command from the Command Palette by searching for "Toggle ERB Comment.")*

## Requirements

- **VS Code 1.96.0+** (as specified in `engines`).

## Installation

1. Install from the VS Code Marketplace (search for "**ERB Snip Comment**") or grab the `.vsix` file from Releases.
2. Open an `.erb` file and try `Cmd + /` or `Ctrl + /` to toggle comments!

## Release Notes

### 1.0.0
- Initial release with basic toggling for single and multi-line `.erb` code.
