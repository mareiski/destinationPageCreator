// Country Configuration Editor Configuration

// API base URL
export const API_BASE_URL = '/api';

// Helper function to create a slug from country name
export function createSlug(countryName: string): string {
  return countryName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Default template for new countries
export function getDefaultTemplate(countryName: string): string {
  return JSON.stringify({
    "country_name": countryName,
    "hero": {
      "eyebrow": "Reiseguide & Community",
      "title": `${countryName} entdecken`,
      "description": `Erfahre mehr über die Vielfalt von ${countryName} - von beeindruckenden Landschaften bis zu kulturellen Highlights.`,
      "image": {
        "url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1170&auto=format&fit=crop",
        "alt": `${countryName} Landschaft`
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
      "kicker": `${countryName} Reiseführer`,
      "title": `Urlaub in ${countryName}: Zwischen Natur und Kultur`,
      "paragraphs": [
        `${countryName} bietet eine einzigartige Mischung aus Natur, Kultur und Geschichte.`,
        `Hier findest du einen Überblick über beliebte Reiseziele und praktische Hinweise zur Reiseplanung.`
      ],
      "image": {
        "url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=687&auto=format&fit=crop",
        "alt": `Landschaft in ${countryName}`
      }
    },
    "image_strip": [],
    "regions": {
      "kicker": "Reiseziele",
      "title": "Die beliebtesten Regionen",
      "description": `${countryName} besteht aus vielen verschiedenen Regionen, die jeweils ihren eigenen Charme haben.`,
      "items": []
    },
    "community": {
      "kicker": "Community",
      "title": `Aktuelle Beiträge über ${countryName}`,
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
      "description": `Nicht jeder ${countryName}-Urlaub sieht gleich aus.`,
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
      "title": `Praktische Tipps für deine ${countryName}-Reise`,
      "description": "Tipps und Hinweise für die Reiseplanung.",
      "items": []
    },
    "guide": {
      "kicker": `${countryName} Reiseführer`,
      "title": `${countryName} Urlaub planen: Was du vor der Reise wissen solltest`,
      "content": []
    },
    "faq": {
      "kicker": "Häufige Fragen",
      "title": `${countryName} FAQ`,
      "description": `Antworten auf häufige Fragen rund um Urlaub und Reise in ${countryName}.`,
      "items": []
    },
    "breadcrumb": {
      "home_label": "Startseite"
    },
    "seo": {
      "description": `Reiseguide für ${countryName} mit Informationen zu Regionen, Reisezielen und Community-Beiträgen.`,
      "tourist_types": ["Leisure Travelers", "Families", "Adventure Travelers", "Cultural Travelers"],
      "same_as": []
    }
  }, null, 2);
}
