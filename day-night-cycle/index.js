/**
 * Day/Night Theme Cycle Mod
 *
 * Automatically switches between light and dark theme based on in-game time.
 * - Day (6:00 - 17:59): Light theme
 * - Night (18:00 - 5:59): Dark theme
 *
 * This mod demonstrates:
 * - Using gameState.getCurrentHour() to read game time
 * - Using ui.setTheme() to change the app theme
 * - Using hooks.onGameInit() for initialization
 * - Using setInterval for periodic checks
 */

(function () {
    'use strict';

    // Configuration
    const DAY_START_HOUR = 6;  // 6:00 AM
    const DAY_END_HOUR = 18;   // 6:00 PM

    // State tracking
    let lastThemeWasDay = null;
    let checkInterval = null;
    let originalTheme = null;

    /**
     * Check if the current hour is daytime
     */
    function isDaytime(hour) {
        return hour >= DAY_START_HOUR && hour < DAY_END_HOUR;
    }

    /**
     * Update theme based on current game hour
     */
    let lastLoggedHour = -1;
    function updateTheme() {
        const api = window.SubwayBuilderAPI;
        if (!api) return;

        const currentHour = api.gameState.getCurrentHour();
        const elapsedSeconds = api.gameState.getElapsedSeconds();
        const isDay = isDaytime(currentHour);

        // Log when hour changes (for debugging)
        if (currentHour !== lastLoggedHour) {
            console.log(`[Day/Night Mod] Hour changed to: ${currentHour} (elapsed: ${elapsedSeconds}s, isDay: ${isDay})`);
            lastLoggedHour = currentHour;
        }

        // Only change theme if it's different from last state
        if (lastThemeWasDay !== isDay) {
            const newTheme = isDay ? 'light' : 'dark';
            api.ui.setTheme(newTheme);

            // Show notification on theme change (skip initial)
            if (lastThemeWasDay !== null) {
                const timeStr = isDay ? 'sunrise' : 'sunset';
                api.ui.showNotification(
                    `Theme changed to ${newTheme} (${timeStr})`,
                    'info'
                );
            }

            lastThemeWasDay = isDay;
            console.log(`[Day/Night Mod] Theme changed to: ${newTheme}`);
        }
    }

    /**
     * Initialize the mod
     */
    function init() {
        const api = window.SubwayBuilderAPI;
        if (!api) {
            console.error('[Day/Night Mod] SubwayBuilderAPI not found!');
            return;
        }

        console.log('[Day/Night Mod] Initializing...');

        // Store the original theme setting so we can restore it if needed
        originalTheme = api.ui.getTheme();

        // Do initial theme update
        updateTheme();

        // Check every game second (real-time interval)
        // Game time moves faster than real time, so we check frequently
        checkInterval = setInterval(updateTheme, 1000);

        console.log('[Day/Night Mod] Active! Theme will change at 6:00 and 18:00 game time.');
        api.ui.showNotification('Day/Night cycle mod loaded!', 'success');
    }

    /**
     * Cleanup function (called if mod is disabled)
     */
    function cleanup() {
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
        }

        // Restore original theme
        if (originalTheme && window.SubwayBuilderAPI) {
            window.SubwayBuilderAPI.ui.setTheme(originalTheme);
        }

        console.log('[Day/Night Mod] Disabled');
    }

    // Wait for API to be available, then init
    function tryInit() {
        if (window.SubwayBuilderAPI) {
            // Check if game is already initialized (we might be loading after game start)
            const elapsedSeconds = window.SubwayBuilderAPI.gameState.getElapsedSeconds();
            if (elapsedSeconds > 0) {
                // Game already running, init immediately
                console.log('[Day/Night Mod] Game already running, initializing immediately');
                init();
            } else {
                // Wait for game init
                window.SubwayBuilderAPI.hooks.onGameInit(init);
            }
            return true;
        }
        return false;
    }

    if (!tryInit()) {
        // Wait for API to load
        const checkForAPI = setInterval(() => {
            if (tryInit()) {
                clearInterval(checkForAPI);
            }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkForAPI);
            if (!window.SubwayBuilderAPI) {
                console.error('[Day/Night Mod] Timed out waiting for SubwayBuilderAPI');
            }
        }, 10000);
    }

    // Expose cleanup for potential mod manager
    window.DayNightCycleMod = {
        cleanup,
        updateTheme,
        isDaytime,
    };

})();
