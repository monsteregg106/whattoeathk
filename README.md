# 🍽️ What to Eat Tonight? - Fortune Food Finder

A bilingual (English/Traditional Chinese) web application that helps you decide what to eat by spinning a fortune wheel with different cuisine options.

## 🚀 Quick Start

### Option 1: Simple Local Server (Recommended)

To avoid CORS issues and run the project properly:

1. **Using Python (if you have Python installed):**
   ```bash
   # Navigate to your project folder
   cd "path/to/your/project"
   
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

2. **Using Node.js (if you have Node.js installed):**
   ```bash
   # Install a simple server globally
   npm install -g http-server
   
   # Navigate to your project folder and run
   http-server
   ```

3. **Using Live Server (VS Code extension):**
   - Install the "Live Server" extension in VS Code
   - Right-click on `index.html` and select "Open with Live Server"

4. **Open in browser:**
   - Go to `http://localhost:8000` (or the port shown in your terminal)
   - The app will work perfectly without CORS issues!

### Option 2: Direct File Opening (Limited)

You can open `index.html` directly in your browser, but:
- ⚠️ Some features may not work due to CORS restrictions
- ✅ The admin panel will still work with localStorage
- ✅ Your changes will be saved in the browser

## 🛠️ Admin Panel

Access the admin panel at: `http://localhost:8000/simple-admin/admin.html`

### Features:
- **Bilingual Content Management**: Edit both English and Chinese content
- **Real-time Updates**: Changes are automatically saved to browser storage
- **Wheel Customization**: Add/remove cuisine segments, change colors, icons
- **Popular Options**: Add popular dishes for each cuisine type
- **Character Customization**: Upload your own character image

### How to Use:
1. Make changes in the admin panel
2. Changes are automatically saved to browser storage
3. Refresh the main page to see updates
4. Use "Download Current Settings" to save permanently to `config.json`

## 📁 Project Structure

```
├── index.html              # Main application
├── script.js               # Fortune wheel logic
├── styles.css              # Styling
├── Cat.png                 # Default character image
├── simple-admin/
│   ├── admin.html          # Admin panel
│   ├── config.json         # Configuration file
│   └── config-loader.js    # Configuration loader
└── README.md               # This file
```

## 🌍 Bilingual Support

The app supports:
- **English (en)**: Default language
- **Traditional Chinese (zh_hk)**: Hong Kong Cantonese

Switch languages using the language toggle button in the header.

## 🔧 Configuration

The app uses a JSON configuration file (`simple-admin/config.json`) that contains:
- Header content (title, subtitle)
- Wheel segments (cuisines, colors, descriptions)
- Button text
- Popup content
- Character settings

## 🎨 Customization

### Adding New Cuisines:
1. Open the admin panel
2. Go to "Wheel Segments" section
3. Click "Add New Segment"
4. Fill in both English and Chinese names
5. Choose colors and add descriptions

### Changing Character:
1. In admin panel, go to "Character Image" section
2. Upload a new image (400×480px recommended)
3. The image will be automatically saved

### Popular Options:
1. Enable popular options for specific cuisines
2. Add popular dish names in both languages
3. These will appear in the result popup

## 🐛 Troubleshooting

### CORS Errors:
- **Problem**: "Access to fetch at 'file:///...' has been blocked by CORS policy"
- **Solution**: Use a local server (see Quick Start section)

### Changes Not Saving:
- **Problem**: Changes disappear when refreshing
- **Solution**: Make sure you're using the admin panel's auto-save feature or manually save changes

### Admin Panel Not Working:
- **Problem**: Can't access admin panel
- **Solution**: Make sure you're running from a server, not opening files directly

## 📱 Browser Compatibility

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (not recommended)

## 🎯 Features

- **Responsive Design**: Works on desktop and mobile
- **Smooth Animations**: Beautiful wheel spinning effects
- **Bilingual Interface**: Full English and Chinese support
- **Customizable Content**: Easy admin panel for content management
- **Popular Options**: Show popular dishes for each cuisine
- **Character System**: Customizable mascot character
- **Local Storage**: Changes persist between sessions

## 🤝 Contributing

Feel free to customize and improve this project! The code is well-commented and modular for easy modification.

## 📄 License

This project is open source and available under the MIT License.

