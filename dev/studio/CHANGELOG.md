# URPC Studio Changelog

## [Latest] - Server Selection Improvements

### 🚀 New Features
- **Server Dropdown Selection**: Added dropdown menu for quick server selection
- **Auto-Connect**: Selecting a server from dropdown automatically connects
- **Default Server**: Changed default server to Hono Basic Example (`https://hono-basic-example.uni-labs.org`)

### 🔧 Fixed
- Fixed default connection URL not using the correct initial value
- Fixed manual input requiring additional connect button click
- Improved server selection UX with visual feedback

### 📝 Changes
- Default server changed from `http://localhost:3000` to `https://hono-basic-example.uni-labs.org`
- Added predefined server options in dropdown
- Server selection now auto-connects without manual connect button click
- Improved input field styling with integrated dropdown button

### 🎯 Usage
1. **Quick Selection**: Click the dropdown arrow next to server input to select from predefined servers
2. **Auto-Connect**: Selected servers automatically connect without needing to click "Connect"
3. **Manual Input**: Still supports manual URL input with Enter key or Connect button
4. **Visual Feedback**: Selected server shows a checkmark in the dropdown

### 🔗 Available Servers
- **Hono Basic Example** (default): `https://hono-basic-example.uni-labs.org`
- **Custom URLs**: Support for any URPC-compatible server 