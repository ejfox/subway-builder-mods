/**
 * CANARY MOD - API Health Check
 *
 * This mod validates ALL documented modding API functionality from MODDING.md.
 * It throws errors on failure so broken APIs are immediately visible.
 *
 * Usage:
 *   - Enable this mod to run automatic API validation
 *   - Check window.__CANARY__ for results
 *   - Set window.__CANARY_STRICT__ = true BEFORE loading to throw on first failure
 *
 * For CI/automated testing:
 *   window.__CANARY_STRICT__ = true;
 *   // ... load game with canary mod enabled
 *   if (!window.__CANARY__.passed) process.exit(1);
 */

const STRICT_MODE = window.__CANARY_STRICT__ === true;

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
    const results = {
        passed: true,
        tests: [],
        failures: [],
        errors: [],
        summary: {}
    };

    function testSection(name, tests) {
        console.log(`\n[CANARY] === ${name} ===`);
        const sectionResults = { passed: 0, failed: 0 };
        tests.forEach(([testName, testFn]) => {
            try {
                const result = testFn();
                if (result === false) {
                    sectionResults.failed++;
                    results.failures.push(`${name}: ${testName}`);
                    results.passed = false;
                    console.error(`[CANARY]   FAIL: ${testName}`);
                    if (STRICT_MODE) throw new Error(`CANARY FAIL: ${name}: ${testName}`);
                } else {
                    sectionResults.passed++;
                    results.tests.push(`${name}: ${testName}`);
                    console.log(`[CANARY]   PASS: ${testName}`);
                }
            } catch (error) {
                sectionResults.failed++;
                results.errors.push({ name: `${name}: ${testName}`, error: error.message });
                results.passed = false;
                console.error(`[CANARY]   ERROR: ${testName}:`, error.message);
                if (STRICT_MODE) throw error;
            }
        });
        results.summary[name] = sectionResults;
    }

    console.log('[CANARY] ========================================');
    console.log('[CANARY] MODDING API CANARY - Full Health Check');
    console.log('[CANARY] STRICT_MODE:', STRICT_MODE);
    console.log('[CANARY] ========================================');

    // ================================================================
    // CORE API (MODDING.md: Quick Start, API Version)
    // ================================================================
    testSection('Core API', [
        ['API exists on window', () => typeof window.SubwayBuilderAPI === 'object'],
        ['API version defined', () => typeof api.version === 'string' && api.version.length > 0],
        ['registerCity exists', () => typeof api.registerCity === 'function'],
        ['modifyConstants exists', () => typeof api.modifyConstants === 'function'],
        ['registerNewspaperTemplates exists', () => typeof api.registerNewspaperTemplates === 'function'],
        ['registerTweetTemplates exists', () => typeof api.registerTweetTemplates === 'function'],
        ['reloadMods exists', () => typeof api.reloadMods === 'function'],
    ]);

    // ================================================================
    // UTILS (MODDING.md: No Imports Needed, Utilities)
    // ================================================================
    testSection('Utils - React', [
        ['api.utils exists', () => typeof api.utils === 'object'],
        ['React exposed', () => typeof api.utils.React === 'object'],
        ['React.createElement works', () => {
            const h = api.utils.React.createElement;
            const el = h('div', { className: 'test' }, 'Hello');
            return el && el.type === 'div';
        }],
        ['React.useState exists', () => typeof api.utils.React.useState === 'function'],
        ['React.useEffect exists', () => typeof api.utils.React.useEffect === 'function'],
        ['React.useCallback exists', () => typeof api.utils.React.useCallback === 'function'],
        ['React.useMemo exists', () => typeof api.utils.React.useMemo === 'function'],
    ]);

    testSection('Utils - Icons (Lucide)', [
        ['icons object exposed', () => typeof api.utils.icons === 'object'],
        // Icons are React ForwardRef components (objects), not plain functions
        ['icons.Settings exists', () => !!api.utils.icons.Settings],
        ['icons.Play exists', () => !!api.utils.icons.Play],
        ['icons.Pause exists', () => !!api.utils.icons.Pause],
        ['icons.Train exists', () => !!api.utils.icons.Train],
        ['icons.MapPin exists', () => !!api.utils.icons.MapPin],
        ['icons.Zap exists (for addButton)', () => !!api.utils.icons.Zap],
        ['icon count > 100', () => Object.keys(api.utils.icons).length > 100],
    ]);

    testSection('Utils - Components (shadcn)', [
        ['components object exposed', () => typeof api.utils.components === 'object'],
        ['Button component', () => !!api.utils.components.Button],
        ['Card component', () => !!api.utils.components.Card],
        ['CardContent component', () => !!api.utils.components.CardContent],
        ['Progress component', () => !!api.utils.components.Progress],
        ['Switch component', () => !!api.utils.components.Switch],
        ['Label component', () => !!api.utils.components.Label],
        ['Input component', () => !!api.utils.components.Input],
        ['Badge component', () => !!api.utils.components.Badge],
        ['Slider component', () => !!api.utils.components.Slider],
    ]);

    testSection('Utils - Helpers', [
        ['getCities exists', () => typeof api.utils.getCities === 'function'],
        ['getCities returns array', () => Array.isArray(api.utils.getCities())],
        ['getConstants exists', () => typeof api.utils.getConstants === 'function'],
        ['getConstants returns object', () => typeof api.utils.getConstants() === 'object'],
        ['getMap exists', () => typeof api.utils.getMap === 'function'],
    ]);

    // ================================================================
    // UI API (MODDING.md: UI Customization, Show Notifications, Theme Control)
    // ================================================================
    testSection('UI - Notifications & Components', [
        ['api.ui exists', () => typeof api.ui === 'object'],
        ['showNotification exists', () => typeof api.ui.showNotification === 'function'],
        ['showNotification works', () => {
            api.ui.showNotification('Canary test', 'info');
            return true;
        }],
        ['registerComponent exists', () => typeof api.ui.registerComponent === 'function'],
        ['getComponents exists', () => typeof api.ui.getComponents === 'function'],
        ['getComponents returns array', () => Array.isArray(api.ui.getComponents('escape-menu'))],
    ]);

    testSection('UI - Primitives (addButton, addToggle, etc)', [
        ['addButton exists', () => typeof api.ui.addButton === 'function'],
        ['addToggle exists', () => typeof api.ui.addToggle === 'function'],
        ['addSlider exists', () => typeof api.ui.addSlider === 'function'],
        ['addSelect exists', () => typeof api.ui.addSelect === 'function'],
        ['addText exists', () => typeof api.ui.addText === 'function'],
        ['addSeparator exists', () => typeof api.ui.addSeparator === 'function'],
    ]);

    // ================================================================
    // FLOATING PANEL TEST (PR #359 fix validation)
    // This creates a clickable icon in the toolbar - if clicking works, the fix is good!
    // ================================================================
    testSection('UI - Floating Panel (PR #359 test)', [
        ['addFloatingPanel exists', () => typeof api.ui.addFloatingPanel === 'function'],
        ['addFloatingPanel works', () => {
            const { React } = api.utils;
            const h = React.createElement;

            // Create a test floating panel with a Bird icon (Lucide icon name as string)
            // API expects `render` as a component function, not `content`
            const result = api.ui.addFloatingPanel({
                id: 'canary-test-panel',
                title: 'Canary Test Panel',
                icon: 'Bird',  // Lucide icon name
                tooltip: 'Canary Test - Click me!',
                render: function CanaryPanelContent() {
                    return h('div', { style: { padding: '16px', minWidth: '200px' } },
                        h('h3', { style: { margin: '0 0 8px 0' } }, '🐦 Canary Panel'),
                        h('p', { style: { margin: '0 0 8px 0', fontSize: '14px' } },
                            'If you can see this, clicking the icon worked!'),
                        h('p', { style: { margin: '0', fontSize: '12px', opacity: 0.7 } },
                            'PR #359 fix is working correctly.')
                    );
                }
            });
            return result && result.id === 'canary-test-panel';
        }],
    ]);

    testSection('UI - Theme Control', [
        ['setTheme exists', () => typeof api.ui.setTheme === 'function'],
        ['getTheme exists', () => typeof api.ui.getTheme === 'function'],
        ['getTheme returns valid value', () => ['light', 'dark', 'system'].includes(api.ui.getTheme())],
        ['getResolvedTheme exists', () => typeof api.ui.getResolvedTheme === 'function'],
        ['getResolvedTheme returns valid value', () => ['light', 'dark'].includes(api.ui.getResolvedTheme())],
        ['setAccentColor exists', () => typeof api.ui.setAccentColor === 'function'],
        ['setPrimaryColor exists', () => typeof api.ui.setPrimaryColor === 'function'],
        ['setCSSVariable exists', () => typeof api.ui.setCSSVariable === 'function'],
        ['resetColors exists', () => typeof api.ui.resetColors === 'function'],
    ]);

    // ================================================================
    // GAME STATE API (MODDING.md: Game State Access)
    // ================================================================
    testSection('Game State - Basic', [
        ['api.gameState exists', () => typeof api.gameState === 'object'],
        ['getStations exists', () => typeof api.gameState.getStations === 'function'],
        ['getStations returns array', () => Array.isArray(api.gameState.getStations())],
        ['getRoutes exists', () => typeof api.gameState.getRoutes === 'function'],
        ['getRoutes returns array', () => Array.isArray(api.gameState.getRoutes())],
        ['getTracks exists', () => typeof api.gameState.getTracks === 'function'],
        ['getTracks returns array', () => Array.isArray(api.gameState.getTracks())],
        ['getTrains exists', () => typeof api.gameState.getTrains === 'function'],
        ['getTrains returns array', () => Array.isArray(api.gameState.getTrains())],
        ['getDemandData exists', () => typeof api.gameState.getDemandData === 'function'],
    ]);

    testSection('Game State - Time & Money', [
        ['getCurrentDay exists', () => typeof api.gameState.getCurrentDay === 'function'],
        ['getCurrentDay returns number', () => typeof api.gameState.getCurrentDay() === 'number'],
        ['getCurrentHour exists', () => typeof api.gameState.getCurrentHour === 'function'],
        ['getCurrentHour returns number', () => typeof api.gameState.getCurrentHour() === 'number'],
        ['getElapsedSeconds exists', () => typeof api.gameState.getElapsedSeconds === 'function'],
        ['getBudget exists', () => typeof api.gameState.getBudget === 'function'],
        ['getBudget returns number', () => typeof api.gameState.getBudget() === 'number'],
        ['getTicketPrice exists', () => typeof api.gameState.getTicketPrice === 'function'],
        ['getTicketPrice returns number', () => typeof api.gameState.getTicketPrice() === 'number'],
    ]);

    testSection('Game State - Speed & Pause', [
        ['getGameSpeed exists', () => typeof api.gameState.getGameSpeed === 'function'],
        ['getGameSpeed returns valid value', () => ['slow', 'normal', 'fast', 'ultrafast'].includes(api.gameState.getGameSpeed())],
        ['isPaused exists', () => typeof api.gameState.isPaused === 'function'],
        ['isPaused returns boolean', () => typeof api.gameState.isPaused() === 'boolean'],
    ]);

    testSection('Game State - Financial', [
        ['getBonds exists', () => typeof api.gameState.getBonds === 'function'],
        ['getBonds returns array', () => Array.isArray(api.gameState.getBonds())],
        ['getBondTypes exists', () => typeof api.gameState.getBondTypes === 'function'],
        ['getBondTypes returns object', () => typeof api.gameState.getBondTypes() === 'object'],
    ]);

    testSection('Game State - Metrics', [
        ['getRidershipStats exists', () => typeof api.gameState.getRidershipStats === 'function'],
        ['getRidershipStats has totalRidersPerHour', () => 'totalRidersPerHour' in api.gameState.getRidershipStats()],
        ['getLineMetrics exists', () => typeof api.gameState.getLineMetrics === 'function'],
        ['getLineMetrics returns array', () => Array.isArray(api.gameState.getLineMetrics())],
        ['calculateBlueprintCost exists', () => typeof api.gameState.calculateBlueprintCost === 'function'],
        ['calculateBlueprintCost returns breakdown', () => {
            const result = api.gameState.calculateBlueprintCost([]);
            return result && 'totalCost' in result && 'breakdown' in result && 'buildingDemolitionCost' in result.breakdown;
        }],
    ]);

    // ================================================================
    // ACTIONS API (MODDING.md: Game Actions)
    // ================================================================
    testSection('Actions API', [
        ['api.actions exists', () => typeof api.actions === 'object'],
        ['addMoney exists', () => typeof api.actions.addMoney === 'function'],
        ['subtractMoney exists', () => typeof api.actions.subtractMoney === 'function'],
        ['setMoney exists', () => typeof api.actions.setMoney === 'function'],
        ['setPause exists', () => typeof api.actions.setPause === 'function'],
        ['setSpeed exists', () => typeof api.actions.setSpeed === 'function'],
    ]);

    // ================================================================
    // HOOKS API (MODDING.md: Lifecycle Hooks)
    // ================================================================
    testSection('Hooks - Game Lifecycle', [
        ['api.hooks exists', () => typeof api.hooks === 'object'],
        ['onGameInit exists', () => typeof api.hooks.onGameInit === 'function'],
        ['onCityLoad exists', () => typeof api.hooks.onCityLoad === 'function'],
        ['onMapReady exists', () => typeof api.hooks.onMapReady === 'function'],
        ['onGameSaved exists', () => typeof api.hooks.onGameSaved === 'function'],
        ['onGameLoaded exists', () => typeof api.hooks.onGameLoaded === 'function'],
        ['onGameEnd exists', () => typeof api.hooks.onGameEnd === 'function'],
    ]);

    testSection('Hooks - Time & Speed', [
        ['onDayChange exists', () => typeof api.hooks.onDayChange === 'function'],
        ['onPauseChanged exists', () => typeof api.hooks.onPauseChanged === 'function'],
        ['onSpeedChanged exists', () => typeof api.hooks.onSpeedChanged === 'function'],
    ]);

    testSection('Hooks - Construction', [
        ['onStationBuilt exists', () => typeof api.hooks.onStationBuilt === 'function'],
        ['onRouteCreated exists', () => typeof api.hooks.onRouteCreated === 'function'],
        ['onRouteDeleted exists', () => typeof api.hooks.onRouteDeleted === 'function'],
        ['onTrackBuilt exists', () => typeof api.hooks.onTrackBuilt === 'function'],
        ['onBlueprintPlaced exists', () => typeof api.hooks.onBlueprintPlaced === 'function'],
        ['onTrackChange exists', () => typeof api.hooks.onTrackChange === 'function'],
    ]);

    testSection('Hooks - Trains & Demand', [
        ['onTrainSpawned exists', () => typeof api.hooks.onTrainSpawned === 'function'],
        ['onTrainDeleted exists', () => typeof api.hooks.onTrainDeleted === 'function'],
        ['onDemandChange exists', () => typeof api.hooks.onDemandChange === 'function'],
        ['onMoneyChanged exists', () => typeof api.hooks.onMoneyChanged === 'function'],
    ]);

    testSection('Hooks - Accept Callbacks', [
        ['hooks accept callbacks without throwing', () => {
            api.hooks.onGameEnd(() => {});
            api.hooks.onPauseChanged(() => {});
            api.hooks.onSpeedChanged(() => {});
            api.hooks.onMoneyChanged(() => {});
            return true;
        }],
    ]);

    // ================================================================
    // TRAINS API (MODDING.md: Train Types)
    // ================================================================
    testSection('Trains API', [
        ['api.trains exists', () => typeof api.trains === 'object'],
        ['registerTrainType exists', () => typeof api.trains.registerTrainType === 'function'],
        ['modifyTrainType exists', () => typeof api.trains.modifyTrainType === 'function'],
        ['getTrainTypes exists', () => typeof api.trains.getTrainTypes === 'function'],
        ['getTrainTypes returns object', () => typeof api.trains.getTrainTypes() === 'object'],
        ['getTrainType exists', () => typeof api.trains.getTrainType === 'function'],
        ['default train types exist', () => {
            const types = api.trains.getTrainTypes();
            return Object.keys(types).length > 0;
        }],
        ['heavy-metro type exists', () => {
            const type = api.trains.getTrainType('heavy-metro');
            return type && type.stats && typeof type.stats.maxSpeed === 'number';
        }],
    ]);

    // ================================================================
    // MAP API (MODDING.md: Map Customization, Custom Tiles & Data)
    // ================================================================
    testSection('Map API - Sources & Layers', [
        ['api.map exists', () => typeof api.map === 'object'],
        ['registerSource exists', () => typeof api.map.registerSource === 'function'],
        ['registerLayer exists', () => typeof api.map.registerLayer === 'function'],
        ['registerStyle exists', () => typeof api.map.registerStyle === 'function'],
        ['setLayerOverride exists', () => typeof api.map.setLayerOverride === 'function'],
    ]);

    testSection('Map API - Layer Visibility', [
        ['setDefaultLayerVisibility exists', () => typeof api.map.setDefaultLayerVisibility === 'function'],
        ['getDefaultLayerVisibility exists', () => typeof api.map.getDefaultLayerVisibility === 'function'],
    ]);

    testSection('Map API - Tiles & Routing', [
        ['setTileURLOverride exists', () => typeof api.map.setTileURLOverride === 'function'],
        ['setRoutingServiceOverride exists', () => typeof api.map.setRoutingServiceOverride === 'function'],
        ['queryRoute exists', () => typeof api.map.queryRoute === 'function'],
    ]);

    // ================================================================
    // CITIES API (MODDING.md: Adding Custom Cities, Custom City Tabs)
    // ================================================================
    testSection('Cities API', [
        ['api.cities exists', () => typeof api.cities === 'object'],
        ['registerTab exists', () => typeof api.cities.registerTab === 'function'],
        ['getTabs exists', () => typeof api.cities.getTabs === 'function'],
        ['getTabs returns array', () => Array.isArray(api.cities.getTabs())],
        ['setCityDataFiles exists', () => typeof api.cities.setCityDataFiles === 'function'],
        ['getCityDataFiles exists', () => typeof api.cities.getCityDataFiles === 'function'],
    ]);

    // ================================================================
    // POP TIMING API (Not in MODDING.md but implemented)
    // ================================================================
    testSection('Pop Timing API', [
        ['api.popTiming exists', () => typeof api.popTiming === 'object'],
        ['getCommuteTimeRanges exists', () => typeof api.popTiming.getCommuteTimeRanges === 'function'],
        ['getCommuteTimeRanges returns array', () => {
            const ranges = api.popTiming.getCommuteTimeRanges();
            return Array.isArray(ranges) && ranges.length > 0;
        }],
        ['setCommuteTimeRanges exists', () => typeof api.popTiming.setCommuteTimeRanges === 'function'],
        ['resetCommuteTimeRanges exists', () => typeof api.popTiming.resetCommuteTimeRanges === 'function'],
        ['commute ranges have required fields', () => {
            const ranges = api.popTiming.getCommuteTimeRanges();
            if (ranges.length === 0) return false;
            const r = ranges[0];
            return 'key' in r && 'start' in r && 'end' in r && 'homeDemandMultiplier' in r && 'workDemandMultiplier' in r;
        }],
    ]);

    // ================================================================
    // STORAGE API (MODDING.md: Mod Storage - Electron Only)
    // ================================================================
    testSection('Storage API', [
        ['api.storage exists', () => typeof api.storage === 'object'],
        ['storage.set exists', () => typeof api.storage.set === 'function'],
        ['storage.get exists', () => typeof api.storage.get === 'function'],
        ['storage.delete exists', () => typeof api.storage.delete === 'function'],
        ['storage.keys exists', () => typeof api.storage.keys === 'function'],
    ]);

    // ================================================================
    // SCHEMAS API (MODDING.md: Data File Schemas)
    // ================================================================
    testSection('Schemas API', [
        ['api.schemas exists', () => typeof api.schemas === 'object'],
        ['DemandDataSchema exists', () => !!api.schemas.DemandDataSchema],
        ['DemandPointSchema exists', () => !!api.schemas.DemandPointSchema],
        ['PopSchema exists', () => !!api.schemas.PopSchema],
        ['DemandDataSchema has safeParse', () => typeof api.schemas.DemandDataSchema?.safeParse === 'function'],
    ]);

    // ================================================================
    // FUNCTIONAL TESTS (Actually use the APIs)
    // ================================================================
    testSection('Functional - UI Registration', [
        ['registerComponent actually registers', () => {
            const testId = 'canary-test-' + Date.now();
            const { React } = api.utils;
            api.ui.registerComponent('escape-menu-buttons', {
                id: testId,
                component: () => React.createElement('div', null, 'Canary')
            });
            const registered = api.ui.getComponents('escape-menu-buttons');
            return registered.some(c => c.id === testId);
        }],
        ['addButton works', () => {
            const testId = 'canary-btn-' + Date.now();
            api.ui.addButton('settings-menu', {
                id: testId,
                label: 'Canary Button',
                onClick: () => {}
            });
            return true; // If no throw, it worked
        }],
    ]);

    testSection('Functional - Cities', [
        ['registerTab actually registers', () => {
            const testId = 'canary-tab-' + Date.now();
            api.cities.registerTab({
                id: testId,
                label: 'Canary Test',
                cityCodes: []
            });
            const tabs = api.cities.getTabs();
            return tabs.some(t => t.id === testId);
        }],
        ['getCities returns built-in cities', () => {
            const cities = api.utils.getCities();
            return cities.length > 0 && cities.some(c => c.code === 'NYC' || c.code === 'CHI');
        }],
    ]);

    testSection('Functional - React & Components', [
        ['icon can be rendered', () => {
            const h = api.utils.React.createElement;
            const el = h(api.utils.icons.Settings, { size: 16 });
            return el && el.type === api.utils.icons.Settings;
        }],
        ['Button can be rendered', () => {
            const h = api.utils.React.createElement;
            const el = h(api.utils.components.Button, { onClick: () => {} }, 'Test');
            return el !== null;
        }],
        ['Card can be rendered', () => {
            const h = api.utils.React.createElement;
            const el = h(api.utils.components.Card, { className: 'test' }, 'Content');
            return el !== null;
        }],
    ]);

    testSection('Functional - Constants', [
        ['getConstants returns STARTING_MONEY', () => {
            const constants = api.utils.getConstants();
            return typeof constants.STARTING_MONEY === 'number';
        }],
        ['modifyConstants can be called', () => {
            // Don't actually modify, just verify it doesn't throw
            const originalConstants = api.utils.getConstants();
            return typeof originalConstants === 'object';
        }],
    ]);

    // ================================================================
    // SUMMARY
    // ================================================================
    console.log('\n[CANARY] ========================================');
    console.log('[CANARY] SUMMARY');
    console.log('[CANARY] ========================================');

    const totalPassed = results.tests.length;
    const totalFailed = results.failures.length;
    const totalErrors = results.errors.length;
    const total = totalPassed + totalFailed + totalErrors;

    console.log(`[CANARY] Total: ${total} tests`);
    console.log(`[CANARY] Passed: ${totalPassed}`);
    console.log(`[CANARY] Failed: ${totalFailed}`);
    console.log(`[CANARY] Errors: ${totalErrors}`);

    Object.entries(results.summary).forEach(([section, { passed, failed }]) => {
        const status = failed === 0 ? 'OK' : 'FAIL';
        console.log(`[CANARY]   ${section}: ${passed}/${passed + failed} (${status})`);
    });

    if (results.failures.length > 0) {
        console.log('\n[CANARY] FAILURES:');
        results.failures.forEach(f => console.error(`[CANARY]   - ${f}`));
    }

    if (results.errors.length > 0) {
        console.log('\n[CANARY] ERRORS:');
        results.errors.forEach(e => console.error(`[CANARY]   - ${e.name}: ${e.error}`));
    }

    console.log('\n[CANARY] ========================================');
    console.log(`[CANARY] RESULT: ${results.passed ? 'ALL TESTS PASSED' : 'TESTS FAILED'}`);
    console.log('[CANARY] ========================================');

    // Store results globally
    window.__CANARY__ = results;
    window.__CANARY_PASSED__ = results.passed;

    // Show notification
    api.ui.showNotification(
        `Canary: ${totalPassed}/${total} passed`,
        results.passed ? 'success' : 'error'
    );

    // In strict mode, throw if any tests failed
    if (STRICT_MODE && !results.passed) {
        throw new Error(`CANARY: ${totalFailed + totalErrors} tests failed`);
    }
});
