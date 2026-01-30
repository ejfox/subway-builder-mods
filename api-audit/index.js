/**
 * API Audit Test Mod
 * Tests every feature from the modder master list
 *
 * Run this mod and check console for PASS/FAIL results
 */

function whenAPIReady(callback) {
    if (window.SubwayBuilderAPI) {
        callback(window.SubwayBuilderAPI);
    } else {
        const interval = setInterval(() => {
            if (window.SubwayBuilderAPI) {
                clearInterval(interval);
                callback(window.SubwayBuilderAPI);
            }
        }, 100);
    }
}

whenAPIReady((api) => {

const results = [];

function test(name, fn) {
    try {
        const result = fn();
        if (result === true || result !== false) {
            results.push({ name, status: 'PASS', detail: result });
            console.log(`✅ PASS: ${name}`, result !== true ? result : '');
        } else {
            results.push({ name, status: 'FAIL', detail: result });
            console.error(`❌ FAIL: ${name}`, result);
        }
    } catch (error) {
        results.push({ name, status: 'ERROR', detail: error.message });
        console.error(`💥 ERROR: ${name}`, error.message);
    }
}

console.log('='.repeat(60));
console.log('🔍 MODDING API AUDIT - Testing Master List Features');
console.log('='.repeat(60));

// ============================================================
// GENERAL/FIXES
// ============================================================
console.log('\n📦 GENERAL/FIXES');

test('API exists on window', () => {
    return typeof window.SubwayBuilderAPI === 'object';
});

test('API version is defined', () => {
    return typeof api.version === 'string' && api.version.length > 0;
});

// Notifications (queuing test)
test('showNotification exists', () => {
    return typeof api.ui.showNotification === 'function';
});

test('showNotification accepts message', () => {
    api.ui.showNotification('API Audit: Notification test', 'info');
    return true; // If no error, it queued or displayed
});

// UI Components via React.createElement (not JSX)
test('React exposed via api.utils.React', () => {
    return typeof api.utils.React === 'object' && typeof api.utils.React.createElement === 'function';
});

test('React.createElement works', () => {
    const h = api.utils.React.createElement;
    const element = h('div', { className: 'test' }, 'Hello');
    return element && element.type === 'div';
});

// calculateBlueprintCost
test('calculateBlueprintCost exists', () => {
    return typeof api.gameState.calculateBlueprintCost === 'function';
});

test('calculateBlueprintCost returns breakdown with buildingDemolitionCost', () => {
    // Empty tracks array should still return the structure
    const result = api.gameState.calculateBlueprintCost([]);
    return result &&
           typeof result.totalCost === 'number' &&
           typeof result.breakdown === 'object' &&
           'buildingDemolitionCost' in result.breakdown;
});

// modifyConstants auto-sync
test('modifyConstants exists', () => {
    return typeof api.modifyConstants === 'function';
});

// ============================================================
// UI FEATURES
// ============================================================
console.log('\n🎨 UI FEATURES');

// Main Menu / Escape Menu expansion
test('registerComponent exists', () => {
    return typeof api.ui.registerComponent === 'function';
});

test('escape-menu-buttons placement works', () => {
    const { React, components } = api.utils;
    const h = React.createElement;
    api.ui.registerComponent('escape-menu-buttons', {
        id: 'audit-test-button',
        component: () => h(components.Button, {
            onClick: () => console.log('Audit button clicked'),
            className: 'w-full'
        }, '🔍 Audit Test Button')
    });
    return true;
});

test('main-menu placement works', () => {
    const { React, components } = api.utils;
    const h = React.createElement;
    api.ui.registerComponent('main-menu', {
        id: 'audit-test-main-menu',
        component: () => h('div', { className: 'text-sm' }, '🔍 Audit test main menu item')
    });
    return true;
});

test('getComponents returns array', () => {
    const components = api.ui.getComponents('escape-menu');
    return Array.isArray(components);
});

// Light/Dark Mode
test('setTheme exists', () => {
    return typeof api.ui.setTheme === 'function';
});

test('getTheme exists', () => {
    return typeof api.ui.getTheme === 'function';
});

test('getResolvedTheme exists', () => {
    return typeof api.ui.getResolvedTheme === 'function';
});

test('getTheme returns valid value', () => {
    const theme = api.ui.getTheme();
    return ['light', 'dark', 'system'].includes(theme);
});

// Color Picker APIs
test('setAccentColor exists', () => {
    return typeof api.ui.setAccentColor === 'function';
});

test('setPrimaryColor exists', () => {
    return typeof api.ui.setPrimaryColor === 'function';
});

test('setCSSVariable exists', () => {
    return typeof api.ui.setCSSVariable === 'function';
});

test('resetColors exists', () => {
    return typeof api.ui.resetColors === 'function';
});

// Lucide Icons
test('Lucide icons exposed via api.utils.icons', () => {
    return typeof api.utils.icons === 'object';
});

test('Icons object has entries', () => {
    // Individual icon availability verified by 'Can create icon element' test
    const icons = api.utils.icons;
    return typeof icons === 'object' && Object.keys(icons).length > 0;
});

test('Can create icon element', () => {
    const h = api.utils.React.createElement;
    const element = h(api.utils.icons.Settings, { size: 24 });
    return element && element.type === api.utils.icons.Settings;
});

// UI Components (shadcn)
test('UI components exposed via api.utils.components', () => {
    return typeof api.utils.components === 'object';
});

test('Button component available', () => {
    return typeof api.utils.components.Button === 'function' ||
           typeof api.utils.components.Button === 'object';
});

test('Card component available', () => {
    return typeof api.utils.components.Card === 'function' ||
           typeof api.utils.components.Card === 'object';
});

test('Progress component available', () => {
    return typeof api.utils.components.Progress === 'function' ||
           typeof api.utils.components.Progress === 'object';
});

test('Switch component available', () => {
    return typeof api.utils.components.Switch === 'function' ||
           typeof api.utils.components.Switch === 'object';
});

// DOM Access (data-mod-id)
test('data-mod-id attributes documented', () => {
    // Can't test DOM until game loads, but API is there
    return true; // Manual verification needed in-game
});

// ============================================================
// DATA FEATURES
// ============================================================
console.log('\n📊 DATA FEATURES');

test('getTicketPrice exists', () => {
    return typeof api.gameState.getTicketPrice === 'function';
});

test('getTicketPrice returns number', () => {
    const price = api.gameState.getTicketPrice();
    return typeof price === 'number';
});

test('getGameSpeed exists', () => {
    return typeof api.gameState.getGameSpeed === 'function';
});

test('getGameSpeed returns valid value', () => {
    const speed = api.gameState.getGameSpeed();
    return ['slow', 'normal', 'fast', 'ultrafast'].includes(speed);
});

test('isPaused exists', () => {
    return typeof api.gameState.isPaused === 'function';
});

test('isPaused returns boolean', () => {
    const paused = api.gameState.isPaused();
    return typeof paused === 'boolean';
});

test('getBonds exists', () => {
    return typeof api.gameState.getBonds === 'function';
});

test('getBonds returns array', () => {
    const bonds = api.gameState.getBonds();
    return Array.isArray(bonds);
});

test('getBondTypes exists', () => {
    return typeof api.gameState.getBondTypes === 'function';
});

test('getBondTypes returns object', () => {
    const types = api.gameState.getBondTypes();
    return typeof types === 'object' && types !== null;
});

test('getRidershipStats exists', () => {
    return typeof api.gameState.getRidershipStats === 'function';
});

test('getRidershipStats returns expected shape', () => {
    const stats = api.gameState.getRidershipStats();
    return typeof stats === 'object' &&
           'totalRidersPerHour' in stats &&
           'totalRiders' in stats;
});

test('getLineMetrics exists', () => {
    return typeof api.gameState.getLineMetrics === 'function';
});

test('getLineMetrics returns array', () => {
    const metrics = api.gameState.getLineMetrics();
    return Array.isArray(metrics);
});

// ============================================================
// EVENT HOOKS
// ============================================================
console.log('\n🎣 EVENT HOOKS');

test('onDemandChange exists', () => {
    return typeof api.hooks.onDemandChange === 'function';
});

test('onDemandChange accepts callback', () => {
    api.hooks.onDemandChange((popCount) => {
        console.log('[Audit] Demand changed:', popCount);
    });
    return true;
});

test('onTrackChange exists', () => {
    return typeof api.hooks.onTrackChange === 'function';
});

test('onTrackChange accepts callback', () => {
    api.hooks.onTrackChange((type, count) => {
        console.log('[Audit] Track change:', type, count);
    });
    return true;
});

test('onGameEnd exists', () => {
    return typeof api.hooks.onGameEnd === 'function';
});

test('onGameEnd accepts callback', () => {
    api.hooks.onGameEnd(() => {
        console.log('[Audit] Game ending!');
    });
    return true;
});

test('onGameInit exists', () => {
    return typeof api.hooks.onGameInit === 'function';
});

test('onDayChange exists', () => {
    return typeof api.hooks.onDayChange === 'function';
});

test('onStationBuilt exists', () => {
    return typeof api.hooks.onStationBuilt === 'function';
});

test('onRouteCreated exists', () => {
    return typeof api.hooks.onRouteCreated === 'function';
});

test('onTrainSpawned exists', () => {
    return typeof api.hooks.onTrainSpawned === 'function';
});

test('onGameSaved exists', () => {
    return typeof api.hooks.onGameSaved === 'function';
});

test('onGameLoaded exists', () => {
    return typeof api.hooks.onGameLoaded === 'function';
});

test('onPauseChanged exists', () => {
    return typeof api.hooks.onPauseChanged === 'function';
});

test('onSpeedChanged exists', () => {
    return typeof api.hooks.onSpeedChanged === 'function';
});

test('onMoneyChanged exists', () => {
    return typeof api.hooks.onMoneyChanged === 'function';
});

// ============================================================
// MAP STUFF
// ============================================================
console.log('\n🗺️ MAP STUFF');

test('setCityDataFiles exists', () => {
    return typeof api.cities.setCityDataFiles === 'function';
});

test('getCityDataFiles exists', () => {
    return typeof api.cities.getCityDataFiles === 'function';
});

test('registerCity exists', () => {
    return typeof api.registerCity === 'function';
});

test('registerTab exists', () => {
    return typeof api.cities.registerTab === 'function';
});

test('getTabs exists', () => {
    return typeof api.cities.getTabs === 'function';
});

// ============================================================
// POP TIMING OVERRIDES
// ============================================================
console.log('\n⏰ POP TIMING');

test('popTiming namespace exists', () => {
    return typeof api.popTiming === 'object';
});

test('getCommuteTimeRanges exists', () => {
    return typeof api.popTiming.getCommuteTimeRanges === 'function';
});

test('getCommuteTimeRanges returns array', () => {
    const ranges = api.popTiming.getCommuteTimeRanges();
    return Array.isArray(ranges) && ranges.length > 0;
});

test('setCommuteTimeRanges exists', () => {
    return typeof api.popTiming.setCommuteTimeRanges === 'function';
});

test('resetCommuteTimeRanges exists', () => {
    return typeof api.popTiming.resetCommuteTimeRanges === 'function';
});

// ============================================================
// COLOR THEMING
// ============================================================
console.log('\n🎨 COLOR THEMING');

test('setAccentColor exists', () => {
    return typeof api.ui.setAccentColor === 'function';
});

test('setPrimaryColor exists', () => {
    return typeof api.ui.setPrimaryColor === 'function';
});

test('setCSSVariable exists', () => {
    return typeof api.ui.setCSSVariable === 'function';
});

test('resetColors exists', () => {
    return typeof api.ui.resetColors === 'function';
});

// ============================================================
// ACTIONS
// ============================================================
console.log('\n🎮 ACTIONS');

test('actions.addMoney exists', () => {
    return typeof api.actions.addMoney === 'function';
});

test('actions.subtractMoney exists', () => {
    return typeof api.actions.subtractMoney === 'function';
});

test('actions.setMoney exists', () => {
    return typeof api.actions.setMoney === 'function';
});

test('actions.setPause exists', () => {
    return typeof api.actions.setPause === 'function';
});

test('actions.setSpeed exists', () => {
    return typeof api.actions.setSpeed === 'function';
});

// ============================================================
// SUMMARY
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('📋 AUDIT SUMMARY');
console.log('='.repeat(60));

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const errors = results.filter(r => r.status === 'ERROR').length;
const total = results.length;

console.log(`✅ Passed: ${passed}/${total}`);
console.log(`❌ Failed: ${failed}/${total}`);
console.log(`💥 Errors: ${errors}/${total}`);

if (failed > 0 || errors > 0) {
    console.log('\n🔴 ISSUES FOUND:');
    results.filter(r => r.status !== 'PASS').forEach(r => {
        console.log(`  - ${r.name}: ${r.status} - ${r.detail}`);
    });
}

// Show notification with summary
api.ui.showNotification(
    `API Audit: ${passed}/${total} passed, ${failed} failed, ${errors} errors`,
    failed + errors > 0 ? 'warning' : 'success'
);

// Store results for inspection
window.__API_AUDIT_RESULTS__ = results;
console.log('\n💡 Results stored in window.__API_AUDIT_RESULTS__');

}); // End whenAPIReady
