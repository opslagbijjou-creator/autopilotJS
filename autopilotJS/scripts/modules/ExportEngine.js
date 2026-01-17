// ExportEngine.js - Multi-format export system
class ExportModule {
    constructor() {
        this.formats = {
            html: 'HTML/CSS/JS',
            react: 'React',
            vue: 'Vue.js',
            angular: 'Angular',
            nextjs: 'Next.js',
            flutter: 'Flutter',
            reactnative: 'React Native'
        };
        
        this.exporters = {};
        this.init();
    }
    
    init() {
        this.registerExporters();
        console.log('✅ Export module initialized');
    }
    
    registerExporters() {
        // HTML Exporter
        this.exporters.html = {
            name: 'Static HTML',
            description: 'Export as static HTML, CSS and JavaScript files',
            icon: 'fa-html5',
            export: async (project) => {
                return await this.exportAsHTML(project);
            }
        };
        
        // React Exporter
        this.exporters.react = {
            name: 'React',
            description: 'Export as React components with hooks',
            icon: 'fab fa-react',
            export: async (project) => {
                return await this.exportAsReact(project);
            }
        };
        
        // Vue Exporter
        this.exporters.vue = {
            name: 'Vue 3',
            description: 'Export as Vue 3 components with Composition API',
            icon: 'fab fa-vuejs',
            export: async (project) => {
                return await this.exportAsVue(project);
            }
        };
        
        // Next.js Exporter
        this.exporters.nextjs = {
            name: 'Next.js',
            description: 'Export as Next.js pages with SSR',
            icon: 'fa-server',
            export: async (project) => {
                return await this.exportAsNextJS(project);
            }
        };
    }
    
    async exportProject(format = 'html', settings = {}) {
        const exporter = this.exporters[format];
        if (!exporter) {
            throw new Error(`Exporter for format "${format}" not found`);
        }
        
        const project = window.StateManager.getState().project;
        return await exporter.export(project, settings);
    }
    
    async exportAsHTML(project, settings = {}) {
        const files = {};
        
        // Generate HTML
        files['index.html'] = this.generateHTML(project, settings);
        
        // Generate CSS
        files['styles.css'] = this.generateCSS(project, settings);
        
        // Generate JavaScript
        files['app.js'] = this.generateJavaScript(project, settings);
        
        // Generate asset files if any
        const assets = this.extractAssets(project);
        assets.forEach((asset, index) => {
            files[`assets/asset-${index}.${asset.type}`] = asset.content;
        });
        
        return files;
    }
    
    generateHTML(project, settings) {
        const designSystem = project.designSystem;
        
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name}</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            /* Design System Tokens */
            ${this.generateDesignTokens(designSystem)}
        }
    </style>
</head>
<body>
    <div id="app">
`;
        
        // Generate screens
        project.screens.forEach((screen, index) => {
            const isActive = index === 0 ? 'active' : '';
            
            html += `
        <!-- ${screen.name} Screen -->
        <div class="screen ${isActive}" id="${screen.id}" data-screen-id="${screen.id}">
            <div class="screen-content">
`;
            
            // Generate components
            screen.components.forEach(component => {
                html += this.generateComponentHTML(component, designSystem);
            });
            
            html += `
            </div>
        </div>
`;
        });
        
        html += `
    </div>
    
    <script src="app.js"></script>
</body>
</html>`;
        
        return html;
    }
    
    generateComponentHTML(component, designSystem) {
        let html = '';
        const style = this.generateComponentStyle(component, designSystem);
        
        switch (component.type) {
            case 'text':
                html = `
                <div class="component text-component" id="${component.id}" style="${style}">
                    ${component.text || ''}
                </div>`;
                break;
                
            case 'button':
                const targetScreen = component.targetScreenId ? `data-target="${component.targetScreenId}"` : '';
                html = `
                <button class="component button-component" id="${component.id}" ${targetScreen} style="${style}">
                    ${component.text || 'Button'}
                </button>`;
                break;
                
            case 'input':
                html = `
                <input type="${component.inputType || 'text'}" 
                       class="component input-component" 
                       id="${component.id}"
                       placeholder="${component.placeholder || 'Enter text...'}"
                       value="${component.value || ''}"
                       style="${style}">`;
                break;
                
            case 'image':
                if (component.src) {
                    html = `
                    <img src="${component.src}" 
                         alt="${component.alt || 'Image'}" 
                         class="component image-component" 
                         id="${component.id}"
                         style="${style}">`;
                } else {
                    html = `
                    <div class="component image-component placeholder" id="${component.id}" style="${style}">
                        <i class="fas fa-image"></i>
                        <span>Image</span>
                    </div>`;
                }
                break;
                
            case 'container':
                html = `
                <div class="component container-component" id="${component.id}" style="${style}">
                    ${component.text || ''}
`;
                
                if (component.children) {
                    component.children.forEach(child => {
                        html += this.generateComponentHTML(child, designSystem);
                    });
                }
                
                html += `
                </div>`;
                break;
                
            default:
                html = `
                <div class="component ${component.type}-component" id="${component.id}" style="${style}">
                    ${component.text || component.type}
                </div>`;
        }
        
        return html;
    }
    
    generateComponentStyle(component, designSystem) {
        const styles = [];
        
        // Position and size
        styles.push(`position: absolute;`);
        styles.push(`left: ${component.x}px;`);
        styles.push(`top: ${component.y}px;`);
        styles.push(`width: ${component.width}px;`);
        styles.push(`height: ${component.height}px;`);
        
        // Custom styles
        if (component.styles) {
            Object.entries(component.styles).forEach(([property, value]) => {
                if (value && value !== 'undefined' && value !== 'null') {
                    styles.push(`${property}: ${value};`);
                }
            });
        }
        
        return styles.join(' ');
    }
    
    generateDesignTokens(designSystem) {
        let tokens = '';
        
        // Colors
        Object.entries(designSystem.colors).forEach(([category, values]) => {
            if (typeof values === 'object') {
                Object.entries(values).forEach(([name, value]) => {
                    tokens += `--color-${category}-${name}: ${value};\n`;
                });
            } else {
                tokens += `--color-${category}: ${values};\n`;
            }
        });
        
        // Typography
        Object.entries(designSystem.typography.fontFamily).forEach(([name, value]) => {
            tokens += `--font-${name}: ${value};\n`;
        });
        
        Object.entries(designSystem.typography.scale).forEach(([name, value]) => {
            tokens += `--text-${name}: ${value};\n`;
        });
        
        // Spacing
        designSystem.spacing.scale.forEach((value, index) => {
            tokens += `--space-${index}: ${value}rem;\n`;
        });
        
        // Border radius
        Object.entries(designSystem.borderRadius).forEach(([name, value]) => {
            tokens += `--radius-${name}: ${value};\n`;
        });
        
        return tokens;
    }
    
    generateCSS(project, settings) {
        const designSystem = project.designSystem;
        
        return `/* ${project.name} - Generated by autopilotJS PRO */
:root {
    ${this.generateDesignTokens(designSystem)}
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-sans);
    background: var(--color-background-primary);
    color: var(--color-text-primary);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

#app {
    width: 390px;
    height: 844px;
    background: white;
    border-radius: 32px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* Screens */
.screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.screen.active {
    display: block;
    opacity: 1;
}

.screen-content {
    position: relative;
    width: 100%;
    height: 100%;
}

/* Components */
.component {
    box-sizing: border-box;
}

/* Text Components */
.text-component {
    color: var(--color-text-primary);
    font-family: inherit;
    word-wrap: break-word;
    white-space: pre-wrap;
    user-select: none;
}

/* Button Components */
.button-component {
    border: none;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}

.button-component:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Input Components */
.input-component {
    border: 1px solid var(--color-border-light);
    background: var(--color-background-primary);
    font-family: inherit;
    padding: 0 12px;
    color: var(--color-text-primary);
    outline: none;
    transition: border-color 0.2s;
}

.input-component:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.input-component::placeholder {
    color: var(--color-text-tertiary);
}

/* Image Components */
.image-component {
    background: var(--color-background-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.image-component img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-component.placeholder {
    color: var(--color-text-tertiary);
    font-size: 14px;
    flex-direction: column;
    gap: 8px;
}

.image-component.placeholder i {
    font-size: 32px;
}

/* Container Components */
.container-component {
    background: var(--color-background-secondary);
    border: 2px dashed var(--color-border-medium);
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
}

/* Navigation */
.navigation {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 1000;
}

.nav-button {
    padding: 10px 20px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 500;
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.fade-in {
    animation: fadeIn 0.3s ease;
}

.slide-in {
    animation: slideIn 0.3s ease;
}

/* Responsive */
@media (max-width: 390px) {
    body {
        padding: 0;
    }
    
    #app {
        width: 100%;
        height: 100vh;
        border-radius: 0;
    }
}

/* Print Styles */
@media print {
    .screen {
        position: relative;
        display: block !important;
        opacity: 1 !important;
        page-break-after: always;
    }
    
    .button-component {
        border: 1px solid #000;
    }
}
`;
    }
    
    generateJavaScript(project, settings) {
        return `// ${project.name} - Generated by autopilotJS PRO
document.addEventListener('DOMContentLoaded', function() {
    // Get all screens
    const screens = document.querySelectorAll('.screen');
    const buttons = document.querySelectorAll('.button-component');
    
    // Navigation system
    class Navigation {
        constructor() {
            this.currentScreen = null;
            this.history = [];
            this.init();
        }
        
        init() {
            // Show first screen by default
            if (screens.length > 0) {
                this.showScreen(screens[0].id);
            }
            
            // Setup button navigation
            buttons.forEach(button => {
                const targetScreenId = button.getAttribute('data-target');
                if (targetScreenId) {
                    button.addEventListener('click', () => {
                        this.showScreen(targetScreenId);
                    });
                }
            });
            
            // Add navigation controls if multiple screens
            if (screens.length > 1) {
                this.createNavigationControls();
            }
        }
        
        showScreen(screenId) {
            // Hide all screens
            screens.forEach(screen => {
                screen.classList.remove('active');
            });
            
            // Show target screen
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
                this.currentScreen = screenId;
                
                // Add to history
                this.history.push(screenId);
                if (this.history.length > 10) {
                    this.history.shift();
                }
                
                // Dispatch event
                window.dispatchEvent(new CustomEvent('screenchange', {
                    detail: { screenId }
                }));
            }
        }
        
        goBack() {
            if (this.history.length > 1) {
                this.history.pop(); // Remove current
                const previousScreen = this.history.pop();
                if (previousScreen) {
                    this.showScreen(previousScreen);
                }
            }
        }
        
        createNavigationControls() {
            const navContainer = document.createElement('div');
            navContainer.className = 'navigation';
            
            // Back button
            const backButton = document.createElement('button');
            backButton.className = 'nav-button';
            backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back';
            backButton.addEventListener('click', () => this.goBack());
            
            // Screen selector
            const screenSelect = document.createElement('select');
            screenSelect.className = 'nav-select';
            
            screens.forEach(screen => {
                const option = document.createElement('option');
                option.value = screen.id;
                option.textContent = screen.querySelector('.screen-name')?.textContent || screen.id;
                if (screen.id === this.currentScreen) {
                    option.selected = true;
                }
                screenSelect.appendChild(option);
            });
            
            screenSelect.addEventListener('change', (e) => {
                this.showScreen(e.target.value);
            });
            
            navContainer.appendChild(backButton);
            navContainer.appendChild(screenSelect);
            document.body.appendChild(navContainer);
        }
    }
    
    // Form handling
    const forms = document.querySelectorAll('.input-component, .textarea-component, .select-component');
    forms.forEach(form => {
        form.addEventListener('input', function() {
            // Save to localStorage
            localStorage.setItem('form_' + this.id, this.value);
        });
        
        // Load saved values
        const savedValue = localStorage.getItem('form_' + form.id);
        if (savedValue) {
            form.value = savedValue;
        }
    });
    
    // Image lazy loading
    const images = document.querySelectorAll('.image-component img');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        if (img.dataset.src) {
            imageObserver.observe(img);
        }
    });
    
    // Interactive elements
    const interactiveButtons = document.querySelectorAll('.button-component:not([data-target])');
    interactiveButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 200);
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('buttonclick', {
                detail: { 
                    buttonId: this.id,
                    text: this.textContent 
                }
            }));
        });
    });
    
    // Initialize navigation
    const navigation = new Navigation();
    
    // Make navigation available globally
    window.appNavigation = navigation;
    
    // Analytics event tracking
    window.trackEvent = function(eventName, data = {}) {
        console.log('Event:', eventName, data);
        // Add your analytics code here
        // Example: Google Analytics, Mixpanel, etc.
    };
    
    // Initial event
    trackEvent('app_loaded', {
        screenCount: screens.length,
        componentCount: document.querySelectorAll('.component').length
    });
    
    console.log('${project.name} loaded successfully!');
    console.log('Screens:', screens.length);
    console.log('Components:', document.querySelectorAll('.component').length);
});
`;
    }
    
    async exportAsReact(project, settings = {}) {
        const files = {};
        
        // Generate package.json
        files['package.json'] = this.generateReactPackageJSON(project);
        
        // Generate main App component
        files['src/App.jsx'] = this.generateReactApp(project);
        
        // Generate components
        files['src/components/index.js'] = this.generateReactComponentsIndex(project);
        
        // Generate screens
        project.screens.forEach((screen, index) => {
            files[`src/screens/${this.toPascalCase(screen.name)}.jsx`] = 
                this.generateReactScreen(screen, project);
        });
        
        // Generate styles
        files['src/styles/global.css'] = this.generateReactStyles(project);
        
        // Generate utilities
        files['src/utils/navigation.js'] = this.generateReactNavigation(project);
        
        return files;
    }
    
    generateReactPackageJSON(project) {
        return `{
  "name": "${project.name.toLowerCase().replace(/\\s+/g, '-')}",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`;
    }
    
    generateReactApp(project) {
        const screenImports = project.screens.map(screen => 
            `import ${this.toPascalCase(screen.name)} from './screens/${this.toPascalCase(screen.name)}';`
        ).join('\n');
        
        const screenRoutes = project.screens.map((screen, index) => {
            const isDefault = index === 0;
            return `      ${isDefault ? '' : '// '}<Route path="/${screen.name.toLowerCase().replace(/\\s+/g, '-')}" element={<${this.toPascalCase(screen.name)} />} />`;
        }).join('\n');
        
        return `import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';
${screenImports}

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/${project.screens[0].name.toLowerCase().replace(/\s+/g, '-')}" replace />} />
${screenRoutes}
        </Routes>
      </div>
    </Router>
  );
}

export default App;`;
    }
    
    generateReactScreen(screen, project) {
        const components = screen.components.map(component => {
            return this.generateReactComponent(component, project.designSystem);
        }).join('\n');
        
        return `import React from 'react';
import './styles/screen.css';

const ${this.toPascalCase(screen.name)} = () => {
  return (
    <div className="screen ${screen.name.toLowerCase().replace(/\s+/g, '-')}">
      <div className="screen-content">
${components}
      </div>
    </div>
  );
};

export default ${this.toPascalCase(screen.name)};`;
    }
    
    generateReactComponent(component, designSystem) {
        const style = this.generateReactComponentStyle(component, designSystem);
        
        switch (component.type) {
            case 'text':
                return `        <div className="component text" style={${style}}>
          ${component.text || ''}
        </div>`;
                
            case 'button':
                return `        <button className="component button" style={${style}}>
          ${component.text || 'Button'}
        </button>`;
                
            default:
                return `        <div className="component ${component.type}" style={${style}}>
          ${component.text || component.type}
        </div>`;
        }
    }
    
    generateReactComponentStyle(component, designSystem) {
        const style = {
            position: 'absolute',
            left: `${component.x}px`,
            top: `${component.y}px`,
            width: `${component.width}px`,
            height: `${component.height}px`
        };
        
        if (component.styles) {
            Object.entries(component.styles).forEach(([key, value]) => {
                const reactKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                style[reactKey] = value;
            });
        }
        
        return JSON.stringify(style, null, 2).replace(/"([^"]+)":/g, '$1:');
    }
    
    toPascalCase(str) {
        return str.replace(/\w+/g, function(w) {
            return w[0].toUpperCase() + w.slice(1).toLowerCase();
        }).replace(/\s+/g, '');
    }
    
    generateReactStyles(project) {
        return this.generateCSS(project);
    }
    
    generateReactNavigation(project) {
        return `// Navigation utilities for ${project.name}
export const navigateToScreen = (screenId, history) => {
  const screen = screenId.toLowerCase().replace(/\\s+/g, '-');
  history.push(\`/\${screen}\`);
};

export const goBack = (history) => {
  history.goBack();
};

export const getCurrentScreen = (location) => {
  return location.pathname.substring(1).replace('-', ' ');
};`;
    }
    
    generateReactComponentsIndex(project) {
        const componentNames = [...new Set(project.screens.flatMap(screen => 
            screen.components.map(comp => comp.type)
        ))];
        
        return componentNames.map(type => 
            `export { default as ${this.toPascalCase(type)} } from './${this.toPascalCase(type)}';`
        ).join('\n');
    }
    
    async exportAsVue(project, settings = {}) {
        const files = {};
        
        // Generate Vue files
        files['src/App.vue'] = this.generateVueApp(project);
        files['src/main.js'] = this.generateVueMain(project);
        
        // Generate components
        project.screens.forEach(screen => {
            files[`src/components/${this.toPascalCase(screen.name)}.vue`] = 
                this.generateVueComponent(screen, project);
        });
        
        return files;
    }
    
    generateVueApp(project) {
        const screenComponents = project.screens.map(screen => 
            this.toPascalCase(screen.name)
        ).join(', ');
        
        const screenRoutes = project.screens.map(screen => {
            const path = screen.name.toLowerCase().replace(/\s+/g, '-');
            return `    { path: '/${path}', component: ${this.toPascalCase(screen.name)} }`;
        }).join(',\n');
        
        return `<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'

export default defineComponent({
  name: 'App',
  components: {
    RouterView
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>`;
    }
    
    extractAssets(project) {
        const assets = [];
        
        project.screens.forEach(screen => {
            screen.components.forEach(component => {
                if (component.type === 'image' && component.src) {
                    // In a real implementation, you would fetch the image data
                    // For now, we'll return placeholder
                    assets.push({
                        type: 'jpg',
                        content: '// Placeholder for image asset'
                    });
                }
            });
        });
        
        return assets;
    }
    
    createZip(files) {
        return new Promise((resolve, reject) => {
            const zip = new JSZip();
            
            Object.entries(files).forEach(([path, content]) => {
                zip.file(path, content);
            });
            
            zip.generateAsync({ type: 'blob' })
                .then(resolve)
                .catch(reject);
        });
    }
    
    downloadZip(files, filename = 'project.zip') {
        this.createZip(files).then(blob => {
            saveAs(blob, filename);
        });
    }
}

// Export module
window.ExportModule = ExportModule;