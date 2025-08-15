/**
 * Map debugging utilities for CISAdx
 * Helps identify map loading issues and performance problems
 */

export const debugMapInstance = (map) => {
  if (!map) {
    console.error('❌ Map instance is null or undefined');
    return;
  }

  console.log('🗺️ Map Debug Information:');
  console.log('- Map loaded:', map.loaded());
  console.log('- Map style loaded:', map.isStyleLoaded());
  console.log('- Map container:', map.getContainer());
  console.log('- Map center:', map.getCenter());
  console.log('- Map zoom:', map.getZoom());
  console.log('- Map bearing:', map.getBearing());
  console.log('- Map pitch:', map.getPitch());
  
  if (map.isStyleLoaded()) {
    const style = map.getStyle();
    console.log('- Style version:', style.version);
    console.log('- Style name:', style.name);
    console.log('- Style sources:', Object.keys(style.sources || {}));
    console.log('- Style layers:', (style.layers || []).map(l => l.id));
  }

  // Check for common issues
  const canvas = map.getCanvas();
  if (!canvas) {
    console.error('❌ Map canvas is not available');
  } else {
    console.log('- Canvas dimensions:', `${canvas.width}x${canvas.height}`);
  }

  const container = map.getContainer();
  if (!container) {
    console.error('❌ Map container is not available');
  } else {
    const rect = container.getBoundingClientRect();
    console.log('- Container dimensions:', `${rect.width}x${rect.height}`);
    
    if (rect.width === 0 || rect.height === 0) {
      console.error('❌ Map container has zero dimensions - this will prevent map from loading');
    }
  }
};

export const debugFederalEntities = (entities) => {
  console.log('🏛️ Federal Entities Debug:');
  console.log('- Total entities:', entities.length);
  
  let validEntities = 0;
  let invalidEntities = [];
  
  entities.forEach((entity, index) => {
    const hasValidCoords = 
      entity.location?.coordinates?.lat && 
      entity.location?.coordinates?.lng &&
      typeof entity.location.coordinates.lat === 'number' &&
      typeof entity.location.coordinates.lng === 'number' &&
      entity.location.coordinates.lat >= -90 &&
      entity.location.coordinates.lat <= 90 &&
      entity.location.coordinates.lng >= -180 &&
      entity.location.coordinates.lng <= 180;

    if (hasValidCoords) {
      validEntities++;
    } else {
      invalidEntities.push({
        index,
        id: entity.id,
        name: entity.name,
        coordinates: entity.location?.coordinates
      });
    }
  });
  
  console.log('- Valid entities:', validEntities);
  console.log('- Invalid entities:', invalidEntities.length);
  
  if (invalidEntities.length > 0) {
    console.warn('❌ Invalid entities found:', invalidEntities.slice(0, 5));
  }
  
  // Sample entity structure
  if (entities.length > 0) {
    console.log('- Sample entity structure:', {
      id: entities[0].id,
      name: entities[0].name,
      hasLocation: !!entities[0].location,
      hasCoordinates: !!entities[0].location?.coordinates,
      coordinates: entities[0].location?.coordinates
    });
  }
};

export const debugMapStyle = async (styleUrl) => {
  console.log('🎨 Map Style Debug:');
  console.log('- Style URL:', styleUrl);
  
  try {
    const response = await fetch(styleUrl);
    
    if (!response.ok) {
      console.error('❌ Style fetch failed:', response.status, response.statusText);
      return;
    }
    
    const style = await response.json();
    console.log('- Style loaded successfully');
    console.log('- Style version:', style.version);
    console.log('- Style name:', style.name);
    console.log('- Sources:', Object.keys(style.sources || {}));
    console.log('- Layers:', (style.layers || []).length);
    
    // Check for common style issues
    if (!style.sources || Object.keys(style.sources).length === 0) {
      console.warn('⚠️ Style has no sources defined');
    }
    
    if (!style.layers || style.layers.length === 0) {
      console.warn('⚠️ Style has no layers defined');
    }
    
    // Check for required fonts
    const textLayers = style.layers?.filter(layer => layer.type === 'symbol' && layer.layout?.['text-font']);
    if (textLayers.length > 0) {
      const fonts = new Set();
      textLayers.forEach(layer => {
        const textFont = layer.layout['text-font'];
        if (Array.isArray(textFont)) {
          textFont.forEach(font => fonts.add(font));
        }
      });
      console.log('- Required fonts:', Array.from(fonts));
    }
    
  } catch (error) {
    console.error('❌ Error loading style:', error);
  }
};

export const debugPerformance = (label = 'Map Operation') => {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`⏱️ ${label} took ${duration.toFixed(2)}ms`);
      return duration;
    }
  };
};

export const debugMapEvents = (map) => {
  const events = [
    'load', 'styledata', 'sourcedata', 'data',
    'error', 'zoom', 'move', 'moveend', 'zoomend'
  ];
  
  console.log('📡 Adding debug event listeners...');
  
  events.forEach(eventName => {
    map.on(eventName, (e) => {
      console.log(`🎯 Map event: ${eventName}`, e.type === eventName ? 'triggered' : e);
    });
  });
};

export const runMapDiagnostics = async (map, entities, styleUrl) => {
  console.log('🔍 Running comprehensive map diagnostics...');
  console.log('=' .repeat(50));
  
  debugMapInstance(map);
  console.log('');
  
  debugFederalEntities(entities);
  console.log('');
  
  await debugMapStyle(styleUrl);
  console.log('');
  
  console.log('✅ Diagnostics complete');
  console.log('=' .repeat(50));
};