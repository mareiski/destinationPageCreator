import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Path to page-content directory (one level up from destination-page-creator)
const pageContentPath = path.join(__dirname, '..', 'page-content');

// Ensure page-content directory exists
if (!fs.existsSync(pageContentPath)) {
  fs.mkdirSync(pageContentPath, { recursive: true });
  console.log(`Created page-content directory at: ${pageContentPath}`);
}

// Serve static files from the page-content directory
app.use('/page-content', express.static(pageContentPath));

// API: Get list of countries (JSON files in page-content)
app.get('/api/countries', (req, res) => {
  try {
    const files = fs.readdirSync(pageContentPath);
    const countries = files
      .filter(file => file.endsWith('.json') && !file.startsWith('.'))
      .map(file => file.replace('.json', ''))
      .sort();
    
    console.log(`API: Countries list requested - found ${countries.length} countries`);
    res.json({ 
      success: true, 
      countries 
    });
  } catch (error) {
    console.error('Error reading countries:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Fehler beim Laden der Länderliste' 
    });
  }
});

// API: Get country JSON file
app.get('/api/country/:country', (req, res) => {
  try {
    const { country } = req.params;
    const filePath = path.join(pageContentPath, `${country}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`API: Country file not found: ${country}.json`);
      return res.status(404).json({ 
        success: false, 
        error: 'Datei nicht gefunden' 
      });
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log(`API: Country file loaded: ${country}.json`);
    res.json({ 
      success: true, 
      content 
    });
  } catch (error) {
    console.error('Error reading country file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Fehler beim Lesen der Datei' 
    });
  }
});

// API: Save country JSON file
app.post('/api/save', (req, res) => {
  try {
    const { country, content } = req.body;
    
    if (!country || !content) {
      console.log('API: Save request missing country or content');
      return res.status(400).json({ 
        success: false, 
        error: 'Land und Inhalt sind erforderlich' 
      });
    }
    
    // Validate JSON
    try {
      JSON.parse(content);
    } catch (e) {
      console.log('API: Invalid JSON content');
      return res.status(400).json({ 
        success: false, 
        error: 'Ungültiges JSON: ' + e.message 
      });
    }
    
    const filePath = path.join(pageContentPath, `${country}.json`);
    
    // Write file
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`API: Saved country file: ${country}.json`);
    
    res.json({ 
      success: true, 
      message: `Datei ${country}.json erfolgreich gespeichert` 
    });
  } catch (error) {
    console.error('Error saving country file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Fehler beim Speichern der Datei: ' + error.message 
    });
  }
});

// API: Delete country JSON file
app.delete('/api/country/:country', (req, res) => {
  try {
    const { country } = req.params;
    const filePath = path.join(pageContentPath, `${country}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`API: Country file to delete not found: ${country}.json`);
      return res.status(404).json({ 
        success: false, 
        error: 'Datei nicht gefunden' 
      });
    }
    
    fs.unlinkSync(filePath);
    console.log(`API: Deleted country file: ${country}.json`);
    
    res.json({ 
      success: true, 
      message: `Datei ${country}.json erfolgreich gelöscht` 
    });
  } catch (error) {
    console.error('Error deleting country file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Fehler beim Löschen der Datei' 
    });
  }
});

// API: Create new country with template
app.post('/api/new-country', (req, res) => {
  try {
    const { country } = req.body;
    
    if (!country) {
      console.log('API: New country request missing country name');
      return res.status(400).json({ 
        success: false, 
        error: 'Ländername ist erforderlich' 
      });
    }
    
    const filePath = path.join(pageContentPath, `${country}.json`);
    
    if (fs.existsSync(filePath)) {
      console.log(`API: Country file already exists: ${country}.json`);
      return res.status(400).json({ 
        success: false, 
        error: 'Datei existiert bereits' 
      });
    }
    
    // Create template
    const template = {
      "country_name": country,
      "hero": {
        "eyebrow": "Reiseguide & Community",
        "title": `${country} entdecken`,
        "description": `Erfahre mehr über die Vielfalt von ${country} - von beeindruckenden Landschaften bis zu kulturellen Highlights.`,
        "image": {
          "url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1170&auto=format&fit=crop",
          "alt": `${country} Landschaft`
        },
        "buttons": [
          {
            "label": "Regionen entdecken",
            "url": "#regionen"
          },
          {
            "label": "Beiträge lesen",
            "url": "#beitraege"
          }
        ]
      },
      "intro": {
        "kicker": `${country} Reiseführer`,
        "title": `Urlaub in ${country}: Zwischen Natur und Kultur`,
        "paragraphs": [
          `${country} bietet eine einzigartige Mischung aus Natur, Kultur und Geschichte.`,
          `Hier findest du einen Überblick über beliebte Reiseziele und praktische Hinweise zur Reiseplanung.`
        ],
        "image": {
          "url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=687&auto=format&fit=crop",
          "alt": `Landschaft in ${country}`
        }
      },
      "image_strip": [],
      "regions": {
        "kicker": "Reiseziele",
        "title": "Die beliebtesten Regionen",
        "description": `${country} besteht aus vielen verschiedenen Regionen, die jeweils ihren eigenen Charme haben.`,
        "items": []
      },
      "community": {
        "kicker": "Community",
        "title": `Aktuelle Beiträge über ${country}`,
        "description": "Reiseberichte, Erfahrungen und Tipps aus der Community.",
        "search": {
          "min_lat": 0,
          "min_lon": 0,
          "max_lat": 0,
          "max_lon": 0,
          "limit": 6
        }
      },
      "topics": {
        "kicker": "Reiseplanung",
        "title": "Nach Reisethema entdecken",
        "description": `Nicht jeder ${country}-Urlaub sieht gleich aus.`,
        "items": []
      },
      "destinations": {
        "kicker": "Beliebte Ziele",
        "title": "Diese Orte solltest du kennen",
        "description": `Einige Reiseziele eignen sich besonders gut als Ausgangspunkt.`,
        "items": []
      },
      "tips": {
        "kicker": "Reiseplanung",
        "title": `Praktische Tipps für deine ${country}-Reise`,
        "description": "Tipps und Hinweise für die Reiseplanung.",
        "items": []
      },
      "guide": {
        "kicker": `${country} Reiseführer`,
        "title": `${country} Urlaub planen: Was du vor der Reise wissen solltest`,
        "content": []
      },
      "faq": {
        "kicker": "Häufige Fragen",
        "title": `${country} FAQ`,
        "description": `Antworten auf häufige Fragen rund um Urlaub und Reise in ${country}.`,
        "items": []
      },
      "breadcrumb": {
        "home_label": "Startseite"
      },
      "seo": {
        "description": `Reiseguide für ${country} mit Informationen zu Regionen, Reisezielen und Community-Beiträgen.`,
        "tourist_types": ["Leisure Travelers", "Families", "Adventure Travelers", "Cultural Travelers"],
        "same_as": []
      }
    };
    
    fs.writeFileSync(filePath, JSON.stringify(template, null, 2), 'utf-8');
    console.log(`API: Created new country file: ${country}.json`);
    
    res.json({ 
      success: true, 
      message: `Datei ${country}.json erfolgreich erstellt`,
      template 
    });
  } catch (error) {
    console.error('Error creating new country:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Fehler beim Erstellen der Datei' 
    });
  }
});

// Serve the Vue app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Page content directory: ${pageContentPath}`);
  
  // Log available countries on startup
  try {
    const files = fs.readdirSync(pageContentPath);
    const countries = files.filter(file => file.endsWith('.json') && !file.startsWith('.'))
      .map(file => file.replace('.json', ''))
      .sort();
    console.log(`Available countries: ${countries.join(', ') || 'None'}`);
  } catch (error) {
    console.log('No countries found in page-content directory');
  }
});
