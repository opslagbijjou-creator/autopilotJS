// AIAssistant.js - AI-powered component generation
class AIModule {
    constructor() {
        this.apiKey = null;
        this.provider = 'openai';
        this.endpoint = 'https://api.openai.com/v1/chat/completions';
        this.isAvailable = false;
        this.init();
    }
    
    init() {
        // Check for API key in localStorage
        this.apiKey = localStorage.getItem('autopilotjs_ai_key');
        this.isAvailable = !!this.apiKey;
        
        if (this.isAvailable) {
            console.log('✅ AI module initialized with API key');
        } else {
            console.log('⚠️ AI module initialized without API key');
        }
    }
    
    setApiKey(key) {
        this.apiKey = key;
        this.isAvailable = !!key;
        localStorage.setItem('autopilotjs_ai_key', key);
    }
    
    async generateComponents(prompt, context = {}) {
        if (!this.isAvailable) {
            throw new Error('AI assistant requires an API key');
        }
        
        try {
            const systemPrompt = `You are a professional UI/UX designer and frontend developer. 
            Generate mobile app components based on the user's description.
            Return only valid JSON in this exact format:
            {
                "components": [
                    {
                        "type": "text|button|input|image|container",
                        "x": number,
                        "y": number,
                        "width": number,
                        "height": number,
                        "text": "string",
                        "styles": {
                            "property": "value"
                        },
                        "children": [] // for containers only
                    }
                ],
                "description": "Brief description of the generated design"
            }
            
            Guidelines:
            - Mobile screen is 390x844 pixels
            - Use appropriate spacing and alignment
            - Follow modern design principles
            - Make it practical and usable`;
            
            const userPrompt = `Create components for: ${prompt}
            
            Additional context:
            - Project theme: ${context.theme || 'modern'}
            - Color preference: ${context.colors || 'default'}
            - Style: ${context.style || 'clean'}`;
            
            const response = await this.callAI(systemPrompt, userPrompt);
            return this.parseAIResponse(response);
            
        } catch (error) {
            console.error('AI generation failed:', error);
            throw error;
        }
    }
    
    async callAI(systemPrompt, userPrompt) {
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });
        
        if (!response.ok) {
            throw new Error(`AI API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    parseAIResponse(response) {
        try {
            // Extract JSON from response (handling markdown code blocks)
            const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                             response.match(/```\n([\s\S]*?)\n```/) ||
                             response.match(/({[\s\S]*})/);
            
            if (jsonMatch) {
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                return JSON.parse(jsonStr);
            } else {
                throw new Error('No JSON found in AI response');
            }
        } catch (error) {
            console.error('Failed to parse AI response:', error, response);
            throw new Error('Invalid AI response format');
        }
    }
    
    generatePlaceholderComponents(prompt) {
        // Fallback placeholder generation when AI is not available
        const components = [];
        
        if (prompt.toLowerCase().includes('login')) {
            components.push(
                {
                    type: 'text',
                    x: 100,
                    y: 80,
                    width: 190,
                    height: 40,
                    text: 'Welcome Back',
                    styles: {
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#000000',
                        textAlign: 'center'
                    }
                },
                {
                    type: 'input',
                    x: 100,
                    y: 160,
                    width: 190,
                    height: 48,
                    placeholder: 'Email',
                    styles: {
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px'
                    }
                },
                {
                    type: 'input',
                    x: 100,
                    y: 230,
                    width: 190,
                    height: 48,
                    placeholder: 'Password',
                    styles: {
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px'
                    }
                },
                {
                    type: 'button',
                    x: 100,
                    y: 310,
                    width: 190,
                    height: 48,
                    text: 'Login',
                    styles: {
                        backgroundColor: '#6366f1',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontWeight: '600'
                    }
                }
            );
        } else if (prompt.toLowerCase().includes('dashboard')) {
            components.push(
                {
                    type: 'text',
                    x: 100,
                    y: 60,
                    width: 190,
                    height: 40,
                    text: 'Dashboard',
                    styles: {
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: '#000000'
                    }
                },
                {
                    type: 'container',
                    x: 100,
                    y: 140,
                    width: 150,
                    height: 80,
                    styles: {
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    },
                    children: [
                        {
                            type: 'text',
                            x: 0,
                            y: 0,
                            width: 118,
                            height: 24,
                            text: 'Revenue',
                            styles: {
                                fontSize: '16px',
                                color: '#64748b'
                            }
                        },
                        {
                            type: 'text',
                            x: 0,
                            y: 30,
                            width: 118,
                            height: 30,
                            text: '$12,458',
                            styles: {
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#000000'
                            }
                        }
                    ]
                },
                {
                    type: 'container',
                    x: 100,
                    y: 240,
                    width: 150,
                    height: 80,
                    styles: {
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    },
                    children: [
                        {
                            type: 'text',
                            x: 0,
                            y: 0,
                            width: 118,
                            height: 24,
                            text: 'Users',
                            styles: {
                                fontSize: '16px',
                                color: '#64748b'
                            }
                        },
                        {
                            type: 'text',
                            x: 0,
                            y: 30,
                            width: 118,
                            height: 30,
                            text: '1,234',
                            styles: {
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#000000'
                            }
                        }
                    ]
                }
            );
        } else {
            // Generic component
            components.push(
                {
                    type: 'text',
                    x: 100,
                    y: 100,
                    width: 190,
                    height: 40,
                    text: 'New Component',
                    styles: {
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#000000'
                    }
                },
                {
                    type: 'button',
                    x: 100,
                    y: 180,
                    width: 190,
                    height: 48,
                    text: 'Click Me',
                    styles: {
                        backgroundColor: '#6366f1',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontWeight: '600'
                    }
                }
            );
        }
        
        return {
            components,
            description: 'AI-generated components based on your description'
        };
    }
    
    async suggestImprovements(components) {
        if (!this.isAvailable) {
            return 'Add an API key to get AI suggestions';
        }
        
        try {
            const componentSummary = components.map(comp => 
                `${comp.type} at (${comp.x}, ${comp.y}) size ${comp.width}x${comp.height}`
            ).join(', ');
            
            const systemPrompt = `You are a UI/UX expert. Provide constructive feedback and suggestions for improving the design.`;
            const userPrompt = `I have these components: ${componentSummary}. 
            Please suggest improvements for better UX, accessibility, and visual design.`;
            
            const response = await this.callAI(systemPrompt, userPrompt);
            return response;
            
        } catch (error) {
            return 'Unable to generate suggestions at this time.';
        }
    }
    
    generateCode(components, framework = 'react') {
        // Generate code snippets for components
        let code = '';
        
        components.forEach(component => {
            code += this.generateComponentCode(component, framework) + '\n\n';
        });
        
        return code;
    }
    
    generateComponentCode(component, framework) {
        switch (framework) {
            case 'react':
                return this.generateReactCode(component);
            case 'vue':
                return this.generateVueCode(component);
            case 'html':
            default:
                return this.generateHTMLCode(component);
        }
    }
    
    generateReactCode(component) {
        const style = this.generateReactStyleObject(component);
        
        switch (component.type) {
            case 'text':
                return `const ${this.toPascalCase(component.text || 'Text')} = () => (
  <div style={${style}}>
    ${component.text || ''}
  </div>
);`;
                
            case 'button':
                return `const ${this.toPascalCase(component.text || 'Button')} = () => (
  <button style={${style}}>
    ${component.text || 'Button'}
  </button>
);`;
                
            default:
                return `const ${this.toPascalCase(component.type)} = () => (
  <div style={${style}}>
    ${component.text || component.type}
  </div>
);`;
        }
    }
    
    generateReactStyleObject(component) {
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
    
    generateVueCode(component) {
        const style = this.generateCSSStyle(component);
        
        return `<template>
  <div class="${component.type}-component" :style="style">
    ${component.text || ''}
  </div>
</template>

<script>
export default {
  name: '${this.toPascalCase(component.type)}',
  data() {
    return {
      style: ${JSON.stringify(style)}
    }
  }
}
</script>`;
    }
    
    generateHTMLCode(component) {
        const style = this.generateCSSStyle(component);
        
        return `<div class="${component.type}" style="${style}">
  ${component.text || ''}
</div>`;
    }
    
    generateCSSStyle(component) {
        const styles = [];
        
        styles.push(`position: absolute;`);
        styles.push(`left: ${component.x}px;`);
        styles.push(`top: ${component.y}px;`);
        styles.push(`width: ${component.width}px;`);
        styles.push(`height: ${component.height}px;`);
        
        if (component.styles) {
            Object.entries(component.styles).forEach(([key, value]) => {
                styles.push(`${key}: ${value};`);
            });
        }
        
        return styles.join(' ');
    }
    
    toPascalCase(str) {
        return str.replace(/\w+/g, function(w) {
            return w[0].toUpperCase() + w.slice(1).toLowerCase();
        }).replace(/\s+/g, '');
    }
    
    async analyzeDesign(components) {
        // Analyze design for common issues
        const issues = [];
        const suggestions = [];
        
        // Check for alignment
        const xPositions = components.map(c => c.x);
        const uniqueX = [...new Set(xPositions)];
        if (uniqueX.length > xPositions.length / 2) {
            issues.push('Inconsistent horizontal alignment');
            suggestions.push('Align components to a common grid (e.g., 8px increments)');
        }
        
        // Check for spacing
        components.forEach((comp, i) => {
            components.forEach((other, j) => {
                if (i !== j) {
                    const distance = Math.sqrt(
                        Math.pow(comp.x - other.x, 2) + 
                        Math.pow(comp.y - other.y, 2)
                    );
                    
                    if (distance < 20 && distance > 0) {
                        issues.push('Components too close together');
                        suggestions.push('Increase spacing between elements for better readability');
                    }
                }
            });
        });
        
        // Check for color contrast
        components.forEach(comp => {
            if (comp.styles?.color && comp.styles?.backgroundColor) {
                const textColor = this.hexToRgb(comp.styles.color);
                const bgColor = this.hexToRgb(comp.styles.backgroundColor);
                
                if (textColor && bgColor) {
                    const contrast = this.calculateContrast(textColor, bgColor);
                    if (contrast < 4.5) {
                        issues.push('Low color contrast may affect accessibility');
                        suggestions.push('Increase contrast between text and background colors');
                    }
                }
            }
        });
        
        return {
            issues,
            suggestions,
            score: Math.max(0, 100 - (issues.length * 10))
        };
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    calculateContrast(color1, color2) {
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
    
    generateColorPalette(baseColor = '#6366f1') {
        // Generate complementary color palette
        const rgb = this.hexToRgb(baseColor);
        if (!rgb) return [];
        
        const palette = [
            baseColor,
            this.adjustColor(rgb, 20, 20, 20), // lighter
            this.adjustColor(rgb, -20, -20, -20), // darker
            this.complementaryColor(rgb),
            this.analogousColor(rgb, 30),
            this.analogousColor(rgb, -30)
        ];
        
        return palette.map(color => this.rgbToHex(color));
    }
    
    adjustColor(rgb, r, g, b) {
        return {
            r: Math.max(0, Math.min(255, rgb.r + r)),
            g: Math.max(0, Math.min(255, rgb.g + g)),
            b: Math.max(0, Math.min(255, rgb.b + b))
        };
    }
    
    complementaryColor(rgb) {
        return {
            r: 255 - rgb.r,
            g: 255 - rgb.g,
            b: 255 - rgb.b
        };
    }
    
    analogousColor(rgb, angle) {
        // Convert to HSL, adjust hue, convert back
        const hsl = this.rgbToHsl(rgb);
        hsl.h = (hsl.h + angle) % 360;
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
}

// Export module
window.AIModule = AIModule;