# Country Files Setup

## 📁 File Location

All country JSON files are now stored in the `public/` directory of this Vite project.

### Current Files:
- `public/italien.json`
- `public/spanien.json`

## 🚀 How It Works

1. **File Access**: Country JSON files are served directly from the `public/` directory
2. **URL Paths**: Files are accessible at `/italien.json`, `/spanien.json`, etc.
3. **Simple Configuration**: No complex Vite configuration needed - public directory files are automatically served

## 📝 Adding New Countries

### Method 1: Using the App
1. Click "Neues Land" button in the header
2. Enter the country name
3. Click "Erstellen" - it copies from Italien with all example data
4. Click "💾 Speichern" to download the JSON file
5. Save the file to `public/{country}.json`
6. Click "🔄 Aktualisieren" to refresh the countries list

### Method 2: Manual Creation
1. Create a new file in `public/{country}.json`
2. Use the existing files as a template
3. Replace all country names and references
4. Refresh the app (F5)

## 🔄 Country Creation Features

- **Copies from Italien**: New countries are created by copying from `italien.json`
- **Smart Name Replacement**: All instances of "Italien"/"italien" are replaced with your new country name
- **Preserves Structure**: All sections, images, and content structure are maintained
- **URL Updates**: All URL references are automatically updated

## 🧹 Maintenance

- **Single Source**: Only maintain files in the `public/` directory
- **No Duplication**: Don't keep files in other directories
- **Easy Backup**: Just backup the `public/` directory to save all country data