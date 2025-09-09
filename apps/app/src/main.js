// Enhanced Rabbit Flashlight - R1 Plugin
// Sophisticated flashlight with intro screen, hardware-like dimming, and smooth animations

// Check if running as R1 plugin
if (typeof PluginMessageHandler !== 'undefined') {
  console.log('Running as R1 Creation - Enhanced Rabbit Flashlight');
} else {
  console.log('Running in browser mode - Enhanced Rabbit Flashlight');
}

// ===========================================
// Enhanced State Management
// ===========================================

let flashlightState = {
  brightness: 100, // 10, 25, 50, 75, 100
  color: '#ffffff',
  isColorMenuOpen: false,
  isIntroComplete: false,
  isMainInterfaceActive: false
};

const brightnessLevels = [10, 25, 50, 75, 100];
let currentBrightnessIndex = 4; // Start at 100%
let introTimeout;
let animationFrameId;

// ===========================================
// Intro Screen Management
// ===========================================

function showIntroScreen() {
  const introScreen = document.getElementById('introScreen');
  const mainInterface = document.getElementById('mainInterface');
  
  // Ensure intro is visible
  introScreen.classList.remove('fade-out');
  mainInterface.classList.remove('active');
  
  // Auto-transition after 3 seconds
  introTimeout = setTimeout(() => {
    transitionToMainInterface();
  }, 3000);
}

function transitionToMainInterface() {
  const introScreen = document.getElementById('introScreen');
  const mainInterface = document.getElementById('mainInterface');
  const brightnessControls = document.getElementById('brightnessControls');
  
  // Fade out intro
  introScreen.classList.add('fade-out');
  
  // Activate main interface with delay
  setTimeout(() => {
    mainInterface.classList.add('active');
    flashlightState.isMainInterfaceActive = true;
    
    // Show brightness controls after main interface loads
    setTimeout(() => {
      brightnessControls.classList.add('visible');
    }, 400);
    
    // Apply saved state
    applyFlashlightState();
    
  }, 400);
  
  flashlightState.isIntroComplete = true;
  saveFlashlightState();
}

function skipIntro() {
  if (introTimeout) {
    clearTimeout(introTimeout);
  }
  transitionToMainInterface();
}

// ===========================================
// Enhanced Color Wheel Implementation
// ===========================================

function initColorWheel() {
  const canvas = document.getElementById('colorWheel');
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const outerRadius = canvas.width / 2 - 10;
  const innerRadius = outerRadius * 0.3;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw color wheel with gradient rings
  for (let radius = innerRadius; radius <= outerRadius; radius += 2) {
    for (let angle = 0; angle < 360; angle += 2) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = (angle + 1) * Math.PI / 180;
      
      // Calculate saturation based on radius
      const saturation = Math.min(100, ((radius - innerRadius) / (outerRadius - innerRadius)) * 100);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineWidth = 3;
      ctx.strokeStyle = `hsl(${angle}, ${saturation}%, 50%)`;
      ctx.stroke();
    }
  }

  // Add enhanced touch/click handlers
  let isSelecting = false;
  
  const handleColorSelection = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    
    const canvasX = x - rect.left - centerX;
    const canvasY = y - rect.top - centerY;
    const distance = Math.sqrt(canvasX * canvasX + canvasY * canvasY);
    
    // Only select if within the wheel
    if (distance >= innerRadius && distance <= outerRadius) {
      const angle = Math.atan2(canvasY, canvasX) * 180 / Math.PI;
      const hue = (angle + 360) % 360;
      const saturation = Math.min(100, ((distance - innerRadius) / (outerRadius - innerRadius)) * 100);
      const color = `hsl(${hue}, ${saturation}%, 50%)`;
      
      setFlashlightColor(color);
      
      // Visual feedback
      const colorWheelCenter = document.getElementById('colorWheelCenter');
      colorWheelCenter.classList.add('active');
      setTimeout(() => {
        colorWheelCenter.classList.remove('active');
      }, 200);
    }
  };

  // Mouse events
  canvas.addEventListener('mousedown', (e) => {
    isSelecting = true;
    handleColorSelection(e);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isSelecting) {
      handleColorSelection(e);
    }
  });

  canvas.addEventListener('mouseup', () => {
    isSelecting = false;
  });

  // Touch events
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isSelecting = true;
    handleColorSelection(e);
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isSelecting) {
      handleColorSelection(e);
    }
  });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isSelecting = false;
  });
}

function setFlashlightColor(color) {
  flashlightState.color = color;
  document.body.style.backgroundColor = color;
  
  // Smooth color transition
  document.body.style.transition = 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  
  saveFlashlightState();
  console.log('Flashlight color changed to:', color);
  
  // Send color change notification to R1
  if (typeof PluginMessageHandler !== 'undefined') {
    PluginMessageHandler.postMessage(JSON.stringify({
      message: `Flashlight color changed to ${color}`,
      timestamp: Date.now()
    }));
  }
}

// ===========================================
// Enhanced Brightness Control System
// ===========================================

function setBrightness(level) {
  flashlightState.brightness = level;
  
  // Hardware-like dimming: Use overlay instead of body opacity
  const flashlightOverlay = document.getElementById('flashlightOverlay');
  const brightnessValue = document.getElementById('brightnessValue');
  
  if (flashlightOverlay) {
    // Clear existing brightness classes
    flashlightOverlay.className = 'flashlight-overlay';
    
    // Apply appropriate dimming overlay
    if (level <= 10) {
      flashlightOverlay.classList.add('dim-90');
    } else if (level <= 25) {
      flashlightOverlay.classList.add('dim-75');
    } else if (level <= 50) {
      flashlightOverlay.classList.add('dim-50');
    } else if (level <= 75) {
      flashlightOverlay.classList.add('dim-25');
    } else {
      flashlightOverlay.classList.add('dim-0');
    }
  }
  
  // Update brightness indicator with animation
  if (brightnessValue) {
    brightnessValue.textContent = level + '%';
    brightnessValue.classList.add('pulse');
    setTimeout(() => {
      brightnessValue.classList.remove('pulse');
    }, 300);
  }
  
  // Update slider position
  const sliderIndex = brightnessLevels.indexOf(level);
  if (sliderIndex !== -1) {
    currentBrightnessIndex = sliderIndex;
    const slider = document.getElementById('brightnessSlider');
    if (slider) {
      slider.value = sliderIndex;
    }
  }
  
  saveFlashlightState();
  console.log('Brightness set to:', level + '%');
  
  // Send brightness change notification to R1
  if (typeof PluginMessageHandler !== 'undefined') {
    PluginMessageHandler.postMessage(JSON.stringify({
      message: `Brightness adjusted to ${level}%`,
      timestamp: Date.now()
    }));
  }
}

function adjustBrightnessUp() {
  if (currentBrightnessIndex < brightnessLevels.length - 1) {
    currentBrightnessIndex++;
    setBrightness(brightnessLevels[currentBrightnessIndex]);
    
    // Haptic-like feedback through animation
    animateBrightnessChange('up');
  }
}

function adjustBrightnessDown() {
  if (currentBrightnessIndex > 0) {
    currentBrightnessIndex--;
    setBrightness(brightnessLevels[currentBrightnessIndex]);
    
    // Haptic-like feedback through animation
    animateBrightnessChange('down');
  }
}

function animateBrightnessChange(direction) {
  const brightnessControls = document.getElementById('brightnessControls');
  if (brightnessControls) {
    const scale = direction === 'up' ? 'scale(1.05)' : 'scale(0.95)';
    brightnessControls.style.transform = `translateX(-50%) ${scale}`;
    
    setTimeout(() => {
      brightnessControls.style.transform = 'translateX(-50%) translateY(0)';
    }, 150);
  }
}

function applyFlashlightState() {
  setFlashlightColor(flashlightState.color);
  setBrightness(flashlightState.brightness);
  
  if (flashlightState.isColorMenuOpen) {
    showColorMenu();
  }
}

// ===========================================
// Enhanced Physical Input Handling
// ===========================================

// Handle R1 scroll wheel events for brightness control
window.addEventListener('scrollUp', () => {
  if (!flashlightState.isIntroComplete) {
    skipIntro();
    return;
  }
  
  console.log('Scroll up detected - increasing brightness');
  adjustBrightnessUp();
});

window.addEventListener('scrollDown', () => {
  if (!flashlightState.isIntroComplete) {
    skipIntro();
    return;
  }
  
  console.log('Scroll down detected - decreasing brightness');
  adjustBrightnessDown();
});

// Handle R1 side button (PTT) events
window.addEventListener('sideClick', () => {
  if (!flashlightState.isIntroComplete) {
    skipIntro();
    return;
  }
  
  console.log('Side button clicked - toggling color menu');
  toggleColorMenu();
});

window.addEventListener('longPressStart', () => {
  if (!flashlightState.isIntroComplete) {
    return;
  }
  
  console.log('Long press started - preparing reset');
  // Visual feedback for long press
  const flashlightOverlay = document.getElementById('flashlightOverlay');
  if (flashlightOverlay) {
    flashlightOverlay.style.background = 'radial-gradient(circle, rgba(254,95,0,0.2) 0%, rgba(0,0,0,0) 70%)';
  }
});

window.addEventListener('longPressEnd', () => {
  if (!flashlightState.isIntroComplete) {
    return;
  }
  
  console.log('Long press ended - resetting to white flashlight');
  
  // Reset flashlight with smooth animation
  setFlashlightColor('#ffffff');
  setBrightness(100);
  
  // Hide color menu if open
  if (flashlightState.isColorMenuOpen) {
    hideColorMenu();
  }
  
  // Clear long press visual feedback
  const flashlightOverlay = document.getElementById('flashlightOverlay');
  if (flashlightOverlay) {
    flashlightOverlay.style.background = '';
  }
  
  // Send reset notification to R1
  if (typeof PluginMessageHandler !== 'undefined') {
    PluginMessageHandler.postMessage(JSON.stringify({
      message: 'Flashlight reset to white at 100% brightness',
      wantsR1Response: true
    }));
  }
});

// ===========================================
// Enhanced Color Menu Management
// ===========================================

function toggleColorMenu() {
  if (flashlightState.isColorMenuOpen) {
    hideColorMenu();
  } else {
    showColorMenu();
  }
}

function showColorMenu() {
  const colorMenu = document.getElementById('colorMenu');
  
  if (colorMenu) {
    colorMenu.classList.add('visible');
    flashlightState.isColorMenuOpen = true;
    
    // Reinitialize color wheel for better responsiveness
    setTimeout(() => {
      initColorWheel();
    }, 100);
  }
  
  saveFlashlightState();
  console.log('Color menu opened');
}

function hideColorMenu() {
  const colorMenu = document.getElementById('colorMenu');
  
  if (colorMenu) {
    colorMenu.classList.remove('visible');
    flashlightState.isColorMenuOpen = false;
  }
  
  saveFlashlightState();
  console.log('Color menu closed');
}

// ===========================================
// Plugin Message Handling
// ===========================================

// Handle incoming messages from Flutter/WebSocket
window.onPluginMessage = function(data) {
  console.log('Received plugin message:', data);
  
  // Messages can have data in different fields
  if (data.data) {
    try {
      const parsed = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
      console.log('Parsed data:', parsed);
      // Handle structured data here
    } catch (e) {
      console.log('Data as text:', data.data);
    }
  }
  
  if (data.message) {
    console.log('Message text:', data.message);
    // Handle text messages here
  }
};

// ===========================================
// Sending Messages to Flutter
// ===========================================

// Example: Send message with LLM processing
function sendLLMMessage(message) {
  if (typeof PluginMessageHandler !== 'undefined') {
    const payload = {
      message: message,
      useLLM: true,
      wantsR1Response: false,  // Set to true for R1 voice output
      wantsJournalEntry: false  // Set to true to save to journal
    };
    PluginMessageHandler.postMessage(JSON.stringify(payload));
  } else {
    console.log('PluginMessageHandler not available');
  }
}

// Example: Send SERP API request
function sendSerpRequest(query, searchType = 'search') {
  if (typeof PluginMessageHandler !== 'undefined') {
    const payload = {
      message: JSON.stringify({
        query: query,
        useLocation: false,
        tag: searchType  // 'search', 'image', 'weather', 'finance', etc.
      }),
      useSerpAPI: true
    };
    PluginMessageHandler.postMessage(JSON.stringify(payload));
  }
}

// ===========================================
// Accelerometer Access
// ===========================================

let accelerometerRunning = false;

function startAccelerometer() {
  if (typeof window.creationSensors === 'undefined' || !window.creationSensors.accelerometer) {
    console.log('Accelerometer API not available');
    return;
  }
  
  try {
    window.creationSensors.accelerometer.start((data) => {
      console.log('Accelerometer data:', data);
      // data = { x: 0.1, y: -0.2, z: 0.98 }
      // Update your UI with accelerometer values
    }, { frequency: 60 });
    
    accelerometerRunning = true;
    console.log('Accelerometer started');
  } catch (e) {
    console.error('Error starting accelerometer:', e);
  }
}

function stopAccelerometer() {
  if (window.creationSensors && window.creationSensors.accelerometer && accelerometerRunning) {
    try {
      window.creationSensors.accelerometer.stop();
      accelerometerRunning = false;
      console.log('Accelerometer stopped');
    } catch (e) {
      console.error('Error stopping accelerometer:', e);
    }
  }
}

// ===========================================
// Persistent Storage
// ===========================================

// Save flashlight state to persistent storage
async function saveFlashlightState() {
  if (window.creationStorage) {
    try {
      const encoded = btoa(JSON.stringify(flashlightState));
      await window.creationStorage.plain.setItem('flashlight_state', encoded);
      console.log('Flashlight state saved');
    } catch (e) {
      console.error('Error saving flashlight state:', e);
    }
  } else {
    // Fallback to localStorage for browser testing
    localStorage.setItem('flashlight_state', JSON.stringify(flashlightState));
  }
}

// Load flashlight state from persistent storage
async function loadFlashlightState() {
  if (window.creationStorage) {
    try {
      const stored = await window.creationStorage.plain.getItem('flashlight_state');
      if (stored) {
        const state = JSON.parse(atob(stored));
        flashlightState = { ...flashlightState, ...state };
        console.log('Flashlight state loaded:', flashlightState);
        return flashlightState;
      }
    } catch (e) {
      console.error('Error loading flashlight state:', e);
    }
  } else {
    // Fallback to localStorage
    const stored = localStorage.getItem('flashlight_state');
    if (stored) {
      const state = JSON.parse(stored);
      flashlightState = { ...flashlightState, ...state };
      console.log('Flashlight state loaded from localStorage:', flashlightState);
      return flashlightState;
    }
  }
  return flashlightState;
}

// Generic storage functions for other data
async function saveToStorage(key, value) {
  if (window.creationStorage) {
    try {
      const encoded = btoa(JSON.stringify(value));
      await window.creationStorage.plain.setItem(key, encoded);
      console.log('Data saved to storage');
    } catch (e) {
      console.error('Error saving to storage:', e);
    }
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

async function loadFromStorage(key) {
  if (window.creationStorage) {
    try {
      const stored = await window.creationStorage.plain.getItem(key);
      if (stored) {
        return JSON.parse(atob(stored));
      }
    } catch (e) {
      console.error('Error loading from storage:', e);
    }
  } else {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return null;
}

// ===========================================
// Enhanced Initialization
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Enhanced Rabbit Flashlight initialized!');
  
  // Load saved state
  await loadFlashlightState();
  
  // Check if user has seen intro before
  if (flashlightState.isIntroComplete) {
    // Skip intro and go directly to main interface
    const introScreen = document.getElementById('introScreen');
    const mainInterface = document.getElementById('mainInterface');
    const brightnessControls = document.getElementById('brightnessControls');
    
    introScreen.style.display = 'none';
    mainInterface.classList.add('active');
    brightnessControls.classList.add('visible');
    flashlightState.isMainInterfaceActive = true;
    
    // Initialize immediately
    initializeMainInterface();
  } else {
    // Show intro screen
    showIntroScreen();
  }
  
  // Add keyboard fallback for development
  if (typeof PluginMessageHandler === 'undefined') {
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('sideClick'));
      }
      if (event.code === 'ArrowUp') {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('scrollUp'));
      }
      if (event.code === 'ArrowDown') {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('scrollDown'));
      }
      if (event.code === 'Escape') {
        event.preventDefault();
        if (flashlightState.isColorMenuOpen) {
          hideColorMenu();
        }
      }
    });
  }
});

function initializeMainInterface() {
  // Initialize color wheel
  initColorWheel();
  
  // Set up brightness slider
  const brightnessSlider = document.getElementById('brightnessSlider');
  if (brightnessSlider) {
    brightnessSlider.addEventListener('input', (e) => {
      const sliderValue = parseInt(e.target.value);
      currentBrightnessIndex = sliderValue;
      setBrightness(brightnessLevels[sliderValue]);
    });
    
    // Add touch feedback
    brightnessSlider.addEventListener('touchstart', () => {
      brightnessSlider.style.transform = 'scale(1.05)';
    });
    
    brightnessSlider.addEventListener('touchend', () => {
      brightnessSlider.style.transform = 'scale(1)';
    });
  }
  
  // Apply saved state with smooth transitions
  setTimeout(() => {
    applyFlashlightState();
  }, 100);
  
  // Send ready message to R1
  if (typeof PluginMessageHandler !== 'undefined') {
    PluginMessageHandler.postMessage(JSON.stringify({
      message: 'Enhanced Rabbit Flashlight ready! Scroll wheel: brightness, side button: colors, long press: reset.',
      wantsR1Response: true
    }));
  }
  
  console.log('Main interface initialized successfully');
}

// ===========================================
// Enhanced App Ready
// ===========================================

console.log('🔦 Enhanced Rabbit Flashlight Ready!');
console.log('✨ Features:');
console.log('- Intro screen with smooth transitions');
console.log('- Hardware-like brightness dimming');
console.log('- Enhanced color wheel with touch responsiveness');
console.log('- Compact brightness controls');
console.log('- Smooth animations throughout');
console.log('- Persistent state management');
console.log('');
console.log('🎮 Controls:');
console.log('- Scroll wheel: Adjust brightness (10%, 25%, 50%, 75%, 100%)');
console.log('- Side button: Toggle color wheel menu');
console.log('- Long press side button: Reset to white at 100%');
console.log('- Tap/drag color wheel: Change flashlight color');
console.log('- Bottom slider: Manual brightness control');
console.log('- Any input during intro: Skip to main interface');
console.log('');
console.log('🎨 by Atomlabor.de - Optimized for Rabbit R1 OS 2');