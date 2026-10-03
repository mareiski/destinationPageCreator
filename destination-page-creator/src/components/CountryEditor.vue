<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { createSlug, getDefaultTemplate } from '../config';
import CountryPreview from './CountryPreview.vue';

// State
const countries = ref<string[]>([]);
const selectedCountry = ref<string>('');
const pageData = ref<any>(null);
const isLoading = ref<boolean>(false);
const errorMessage = ref<string>('');
const successMessage = ref<string>('');
const showNewCountryModal = ref<boolean>(false);
const newCountryName = ref<string>('');
const activeFieldPath = ref<string[]>([]);
const editedText = ref<string>('');
const editDialogVisible = ref<boolean>(false);

// Computed properties
const countryList = computed(() => {
  return countries.value.sort();
});

// Timeout for fetch requests to prevent hanging
const fetchWithTimeout = async (url: string, options: any = {}, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Function to start editing a field
const startEdit = (fieldPath: string[], currentValue: string) => {
  activeFieldPath.value = fieldPath;
  editedText.value = currentValue || '';
  editDialogVisible.value = true;
};

// Save edited field
const saveEditedField = () => {
  if (!activeFieldPath.value.length || !pageData.value) return;
  
  let current: any = pageData.value;
  
  // Navigate to the field to update
  for (let i = 0; i < activeFieldPath.value.length - 1; i++) {
    const key = activeFieldPath.value[i];
    if (current[key] === undefined) {
      current[key] = {};
    }
    current = current[key];
  }
  
  // Update the final field
  const finalKey = activeFieldPath.value[activeFieldPath.value.length - 1];
  current[finalKey] = editedText.value;
  
  // Update the pageData to trigger reactivity
  pageData.value = { ...pageData.value };
  
  editDialogVisible.value = false;
  activeFieldPath.value = [];
  editedText.value = '';
  
  // Show success message
  successMessage.value = 'Änderungen gespeichert';
  setTimeout(() => {
    successMessage.value = '';
  }, 2000);
};

// Load countries from local files (no server required in development)
const loadCountries = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    // Use API endpoint if available (when server is running)
    try {
      // Try multiple API endpoints
      const apiEndpoints = [
        '/api/countries',
        'http://localhost:3001/api/countries',
        'http://localhost:3002/api/countries'
      ];
      
      for (const endpoint of apiEndpoints) {
        try {
          const response = await fetchWithTimeout(endpoint, {}, 2000);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.countries) {
              countries.value = data.countries.sort();
              console.log('Loaded countries from API:', endpoint, countries.value);
              return;
            }
          }
        } catch (apiError) {
          // Try next endpoint
          continue;
        }
      }
    } catch (error) {
      console.log('API not available, trying direct file access...');
    }
    
    // Check for country files in the public directory
    const commonCountries = ['italien', 'spanien', 'frankreich', 'oesterreich', 'schweiz', 'beispiel', 'test'];
    const foundCountries: string[] = [];
    
    for (const country of commonCountries) {
      try {
        // Only check in public directory now
        const path = `/${country}.json`;
        const response = await fetchWithTimeout(path, {}, 1000);
        if (response.ok) {
          foundCountries.push(country);
          console.log(`Found country file: ${country}.json`);
        }
      } catch (error) {
        // File doesn't exist, ignore
        console.log(`Country file not found: ${country}.json`);
      }
    }
    
    if (foundCountries.length > 0) {
      countries.value = foundCountries.sort();
      console.log('Found countries:', countries.value);
      return;
    }
    
    // Fallback to default
    console.log('Using default country list');
    countries.value = ['italien'];
    
  } catch (error) {
    console.error('Error loading countries:', error);
    errorMessage.value = 'Keine Länder gefunden';
    countries.value = ['italien'];
  } finally {
    isLoading.value = false;
    console.log('Countries loading completed:', countries.value);
  }
};

// Load country JSON data directly from file
const loadCountryData = async (countryName: string) => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    console.log(`Starting to load data for country: ${countryName}`);
    selectedCountry.value = countryName;
    
    // Try API first if available
    try {
      console.log(`Trying API for country data: /api/country/${countryName}`);
      const response = await fetchWithTimeout(`/api/country/${countryName}`, {}, 3000);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.content) {
          const parsedData = JSON.parse(data.content);
          console.log(`API returned ${Object.keys(parsedData).length} keys for ${countryName}`);
          pageData.value = parsedData;
          console.log('Loaded country data from API:', countryName);
          return;
        }
      }
    } catch (error) {
      console.log('API not available, trying direct file access...:', error);
    }
    
    // Try to fetch the JSON file directly from public directory
    try {
      console.log(`Attempting to fetch: /${countryName}.json`);
      // Only use public directory now - simplest approach
      const paths = [
        `/${countryName}.json`,  // Direct from public directory
        `http://localhost:5173/${countryName}.json`,  // Direct Vite server
      ];
      
      for (const filePath of paths) {
        try {
          console.log(`Trying to fetch: ${filePath}`);
          const response = await fetchWithTimeout(filePath, {}, 1500);
          if (response.ok) {
            const content = await response.text();
            const parsedData = JSON.parse(content);
            console.log(`Successfully loaded data from ${filePath}, keys:`, Object.keys(parsedData));
            pageData.value = parsedData;
            console.log(`Loaded country data from: ${filePath}`);
            return;
          } else {
            console.log(`Response ${response.status} from: ${filePath}`);
          }
        } catch (pathError) {
          // Try next path
          console.log(`Failed to fetch from: ${filePath} - ${pathError}`);
          continue;
        }
      }
    } catch (error) {
      console.log('Could not fetch JSON file directly:', error);
    }
    
    // Fallback: create template
    console.log('Using template for:', countryName);
    try {
      const templateData = JSON.parse(getDefaultTemplate(countryName));
      console.log('Template created with keys:', Object.keys(templateData));
      console.log('Template country_name:', templateData.country_name);
      pageData.value = templateData;
    } catch (templateError) {
      console.error('Error parsing template:', templateError);
      errorMessage.value = `Fehler beim Erstellen der Vorlage: ${templateError}`;
    }
    
  } catch (error) {
    console.error('Error loading country data:', error);
    errorMessage.value = `Fehler beim Laden: ${error}`;
    try {
      const templateData = JSON.parse(getDefaultTemplate(countryName));
      console.log('Fallback to template with keys:', Object.keys(templateData));
      pageData.value = templateData;
    } catch (templateError) {
      console.error('Error parsing fallback template:', templateError);
    }
    selectedCountry.value = countryName;
  } finally {
    isLoading.value = false;
    console.log('Country data loading completed. pageData set:', !!pageData.value);
  }
};

// Save country JSON data to file
const saveCountryData = async () => {
  try {
    if (!selectedCountry.value || !pageData.value) {
      errorMessage.value = 'Bitte wähle ein Land aus.';
      return;
    }
    
    isLoading.value = true;
    errorMessage.value = '';
    successMessage.value = '';
    
    const content = JSON.stringify(pageData.value, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    
    // In development, we can use the file system access if available
    // For now, we'll use the API if available, otherwise provide download
    try {
      const response = await fetchWithTimeout(`/api/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: selectedCountry.value,
          content: content
        }),
      }, 5000);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          successMessage.value = result.message || `Datei gespeichert!`;
          
          // Refresh countries
          await loadCountries();
          
          setTimeout(() => {
            successMessage.value = '';
          }, 3000);
          return;
        }
      }
    } catch (apiError) {
      console.log('API save failed, trying file save...');
    }
    
    // Fallback: Create download link for manual save
    // This allows saving in development without server
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedCountry.value}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    successMessage.value = 'Datei wurde als Download gespeichert!';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
    
  } catch (error) {
    console.error('Error saving country data:', error);
    errorMessage.value = `Fehler beim Speichern: ${error}`;
  } finally {
    isLoading.value = false;
  }
};

// Function to deep clone an object and replace country names
function replaceCountryNamesInData(data: any, oldName: string, newName: string, newSlug: string): any {
  if (!data) return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => replaceCountryNamesInData(item, oldName, newName, newSlug));
  }
  
  // Handle objects
  if (typeof data === 'object' && !Array.isArray(data)) {
    const newObj: any = {};
    for (const [key, value] of Object.entries(data)) {
      let newValue = value;
      
      // Replace values that match the old country name (case-insensitive)
      if (typeof value === 'string') {
        // Handle the country_name field specially - use the new name as provided
        if (key === 'country_name') {
          newValue = newName;
        } else {
          // For other fields, replace all variations of the old name
          // First, try to match the old name exactly (case sensitive)
          let replacedValue = value;
          
          // Replace exact matches of the old name
          const oldNameRegex = new RegExp(oldName, 'gi');
          replacedValue = replacedValue.replace(oldNameRegex, newName);
          
          // Also handle slugs in URLs (like #italien, italien.json, etc.)
          const oldSlug = createSlug(oldName);
          const slugRegex = new RegExp(oldSlug, 'gi');
          replacedValue = replacedValue.replace(slugRegex, newSlug);
          
          // Handle the old name in different cases (e.g., "Italien" vs "italien")
          // Try to match common variations
          const variations = [
            oldName.charAt(0).toUpperCase() + oldName.slice(1), // "Italien"
            oldName.toLowerCase(), // "italien"
            oldName.toUpperCase(), // "ITALIEN"
          ];
          
          for (const variation of variations) {
            if (variation !== oldName) {
              const variationRegex = new RegExp(variation, 'gi');
              replacedValue = replacedValue.replace(variationRegex, 
                newName.charAt(0).toUpperCase() + newName.slice(1));
            }
          }
          
          newValue = replacedValue;
        }
      } else if (typeof value === 'object') {
        newValue = replaceCountryNamesInData(value, oldName, newName, newSlug);
      }
      
      newObj[key] = newValue;
    }
    return newObj;
  }
  
  return data;
}

// Function to copy data from an existing country
async function copyCountryData(sourceCountry: string, newName: string): Promise<any> {
  try {
    // Try to load the source country data from public directory
    const path = `/${sourceCountry}.json`;
    
    try {
      const response = await fetchWithTimeout(path, {}, 2000);
      if (response.ok) {
        const content = await response.text();
        const sourceData = JSON.parse(content);
        const newSlug = createSlug(newName);
        
        // Replace all country names in the data
        return replaceCountryNamesInData(sourceData, sourceCountry, newName, newSlug);
      }
    } catch (error) {
      console.log(`Could not load source country ${sourceCountry} from ${path}:`, error);
    }
    
    // If we can't find the source country, fall back to template
    console.log(`Could not find source country ${sourceCountry}, using template`);
    return JSON.parse(getDefaultTemplate(newName));
    
  } catch (error) {
    console.error('Error copying country data:', error);
    return JSON.parse(getDefaultTemplate(newName));
  }
}

// Create new country
const createNewCountry = async () => {
  if (!newCountryName.value.trim()) {
    errorMessage.value = 'Bitte gib einen Ländernamen ein.';
    return;
  }
  
  const countrySlug = createSlug(newCountryName.value);
  const countryDisplayName = newCountryName.value;
  
  try {
    isLoading.value = true;
    
    // Try to copy from an existing country (italien) instead of using template
    const copiedData = await copyCountryData('italien', newCountryName.value);
    
    pageData.value = copiedData;
    selectedCountry.value = countrySlug;
    countries.value = [...new Set([...countries.value, countrySlug])].sort();
    showNewCountryModal.value = false;
    newCountryName.value = '';
    
    successMessage.value = `Neues Land "${countryDisplayName}" erstellt (basierend auf Italien)`;
  } catch (error) {
    console.error('Error creating new country:', error);
    errorMessage.value = `Fehler beim Erstellen des neuen Landes: ${error}`;
    
    // Fallback to template if copying fails
    pageData.value = JSON.parse(getDefaultTemplate(countrySlug));
    selectedCountry.value = countrySlug;
    countries.value = [...new Set([...countries.value, countrySlug])].sort();
    showNewCountryModal.value = false;
    newCountryName.value = '';
    successMessage.value = `Neues Land "${countryDisplayName}" erstellt`;
  } finally {
    isLoading.value = false;
    setTimeout(() => {
      successMessage.value = '';
    }, 2000);
  }
};

// Delete country
const deleteCountry = async () => {
  if (!selectedCountry.value) {
    errorMessage.value = 'Bitte wähle ein Land zum Löschen aus.';
    return;
  }
  
  if (!confirm(`Möchtest du die Datei ${selectedCountry.value}.json wirklich löschen?`)) {
    return;
  }
  
  try {
    isLoading.value = true;
    
    try {
      const response = await fetchWithTimeout(`/api/country/${selectedCountry.value}`, {
        method: 'DELETE',
      }, 3000);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          successMessage.value = result.message || `Datei gelöscht`;
          
          // Remove from list and clear selection
          countries.value = countries.value.filter(c => c !== selectedCountry.value);
          selectedCountry.value = '';
          pageData.value = null;
          
          setTimeout(() => {
            successMessage.value = '';
          }, 3000);
          return;
        }
      }
    } catch (apiError) {
      console.log('API delete failed');
    }
    
    // Fallback: just remove from UI
    countries.value = countries.value.filter(c => c !== selectedCountry.value);
    selectedCountry.value = '';
    pageData.value = null;
    successMessage.value = 'Land aus der Liste entfernt';
    
    setTimeout(() => {
      successMessage.value = '';
    }, 2000);
    
  } catch (error) {
    console.error('Error deleting country:', error);
    errorMessage.value = `Fehler beim Löschen: ${error}`;
  } finally {
    isLoading.value = false;
  }
};

// Handle country selection
const handleCountrySelect = (country: string) => {
  console.log(`Country selected: ${country}, current selected: ${selectedCountry.value}`);
  if (selectedCountry.value === country) {
    console.log(`Country ${country} is already selected, forcing reload`);
    // Force reload by clearing and reloading
    pageData.value = null;
  }
  loadCountryData(country);
};

// Refresh countries list
const refreshCountries = async () => {
  await loadCountries();
};

// Format country name for display
const formatCountryName = (name: string) => {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase());
};

// Check if current country exists
const isNewCountry = computed(() => {
  return selectedCountry.value && !countries.value.includes(selectedCountry.value);
});

// Auto-save functionality
const autoSaveTimeout = ref<any>(null);

// Watch for changes and auto-save
// Disabled for now to prevent spamming
// watch(() => pageData.value, (newVal) => {
//   if (autoSaveTimeout.value) {
//     clearTimeout(autoSaveTimeout.value);
//   }
//   if (selectedCountry.value) {
//     autoSaveTimeout.value = setTimeout(() => {
//       saveCountryData();
//     }, 3000);
//   }
// }, { deep: true });

// Clean up timeout on unmount
onUnmounted(() => {
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value);
  }
});

// Initialize
onMounted(async () => {
  console.log('CountryEditor mounted');
  
  try {
    await loadCountries();
    console.log('Countries loaded:', countries.value);
    
    // If we have countries, load the first one
    if (countries.value.length > 0) {
      console.log('Loading first country:', countries.value[0]);
      await loadCountryData(countries.value[0]);
      console.log('First country loaded, pageData:', pageData.value ? 'set' : 'not set');
    } else {
      // If no countries exist, create a default one
      console.log('Creating default country');
      pageData.value = JSON.parse(getDefaultTemplate('italien'));
      selectedCountry.value = 'italien';
      countries.value = ['italien'];
    }
  } catch (error) {
    console.error('Error during initialization:', error);
    // Fallback to default
    pageData.value = JSON.parse(getDefaultTemplate('italien'));
    selectedCountry.value = 'italien';
    countries.value = ['italien'];
  }
  
  // Final safety check - ensure pageData is always set
  if (!pageData.value) {
    console.log('No pageData after initialization, setting default');
    pageData.value = JSON.parse(getDefaultTemplate('italien'));
    selectedCountry.value = 'italien';
    if (!countries.value.includes('italien')) {
      countries.value = [...countries.value, 'italien'].sort();
    }
  }
  
  // Add a simple test to check if preview works
  console.log('Initialization complete. pageData:', pageData.value ? 'set' : 'not set');
  console.log('selectedCountry:', selectedCountry.value);
  console.log('countries:', countries.value);
  
  // Debug: Log the actual content of pageData
  if (pageData.value) {
    console.log('Final pageData country_name:', pageData.value.country_name);
    console.log('Final pageData keys:', Object.keys(pageData.value));
  }
  
  // If still no data, set a minimal test object
  if (!pageData.value) {
    console.log('Setting test data as fallback');
    pageData.value = {
      country_name: 'Testland',
      hero: {
        eyebrow: 'Test',
        title: 'Test Land entdecken',
        description: 'Dies ist ein Test.',
        image: {
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=687&auto=format&fit=crop',
          alt: 'Testbild'
        },
        buttons: []
      },
      breadcrumb: {
        home_label: 'Startseite'
      }
    };
  }
  
  // Set debug data for simple preview testing
  if (!pageData.value || !pageData.value.country_name) {
    console.log('Using hardcoded test data');
    pageData.value = {
      country_name: 'Testland',
      hero: {
        eyebrow: 'Test Reiseguide',
        title: 'Testland entdecken',
        description: 'Dies ist eine Testbeschreibung für die Vorschau.',
        image: {
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1170&auto=format&fit=crop',
          alt: 'Testland Landschaft'
        },
        buttons: [
          { label: 'Mehr erfahren', url: '#' }
        ]
      },
      breadcrumb: {
        home_label: 'Startseite'
      }
    };
    selectedCountry.value = 'testland';
  }
});
</script>

<template>
  <div class="country-editor">
    <!-- Header -->
    <header class="editor-header">
      <div class="header-content">
        <h1>Länder-Konfiguration - Live Vorschau</h1>
        <p class="subtitle">Bearbeite Inhalte direkt in der Vorschau</p>
      </div>
      
      <div class="header-actions">
        <button 
          @click="showNewCountryModal = true"
          class="btn btn-primary"
          :disabled="isLoading"
        >
          <span>+ Neues Land</span>
        </button>
        <button 
          @click="refreshCountries"
          class="btn btn-secondary"
          :disabled="isLoading"
          title="Länderliste aktualisieren"
        >
          <span>🔄 Aktualisieren</span>
        </button>
        <button 
          @click="saveCountryData"
          class="btn btn-success"
          :disabled="isLoading || !selectedCountry || !pageData"
        >
          <span v-if="isLoading">💾 Speichern...</span>
          <span v-else>💾 Speichern</span>
        </button>
        <button 
          v-if="selectedCountry && !isNewCountry"
          @click="deleteCountry"
          class="btn btn-danger"
          :disabled="isLoading"
          title="Aktuelle Datei löschen"
        >
          <span>🗑️ Löschen</span>
        </button>
      </div>
    </header>

    <div class="editor-container">
      <!-- Country Selection Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-content">
          <h3>Länder auswählen</h3>
          <div class="country-list">
            <div 
              v-for="country in countryList" 
              :key="country"
              class="country-item"
              :class="{ active: selectedCountry === country }"
              @click="handleCountrySelect(country)"
            >
              <span class="country-name">{{ formatCountryName(country) }}</span>
              <span class="country-file">{{ country }}.json</span>
            </div>
            <div v-if="selectedCountry && isNewCountry" class="country-item new">
              <span class="country-name">{{ formatCountryName(selectedCountry) }}</span>
              <span class="country-file">{{ selectedCountry }}.json (neu)</span>
            </div>
          </div>
          
          <div v-if="selectedCountry" class="sidebar-info">
            <div class="info-item">
              <strong>Aktuelles Land:</strong>
              <span>{{ formatCountryName(selectedCountry) }}</span>
            </div>
            <div class="info-item">
              <strong>Dateiname:</strong>
              <span>{{ selectedCountry }}.json</span>
            </div>
          </div>
          
          <div class="sidebar-hint">
            <p><strong>💡 Tipp:</strong></p>
            <p>Klicke auf jeden Text oder jedes Bild in der Vorschau, um es zu bearbeiten.</p>
          </div>
        </div>
      </aside>

      <!-- Main Preview Area -->
      <main class="preview-area">
        <div v-if="!selectedCountry" class="no-country-selected">
          <h3>Kein Land ausgewählt</h3>
          <p>Wähle ein Land aus der Liste aus oder erstelle ein neues Land.</p>
        </div>
        
        <div v-else-if="!pageData" class="loading-preview">
          <div class="loading-spinner"></div>
          <p>Lade Daten für: {{ selectedCountry || 'unbekannt' }}...</p>
        </div>
        
        <div v-else class="preview-container">
          <!-- Live Preview -->
          <CountryPreview 
            :page-data="pageData" 
            @edit-field="startEdit"
          />
        </div>
      </main>
    </div>

    <!-- Edit Dialog -->
    <div v-if="editDialogVisible" class="modal-overlay" @click.self="editDialogVisible = false">
      <div class="edit-dialog">
        <h3>Text bearbeiten</h3>
        <textarea 
          v-model="editedText" 
          class="edit-textarea"
          placeholder="Gib den neuen Text ein..."
          @keyup.ctrl.enter="saveEditedField"
          @keyup.esc="editDialogVisible = false"
        ></textarea>
        <div class="dialog-actions">
          <button @click="editDialogVisible = false" class="btn btn-secondary">
            Abbrechen
          </button>
          <button @click="saveEditedField" class="btn btn-primary" :disabled="!editedText.trim()">
            Speichern
          </button>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="messages-container">
      <div v-if="errorMessage" class="message error">
        ❌ {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="message success">
        ✅ {{ successMessage }}
      </div>
    </div>

    <!-- New Country Modal -->
    <div v-if="showNewCountryModal" class="modal-overlay" @click.self="showNewCountryModal = false">
      <div class="modal">
        <h3>Neues Land erstellen</h3>
        <p>Gib den Namen für das neue Land ein (wird automatisch zu einer URL-freundlichen Slug umgewandelt):</p>
        <p class="modal-hint">Das neue Land wird basierend auf "Italien" erstellt, mit allen Beispiel-Daten aber dem neuen Namen. Datei wird im public-Verzeichnis gespeichert.</p>
        
        <input 
          v-model="newCountryName" 
          type="text" 
          placeholder="z.B. Spanien, Frankreich, Österreich"
          class="form-input"
          @keyup.enter="createNewCountry"
          :disabled="isLoading"
        />
        
        <div class="modal-actions">
          <button @click="showNewCountryModal = false" class="btn btn-secondary" :disabled="isLoading">
            Abbrechen
          </button>
          <button 
            @click="createNewCountry" 
            class="btn btn-primary"
            :disabled="!newCountryName.trim() || isLoading"
          >
            <span v-if="isLoading">Erstellen...</span>
            <span v-else>Erstellen</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<style scoped>
.country-editor {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 30px;
  background: linear-gradient(135deg, #17372b 0%, #2d5a47 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.header-content .subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 0.95rem;
}


.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.editor-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 320px;
  background: white;
  border-right: 1px solid #e4e9e6;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-content {
  padding: 20px;
}

.sidebar-content h3 {
  color: #17221d;
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.country-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.country-item {
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  border: 2px solid transparent;
}

.country-item:hover {
  background-color: #f8fafc;
  border-color: #e2e8f0;
}

.country-item.active {
  background-color: #17372b;
  color: white;
  border-color: #17372b;
}

.country-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.country-file {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 2px;
}

.country-item.new .country-name {
  color: #22c55e;
}

.sidebar-info {
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.info-item strong {
  color: #66736d;
}

.sidebar-hint {
  padding: 15px;
  background: #e0f7fa;
  border-radius: 8px;
  color: #006064;
  font-size: 0.85rem;
}

.sidebar-hint p {
  margin: 0 0 5px 0;
}

.preview-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7f6;
}

.preview-container {
  max-width: 1180px;
  margin: 0 auto;
}



.no-country-selected,
.loading-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: #66736d;
}

.loading-preview {
  gap: 15px;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #17372b;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2d5a47;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #17372b;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-success {
  background: #22c55e;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #16a34a;
  transform: translateY(-1px);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Messages */
.messages-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.message.error {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.message.success {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal,
.edit-dialog {
  background: white;
  padding: 30px;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.2s ease-out;
}

.modal-hint {
  color: #64748b;
  font-size: 0.85rem;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 6px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal h3,
.edit-dialog h3 {
  margin: 0 0 10px 0;
  color: #17221d;
  font-size: 1.25rem;
}

.modal p {
  color: #64748b;
  margin-bottom: 20px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 20px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #17372b;
  box-shadow: 0 0 0 3px rgba(23, 55, 43, 0.1);
}

.edit-textarea {
  width: 100%;
  min-height: 200px;
  padding: 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 20px;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.edit-textarea:focus {
  outline: none;
  border-color: #17372b;
  box-shadow: 0 0 0 3px rgba(23, 55, 43, 0.1);
}

.dialog-actions,
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Loading Spinner */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top-color: #17372b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Responsive */
@media (max-width: 1024px) {
  .editor-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e4e9e6;
  }
  
  .sidebar-content {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    align-items: stretch;
  }
  
  .country-list {
    flex-direction: row;
    flex-wrap: wrap;
    max-height: none;
  }
  
  .country-item {
    width: calc(33.333% - 8px);
    min-width: 200px;
  }
  
  .sidebar-info,
  .sidebar-hint {
    flex: 1;
    min-width: 250px;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions .btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .header-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .country-item {
    width: calc(50% - 8px);
  }
  
  .sidebar-content {
    flex-direction: column;
  }
  
  .sidebar-info,
  .sidebar-hint {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .country-item {
    width: 100%;
  }
  
  .messages-container {
    bottom: 10px;
    right: 10px;
    left: 10px;
    max-width: calc(100% - 20px);
  }
  
  .message {
    font-size: 0.85rem;
    padding: 10px;
  }
}
</style>
