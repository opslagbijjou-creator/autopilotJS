// DesignSystem.js - Design system management
class DesignSystemModule {
    constructor() {
        this.designSystems = {};
        this.currentSystem = null;
        this.init();
    }
    
    init() {
        this.loadDefaultDesignSystems();
        console.log('✅ Design System module initialized');
    }
    
    loadDefaultDesignSystems() {
        // Material Design System
        this.designSystems.material = {
            name: 'Material Design',
            description: 'Google\'s Material Design system',
            colors: {
                primary: '#6200ee',
                primaryVariant: '#3700b3',
                secondary: '#03dac6',
                secondaryVariant: '#018786',
                background: '#ffffff',
                surface: '#ffffff',
                error: '#b00020',
                onPrimary: '#ffffff',
                onSecondary: '#000000',
                onBackground: '#000000',
                onSurface: '#000000',
                onError: '#ffffff'
            },
            typography: {
                fontFamily: {
                    primary: "'Roboto', sans-serif",
                    secondary: "'Roboto Condensed', sans-serif"
                },
                scale: {
                    h1: '6rem',
                    h2: '3.75rem',
                    h3: '3rem',
                    h4: '2.125rem',
                    h5: '1.5rem',
                    h6: '1.25rem',
                    subtitle1: '1rem',
                    subtitle2: '0.875rem',
                    body1: '1rem',
                    body2: '0.875rem',
                    button: '0.875rem',
                    caption: '0.75rem',
                    overline: '0.625rem'
                }
            },
            shapes: {
                small: '4px',
                medium: '8px',
                large: '16px'
            },
            elevation: {
                level0: 'none',
                level1: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
                level2: '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
                level3: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)'
            }
        };
        
        // Apple iOS Design System
        this.designSystems.ios = {
            name: 'iOS Human Interface',
            description: 'Apple\'s Human Interface Guidelines',
            colors: {
                primary: '#007aff',
                secondary: '#5856d6',
                tertiary: '#ff2d55',
                background: '#f2f2f7',
                groupedBackground: '#f2f2f7',
                label: '#000000',
                secondaryLabel: '#3c3c43',
                tertiaryLabel: '#3c3c43',
                quaternaryLabel: '#3c3c43',
                systemFill: '#787880',
                secondarySystemFill: '#787880',
                tertiarySystemFill: '#787880',
                quaternarySystemFill: '#787880'
            },
            typography: {
                fontFamily: {
                    primary: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    code: 'SF Mono, Menlo, Monaco, Consolas, monospace'
                },
                scale: {
                    largeTitle: '34px',
                    title1: '28px',
                    title2: '22px',
                    title3: '20px',
                    headline: '17px',
                    body: '17px',
                    callout: '16px',
                    subhead: '15px',
                    footnote: '13px',
                    caption1: '12px',
                    caption2: '11px'
                }
            },
            shapes: {
                cornerRadius: '10px'
            },
            blur: {
                regular: 'saturate(180%) blur(20px)',
                thin: 'saturate(180%) blur(10px)',
                ultraThin: 'saturate(180%) blur(5px)'
            }
        };
        
        // Custom Design System (default)
        this.designSystems.custom = window.StateManager.getState().project.designSystem;
        
        this.currentSystem = 'custom';
    }
    
    applyDesignSystem(systemName) {
        const system = this.designSystems[systemName];
        if (!system) {
            console.error(`Design system "${systemName}" not found`);
            return false;
        }
        
        this.currentSystem = systemName;
        
        // Update project design system
        window.StateManager.setState({
            project: {
                ...window.StateManager.state.project,
                designSystem: system
            }
        });
        
        console.log(`✅ Applied design system: ${system.name}`);
        return true;
    }
    
    createCustomDesignSystem(name, baseSystem = 'custom') {
        const newSystem = {
            ...JSON.parse(JSON.stringify(this.designSystems[baseSystem])),
            name: name,
            id: 'ds_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        };
        
        this.designSystems[name.toLowerCase().replace(/\s+/g, '_')] = newSystem;
        return newSystem;
    }
    
    updateDesignSystem(updates) {
        if (!this.currentSystem) return false;
        
        const current = this.designSystems[this.currentSystem];
        const updated = this.deepMerge(current, updates);
        
        this.designSystems[this.currentSystem] = updated;
        
        // Update project
        window.StateManager.setState({
            project: {
                ...window.StateManager.state.project,
                designSystem: updated
            }
        });
        
        return true;
    }
    
    deepMerge(target, source) {
        const output = Object.assign({}, target);
        
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        
        return output;
    }
    
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
    
    generateCSSVariables() {
        const system = this.getCurrentSystem();
        if (!system) return '';
        
        let css = ':root {\n';
        
        // Colors
        Object.entries(system.colors).forEach(([name, value]) => {
            css += `  --color-${name}: ${value};\n`;
        });
        
        // Typography
        if (system.typography) {
            if (system.typography.fontFamily) {
                Object.entries(system.typography.fontFamily).forEach(([name, value]) => {
                    css += `  --font-${name}: ${value};\n`;
                });
            }
            
            if (system.typography.scale) {
                Object.entries(system.typography.scale).forEach(([name, value]) => {
                    css += `  --text-${name}: ${value};\n`;
                });
            }
        }
        
        // Spacing
        if (system.spacing) {
            Object.entries(system.spacing).forEach(([name, value]) => {
                css += `  --space-${name}: ${value};\n`;
            });
        }
        
        // Border radius
        if (system.borderRadius) {
            Object.entries(system.borderRadius).forEach(([name, value]) => {
                css += `  --radius-${name}: ${value};\n`;
            });
        }
        
        css += '}\n';
        return css;
    }
    
    generateThemeColors(baseColor) {
        const colors = {};
        
        // Generate color palette from base color
        const rgb = this.hexToRgb(baseColor);
        if (!rgb) return colors;
        
        // Primary shades
        colors.primary = baseColor;
        colors.primaryLight = this.adjustColor(rgb, 40, 40, 40);
        colors.primaryDark = this.adjustColor(rgb, -40, -40, -40);
        colors.primaryLighter = this.adjustColor(rgb, 80, 80, 80);
        colors.primaryDarker = this.adjustColor(rgb, -80, -80, -80);
        
        // Secondary (analogous)
        colors.secondary = this.analogousColor(rgb, 30);
        
        // Accent (complementary)
        colors.accent = this.complementaryColor(rgb);
        
        // Neutrals
        colors.neutral50 = '#fafafa';
        colors.neutral100 = '#f5f5f5';
        colors.neutral200 = '#e5e5e5';
        colors.neutral300 = '#d4d4d4';
        colors.neutral400 = '#a3a3a3';
        colors.neutral500 = '#737373';
        colors.neutral600 = '#525252';
        colors.neutral700 = '#404040';
        colors.neutral800 = '#262626';
        colors.neutral900 = '#171717';
        
        // Semantic colors
        colors.success = '#10b981';
        colors.warning = '#f59e0b';
        colors.error = '#ef4444';
        colors.info = '#3b82f6';
        
        return colors;
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    adjustColor(rgb, r, g, b) {
        return this.rgbToHex({
            r: Math.max(0, Math.min(255, rgb.r + r)),
            g: Math.max(0, Math.min(255, rgb.g + g)),
            b: Math.max(0, Math.min(255, rgb.b + b))
        });
    }
    
    analogousColor(rgb, angle) {
        const hsl = this.rgbToHsl(rgb);
        hsl.h = (hsl.h + angle) % 360;
        return this.hslToRgb(hsl);
    }
    
    complementaryColor(rgb) {
        const hsl = this.rgbToHsl(rgb);
        hsl.h = (hsl.h + 180) % 360;
        return this.hslToRgb(hsl);
    }
    
    rgbToHsl(rgb) {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return {
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    }
    
    hslToRgb(hsl) {
        return this.rgbToHex(this.hslToRgbObj(hsl));
    }
    
    hslToRgbObj(hsl) {
        const h = hsl.h / 360;
        const s = hsl.s / 100;
        const l = hsl.l / 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    rgbToHex(rgb) {
        return '#' + 
            ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b)
                .toString(16)
                .slice(1)
                .toUpperCase();
    }
    
    getCurrentSystem() {
        return this.designSystems[this.currentSystem] || this.designSystems.custom;
    }
    
    getAllSystems() {
        return Object.entries(this.designSystems).map(([id, system]) => ({
            id,
            name: system.name,
            description: system.description
        }));
    }
    
    exportDesignSystem(format = 'json') {
        const system = this.getCurrentSystem();
        
        switch (format) {
            case 'json':
                return JSON.stringify(system, null, 2);
                
            case 'css':
                return this.generateCSSVariables();
                
            case 'tailwind':
                return this.generateTailwindConfig(system);
                
            default:
                return JSON.stringify(system, null, 2);
        }
    }
    
    generateTailwindConfig(system) {
        let config = `module.exports = {
  theme: {
    extend: {
      colors: {\n`;
      
      // Colors
      Object.entries(system.colors).forEach(([name, value]) => {
        config += `        '${name}': '${value}',\n`;
      });
      
      config += `      },
      fontFamily: {\n`;
      
      // Fonts
      if (system.typography?.fontFamily) {
        Object.entries(system.typography.fontFamily).forEach(([name, value]) => {
          config += `        '${name}': [${value.split(',').map(f => f.trim())}],\n`;
        });
      }
      
      config += `      },
      fontSize: {\n`;
      
      // Font sizes
      if (system.typography?.scale) {
        Object.entries(system.typography.scale).forEach(([name, value]) => {
          config += `        '${name}': '${value}',\n`;
        });
      }
      
      config += `      },
      borderRadius: {\n`;
      
      // Border radius
      if (system.borderRadius) {
        Object.entries(system.borderRadius).forEach(([name, value]) => {
          config += `        '${name}': '${value}',\n`;
        });
      }
      
      config += `      }
    }
  }
}`;
      
      return config;
    }
    
    importDesignSystem(data, format = 'json') {
        try {
            let system;
            
            switch (format) {
                case 'json':
                    system = typeof data === 'string' ? JSON.parse(data) : data;
                    break;
                    
                case 'css':
                    system = this.parseCSSVariables(data);
                    break;
                    
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
            
            // Validate system
            if (!system.name || !system.colors) {
                throw new Error('Invalid design system format');
            }
            
            const systemId = system.name.toLowerCase().replace(/\s+/g, '_');
            this.designSystems[systemId] = system;
            this.currentSystem = systemId;
            
            return system;
            
        } catch (error) {
            console.error('Failed to import design system:', error);
            throw error;
        }
    }
    
    parseCSSVariables(css) {
        const system = {
            name: 'Imported System',
            colors: {},
            typography: {
                fontFamily: {},
                scale: {}
            }
        };
        
        const lines = css.split('\n');
        lines.forEach(line => {
            const match = line.match(/--([\w-]+):\s*(.+);/);
            if (match) {
                const [, name, value] = match;
                
                if (name.startsWith('color-')) {
                    const colorName = name.replace('color-', '');
                    system.colors[colorName] = value.trim();
                } else if (name.startsWith('font-')) {
                    const fontName = name.replace('font-', '');
                    system.typography.fontFamily[fontName] = value.trim();
                } else if (name.startsWith('text-')) {
                    const sizeName = name.replace('text-', '');
                    system.typography.scale[sizeName] = value.trim();
                }
            }
        });
        
        return system;
    }
    
    generateComponentStyles(componentType) {
        const system = this.getCurrentSystem();
        const styles = {};
        
        switch (componentType) {
            case 'button':
                styles.button = {
                    backgroundColor: system.colors.primary,
                    color: system.colors.onPrimary,
                    padding: '12px 24px',
                    borderRadius: system.shapes?.medium || '8px',
                    border: 'none',
                    fontSize: system.typography?.scale?.button || '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                };
                break;
                
            case 'input':
                styles.input = {
                    border: `1px solid ${system.colors.border || '#e2e8f0'}`,
                    borderRadius: system.shapes?.small || '4px',
                    padding: '12px',
                    fontSize: system.typography?.scale?.body || '16px',
                    backgroundColor: system.colors.background,
                    color: system.colors.onBackground,
                    outline: 'none'
                };
                break;
                
            case 'card':
                styles.card = {
                    backgroundColor: system.colors.surface || system.colors.background,
                    borderRadius: system.shapes?.medium || '8px',
                    padding: '20px',
                    boxShadow: system.elevation?.level1 || '0 2px 4px rgba(0,0,0,0.1)'
                };
                break;
        }
        
        return styles;
    }
    
    validateContrast() {
        const system = this.getCurrentSystem();
        const issues = [];
        
        // Check text/background contrast
        if (system.colors.primary && system.colors.onPrimary) {
            const contrast = this.calculateContrast(
                this.hexToRgb(system.colors.primary),
                this.hexToRgb(system.colors.onPrimary)
            );
            
            if (contrast < 4.5) {
                issues.push({
                    type: 'contrast',
                    message: `Primary/onPrimary contrast ratio ${contrast.toFixed(2)} is below WCAG AA minimum (4.5)`,
                    elements: ['buttons', 'primary actions']
                });
            }
        }
        
        // Check text/background contrast
        if (system.colors.background && system.colors.onBackground) {
            const contrast = this.calculateContrast(
                this.hexToRgb(system.colors.background),
                this.hexToRgb(system.colors.onBackground)
            );
            
            if (contrast < 4.5) {
                issues.push({
                    type: 'contrast',
                    message: `Background/onBackground contrast ratio ${contrast.toFixed(2)} is below WCAG AA minimum (4.5)`,
                    elements: ['body text', 'main content']
                });
            }
        }
        
        return {
            issues,
            passes: issues.length === 0,
            score: Math.max(0, 100 - (issues.length * 20))
        };
    }
    
    calculateContrast(color1, color2) {
        if (!color1 || !color2) return 0;
        
        const luminance1 = this.calculateLuminance(color1);
        const luminance2 = this.calculateLuminance(color2);
        
        const brightest = Math.max(luminance1, luminance2);
        const darkest = Math.min(luminance1, luminance2);
        
        return (brightest + 0.05) / (darkest + 0.05);
    }
    
    calculateLuminance(color) {
        const sRGB = [color.r / 255, color.g / 255, color.b / 255];
        
        sRGB.forEach((c, i) => {
            if (c <= 0.03928) {
                sRGB[i] = c / 12.92;
            } else {
                sRGB[i] = Math.pow((c + 0.055) / 1.055, 2.4);
            }
        });
        
        return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    }
}

// Export module
window.DesignSystemModule = DesignSystemModule;