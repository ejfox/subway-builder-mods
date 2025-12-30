/**
 * KML/KMZ Route Export Mod
 * Exports metro routes to KML format for Google Maps/Earth
 */

(function() {
  'use strict';

  // Wait for API to be ready
  function whenAPIReady(callback) {
    if (window.SubwayBuilderAPI) {
      callback(window.SubwayBuilderAPI);
    } else {
      var interval = setInterval(function() {
        if (window.SubwayBuilderAPI) {
          clearInterval(interval);
          callback(window.SubwayBuilderAPI);
        }
      }, 100);
    }
  }

  // XML escape helper
  function escapeXml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Convert hex color to KML format (AABBGGRR)
  function hexToKmlColor(hex, alpha) {
    if (!hex) return 'ff0000ff';
    alpha = alpha || 'ff';
    // Remove # if present
    hex = hex.replace('#', '');
    // Parse RGB
    var r = hex.substring(0, 2);
    var g = hex.substring(2, 4);
    var b = hex.substring(4, 6);
    // KML uses AABBGGRR format
    return alpha + b + g + r;
  }

  // Build track ID to track lookup
  function buildTrackLookup(tracks) {
    var lookup = {};
    tracks.forEach(function(track) {
      lookup[track.id] = track;
    });
    return lookup;
  }

  // Build station ID to station lookup
  function buildStationLookup(stations) {
    var lookup = {};
    stations.forEach(function(station) {
      lookup[station.id] = station;
    });
    return lookup;
  }

  // Get coordinates for a route by traversing its track segments
  function getRouteCoordinates(route, trackLookup) {
    var allCoords = [];

    if (!route.stCombos || route.stCombos.length === 0) {
      // Fallback: use station node centers
      if (route.stNodes && route.stNodes.length > 0) {
        route.stNodes.forEach(function(stNode) {
          if (stNode.center) {
            allCoords.push(stNode.center);
          }
        });
      }
      return allCoords;
    }

    route.stCombos.forEach(function(stCombo) {
      if (!stCombo.path) return;

      stCombo.path.forEach(function(pathSegment) {
        var track = trackLookup[pathSegment.trackId];
        if (!track || !track.coords || track.coords.length === 0) return;

        var coords = track.coords.slice(); // Clone
        if (pathSegment.reversed) {
          coords = coords.reverse();
        }

        // Avoid duplicating the last point with the first point of next segment
        if (allCoords.length > 0) {
          var lastCoord = allCoords[allCoords.length - 1];
          var firstNewCoord = coords[0];
          if (lastCoord && firstNewCoord &&
              Math.abs(lastCoord[0] - firstNewCoord[0]) < 0.00001 &&
              Math.abs(lastCoord[1] - firstNewCoord[1]) < 0.00001) {
            coords = coords.slice(1);
          }
        }

        allCoords = allCoords.concat(coords);
      });
    });

    return allCoords;
  }

  // Get stations on a route
  function getRouteStations(route, stationLookup) {
    var routeStations = [];

    // Get stations from route's stNodeIds via station routeIds
    Object.values(stationLookup).forEach(function(station) {
      if (station.routeIds && station.routeIds.includes(route.id)) {
        routeStations.push(station);
      }
    });

    return routeStations;
  }

  // Generate KML content
  function generateKML(options) {
    var api = window.SubwayBuilderAPI;
    var routes = api.gameState.getRoutes();
    var tracks = api.gameState.getTracks();
    var stations = api.gameState.getStations();

    var trackLookup = buildTrackLookup(tracks);
    var stationLookup = buildStationLookup(stations);

    // Filter to only constructed routes (not suspended)
    var activeRoutes = routes.filter(function(route) {
      return !route.suspended && route.stNodes && route.stNodes.length > 0;
    });

    if (activeRoutes.length === 0) {
      return null;
    }

    var kml = [];
    kml.push('<?xml version="1.0" encoding="UTF-8"?>');
    kml.push('<kml xmlns="http://www.opengis.net/kml/2.2">');
    kml.push('<Document>');
    kml.push('  <name>' + escapeXml(options.documentName || 'Metro Routes Export') + '</name>');
    kml.push('  <description>Exported from Metro Maker on ' + new Date().toISOString().split('T')[0] + '</description>');

    // Generate styles for each route
    activeRoutes.forEach(function(route) {
      var styleId = 'route_' + route.id.replace(/[^a-zA-Z0-9]/g, '_');
      var kmlColor = hexToKmlColor(route.color, 'ff');

      kml.push('  <Style id="' + styleId + '">');
      kml.push('    <LineStyle>');
      kml.push('      <color>' + kmlColor + '</color>');
      kml.push('      <width>' + (options.lineWidth || 4) + '</width>');
      kml.push('    </LineStyle>');
      kml.push('  </Style>');

      // Station icon style for this route
      kml.push('  <Style id="' + styleId + '_station">');
      kml.push('    <IconStyle>');
      kml.push('      <color>' + kmlColor + '</color>');
      kml.push('      <scale>0.8</scale>');
      kml.push('      <Icon>');
      kml.push('        <href>http://maps.google.com/mapfiles/kml/shapes/rail.png</href>');
      kml.push('      </Icon>');
      kml.push('    </IconStyle>');
      kml.push('    <LabelStyle>');
      kml.push('      <scale>0.8</scale>');
      kml.push('    </LabelStyle>');
      kml.push('  </Style>');
    });

    // Routes folder
    kml.push('  <Folder>');
    kml.push('    <name>Routes</name>');

    activeRoutes.forEach(function(route) {
      var styleId = 'route_' + route.id.replace(/[^a-zA-Z0-9]/g, '_');
      var coords = getRouteCoordinates(route, trackLookup);

      if (coords.length < 2) return;

      var routeName = route.bullet || route.id;
      if (route.variantName) {
        routeName += ' (' + route.variantName + ')';
      }

      kml.push('    <Placemark>');
      kml.push('      <name>' + escapeXml(routeName) + '</name>');
      kml.push('      <description>Route ' + escapeXml(route.bullet) + ' - ' + route.stNodes.length + ' stations</description>');
      kml.push('      <styleUrl>#' + styleId + '</styleUrl>');
      kml.push('      <LineString>');
      kml.push('        <tessellate>1</tessellate>');
      kml.push('        <coordinates>');

      // KML coordinates are lon,lat,altitude (altitude optional)
      var coordStrings = coords.map(function(coord) {
        return coord[0] + ',' + coord[1] + ',0';
      });
      kml.push('          ' + coordStrings.join(' '));

      kml.push('        </coordinates>');
      kml.push('      </LineString>');
      kml.push('    </Placemark>');
    });

    kml.push('  </Folder>');

    // Stations folder (if option enabled)
    if (options.includeStations) {
      kml.push('  <Folder>');
      kml.push('    <name>Stations</name>');

      // Track which stations we've already added to avoid duplicates
      var addedStations = {};

      activeRoutes.forEach(function(route) {
        var styleId = 'route_' + route.id.replace(/[^a-zA-Z0-9]/g, '_');
        var routeStations = getRouteStations(route, stationLookup);

        routeStations.forEach(function(station) {
          // Skip if already added (stations can be on multiple routes)
          if (addedStations[station.id]) return;
          addedStations[station.id] = true;

          if (!station.coords) return;

          kml.push('    <Placemark>');
          kml.push('      <name>' + escapeXml(station.name || 'Station') + '</name>');
          kml.push('      <description>Station on routes: ' + escapeXml((station.routeIds || []).join(', ')) + '</description>');
          kml.push('      <styleUrl>#' + styleId + '_station</styleUrl>');
          kml.push('      <Point>');
          kml.push('        <coordinates>' + station.coords[0] + ',' + station.coords[1] + ',0</coordinates>');
          kml.push('      </Point>');
          kml.push('    </Placemark>');
        });
      });

      kml.push('  </Folder>');
    }

    kml.push('</Document>');
    kml.push('</kml>');

    return kml.join('\n');
  }

  // Download file helper
  function downloadFile(content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Export function
  function exportRoutes(options) {
    options = options || {};
    options.includeStations = options.includeStations !== false;
    options.lineWidth = options.lineWidth || 4;
    options.documentName = options.documentName || 'Metro Routes';

    var kmlContent = generateKML(options);

    if (!kmlContent) {
      window.SubwayBuilderAPI.ui.showNotification('No active routes to export', 'error');
      return false;
    }

    var timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    var filename = 'metro-routes-' + timestamp + '.kml';

    downloadFile(kmlContent, filename, 'application/vnd.google-earth.kml+xml');

    window.SubwayBuilderAPI.ui.showNotification('Routes exported to ' + filename, 'success');
    return true;
  }

  // Initialize mod
  whenAPIReady(function(api) {
    var React = api.utils.React;
    var Button = api.utils.components.Button;
    var icons = api.utils.icons;

    // Export button component
    function ExportKMLButton() {
      var handleClick = function() {
        exportRoutes({
          includeStations: true,
          lineWidth: 4,
          documentName: 'Metro Routes'
        });
      };

      return React.createElement(Button, {
        variant: 'outline',
        size: 'sm',
        onClick: handleClick,
        className: 'w-full justify-start gap-2'
      }, [
        React.createElement(icons.Download, { key: 'icon', className: 'h-4 w-4' }),
        'Export Routes to KML'
      ]);
    }

    // Register in escape menu
    api.ui.registerComponent('escape-menu-buttons', {
      id: 'kmz-export-button',
      component: ExportKMLButton
    });

    // Also expose function globally for console access
    window.exportMetroRoutesToKML = exportRoutes;

    console.log('[KMZ Export] Mod loaded. Use escape menu button or window.exportMetroRoutesToKML() to export routes.');
  });
})();
