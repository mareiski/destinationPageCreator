# Country Files Setup

## 📁 File Location

All country JSON files are stored in the `public/` directory of this Vite project.

### Current Files:
- `public/italien.json`
- `public/spanien.json`

## 🚀 How It Works

### Frontend (Vite Dev Server)
- Country JSON files are served directly from the `public/` directory
- Files are accessible at `/italien.json`, `/spanien.json`, etc.
- Simple standard Vite configuration - no special setup needed

### Backend (API Server on port 3001)
- API endpoints (`/api/countries`, `/api/country/:country`, etc.) read from and write to the `public/` directory
- All file operations are performed on files in `public/`

## 📝 Adding New Countries

### Method 1: Using the App
1. Click "Neues Land" button in the header
2. Enter the country name
3. Click "Erstellen" - it copies from Italien with all example data
4. Click "💾 Speichern" to save via API (saves to `public/{country}.json`)
5. Click "🔄 Aktualisieren" to refresh the countries list

### Method 2: Manual Creation
1. Create a new file in `public/{country}.json`
2. Use the existing files as a template
3. Replace all country names and references
4. Restart the API server if running, or refresh the app (F5)

## 🔄 Country Creation Features

- **Copies from Italien**: New countries are created by copying from `italien.json`
- **Smart Name Replacement**: All instances of "Italien"/"italien" are replaced with your new country name
- **Preserves Structure**: All sections, images, and content structure are maintained
- **URL Updates**: All URL references are automatically updated

## 🧹 Maintenance

- **Single Source**: Only maintain files in the `public/` directory
- **No Duplication**: Don't keep files in other directories like `../page-content/`
- **Easy Backup**: Just backup the `public/` directory to save all country data
- **Server Restart**: If using API server, restart it after adding new files manually