// scripts/app.js - INITIALISATIE

document.addEventListener('DOMContentLoaded', function() {
  console.log('App: Initializing...');
  
  // Initialize State Manager
  const stateManager = new StateManager();
  
  // Initialize Event Bus
  const eventBus = new EventBus();
  
  // Initialize Render Engine
  const renderEngine = new RenderEngine(stateManager, eventBus);
  
  // Initialize Drag & Drop
  if (window.DragDropManager) {
    window.DragDropManager.init(stateManager, eventBus);
  }
  
  // Subscribe to state changes
  stateManager.subscribe((state) => {
    renderEngine.setState(state);
  });
  
  // Load initial state
  const initialState = {
    project: {
      name: "New Project",
      screens: [
        {
          id: "screen_1",
          name: "Home Screen",
          components: []
        }
      ],
      activeScreenId: "screen_1",
      selectedElementId: null
    }
  };
  
  stateManager.setState(initialState);
  
  console.log('App: Initialized successfully');
});