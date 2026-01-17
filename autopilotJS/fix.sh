#!/bin/bash

echo "🚀 Creating autopilotJS SIMPLE version..."

# Clean up and create fresh structure
rm -rf autopilotJS-simple
mkdir -p autopilotJS-simple
cd autopilotJS-simple

# Create folders
mkdir -p scripts/core scripts/modules styles assets lib

# ==================== index.html ====================
cat > index.html << 'HTMLEND'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>autopilotJS PRO - SIMPLE</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* Simple inline styles to get started */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .app { display: flex; height: 100vh; }
        
        /* Sidebar */
        .sidebar {
            width: 280px;
            background: #1e293b;
            color: white;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .sidebar h2 {
            color: #6366f1;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .section {
            background: #334155;
            padding: 15px;
            border-radius: 8px;
        }
        .comp-btn {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
        }
        .comp-btn:hover { background: #6366f1; }
        .export-btn {
            margin-top: auto;
            padding: 15px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        /* Main Content */
        .main { flex: 1; display: flex; flex-direction: column; padding: 20px; }
        .toolbar {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        .toolbar button {
            padding: 10px 20px;
            background: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        /* Canvas */
        .canvas-container {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .phone-frame {
            width: 390px;
            height: 844px;
            background: #111;
            border-radius: 40px;
            padding: 10px;
            position: relative;
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }
        .canvas {
            width: 370px;
            height: 824px;
            background: white;
            border-radius: 30px;
            position: relative;
            overflow: hidden;
        }
        .welcome {
            padding: 40px;
            text-align: center;
            color: #333;
        }
        .element {
            position: absolute;
            cursor: move;
            border: 2px solid transparent;
            min-width: 100px;
            min-height: 40px;
        }
        .element:hover { border-color: #6366f1; }
        .element.selected { border-color: #4f46e5; box-shadow: 0 0 10px rgba(79, 70, 229, 0.3); }
    </style>
</head>
<body>
    <div class="app">
        <!-- Sidebar -->
        <div class="sidebar">
            <h2><i class="fas fa-robot"></i> autopilotJS</h2>
            
            <div class="section">
                <h3><i class="fas fa-cubes"></i> Components</h3>
                <button class="comp-btn" data-type="text">
                    <i class="fas fa-font"></i> Add Text
                </button>
                <button class="comp-btn" data-type="button">
                    <i class="fas fa-square"></i> Add Button
                </button>
                <button class="comp-btn" data-type="input">
                    <i class="fas fa-edit"></i> Add Input
                </button>
            </div>
            
            <div class="section">
                <h3><i class="fas fa-sliders-h"></i> Properties</h3>
                <div id="properties">
                    <p style="color: #94a3b8;">Select an element to edit</p>
                </div>
            </div>
            
            <button id="exportBtn" class="export-btn">
                <i class="fas fa-download"></i> Export Project
            </button>
        </div>
        
        <!-- Main Content -->
        <div class="main">
            <div class="toolbar">
                <button id="undoBtn">
                    <i class="fas fa-undo"></i> Undo
                </button>
                <button id="redoBtn">
                    <i class="fas fa-redo"></i> Redo
                </button>
                <button id="clearBtn">
                    <i class="fas fa-trash"></i> Clear
                </button>
            </div>
            
            <div class="canvas-container">
                <div class="phone-frame">
                    <div id="canvas" class="canvas">
                        <!-- Elements go here -->
                        <div class="welcome">
                            <h3>🚀 Welcome to autopilotJS!</h3>
                            <p>Click components in the sidebar to add them here.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- SIMPLE JavaScript -->
    <script>
        console.log("🚀 autopilotJS SIMPLE starting...");
        
        class SimpleStateManager {
            constructor() {
                this.elements = [];
                this.history = [];
                this.selectedId = null;
            }
            
            addElement(element) {
                element.id = 'elem_' + Date.now();
                this.elements.push(element);
                this.history.push(JSON.parse(JSON.stringify(this.elements)));
                console.log('Added:', element);
                this.render();
            }
            
            undo() {
                if (this.history.length > 1) {
                    this.history.pop();
                    this.elements = JSON.parse(JSON.stringify(this.history[this.history.length - 1]));
                    this.render();
                }
            }
            
            render() {
                const canvas = document.getElementById('canvas');
                if (!canvas) return;
                
                // Keep welcome message if no elements
                if (this.elements.length === 0) {
                    canvas.innerHTML = '<div class="welcome"><h3>🚀 Welcome!</h3><p>Add components from sidebar</p></div>';
                    return;
                }
                
                let html = '';
                this.elements.forEach(el => {
                    const isSelected = el.id === this.selectedId ? 'selected' : '';
                    const style = `left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px;`;
                    
                    if (el.type === 'text') {
                        html += `<div class="element ${isSelected}" id="${el.id}" style="${style}">${el.text}</div>`;
                    } else if (el.type === 'button') {
                        html += `<button class="element ${isSelected}" id="${el.id}" style="${style}">${el.text}</button>`;
                    } else if (el.type === 'input') {
                        html += `<input class="element ${isSelected}" id="${el.id}" style="${style}" placeholder="${el.text}">`;
                    }
                });
                
                canvas.innerHTML = html;
                
                // Add click events to new elements
                document.querySelectorAll('.element').forEach(el => {
                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.selectedId = el.id;
                        this.render();
                        this.updateProperties(el.id);
                    });
                });
            }
            
            updateProperties(elementId) {
                const props = document.getElementById('properties');
                const element = this.elements.find(el => el.id === elementId);
                if (props && element) {
                    props.innerHTML = `
                        <h4>${element.type} Properties</h4>
                        <p>Position: ${element.x}, ${element.y}</p>
                        <p>Size: ${element.width} × ${element.height}</p>
                        <input type="text" value="${element.text}" placeholder="Text">
                    `;
                }
            }
        }
        
        // Initialize
        window.StateManager = new SimpleStateManager();
        
        // Setup event listeners
        document.addEventListener('DOMContentLoaded', function() {
            console.log("✅ DOM loaded");
            
            // Component buttons
            document.querySelectorAll('.comp-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const type = this.dataset.type;
                    window.StateManager.addElement({
                        type: type,
                        x: 50 + Math.random() * 200,
                        y: 50 + Math.random() * 200,
                        width: 120,
                        height: 40,
                        text: type === 'text' ? 'Sample Text' : 
                              type === 'button' ? 'Button' : 
                              type === 'input' ? 'Input field' : 'Element'
                    });
                });
            });
            
            // Toolbar buttons
            document.getElementById('undoBtn')?.addEventListener('click', () => {
                window.StateManager.undo();
            });
            
            document.getElementById('redoBtn')?.addEventListener('click', () => {
                // Simple redo - just re-render
                window.StateManager.render();
            });
            
            document.getElementById('clearBtn')?.addEventListener('click', () => {
                if (confirm('Clear all elements?')) {
                    window.StateManager.elements = [];
                    window.StateManager.history = [];
                    window.StateManager.render();
                }
            });
            
            document.getElementById('exportBtn')?.addEventListener('click', () => {
                alert('Export feature coming soon! Check console for data.');
                console.log('Current elements:', window.StateManager.elements);
            });
            
            // Initial render
            window.StateManager.render();
            console.log("🎉 autopilotJS SIMPLE ready!");
        });
    </script>
</body>
</html>
HTMLEND

echo "✅ Created autopilotJS SIMPLE version!"
echo ""
echo "🚀 TO START:"
echo "cd ~/Desktop/autopilotJS-simple"
echo "live-server"
echo ""
echo "📂 Structure created:"
find . -type f -name "*.html" -o -name "*.css" -o -name "*.js" | sort
