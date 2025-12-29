/**
 * Bushwick Express - Custom NYC Career Mission
 *
 * Connect Bushwick to Manhattan! Build a transit line that serves
 * the creative heart of Brooklyn and gets artists to their jobs
 * in Manhattan.
 *
 * This mission uses GEOGRAPHIC METRICS - tracking actual passenger
 * flows from Bushwick to Lower Manhattan based on where people
 * live and work.
 */

// Wait for API to be ready
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
    console.log('[Bushwick Express] Loading...');

    // Get pre-defined NYC regions from the API
    const { BUSHWICK, LOWER_MANHATTAN, WILLIAMSBURG } = api.career.REGIONS.NYC;

    // Register the Bushwick Express mission with geographic goals
    const success = api.career.registerMission({
        id: 'bushwick-express.connect-manhattan',
        cityCode: 'NYC',
        name: 'Bushwick Express',
        description:
            'Connect Bushwick to Lower Manhattan! Track actual passenger flows from Brooklyn to downtown jobs.',
        tier: 'starter',
        stars: [
            {
                id: 'star1',
                label: 'Build stations in Bushwick and Williamsburg',
                shortLabel: '3 Bushwick Stations',
                icon: '🚇',
                metric: api.career.METRICS.STATIONS_IN_REGION,
                target: 3,
                params: {
                    // Combined Bushwick + Williamsburg area
                    bbox: [-73.9700, 40.6880, -73.9050, 40.7250],
                },
                howTo: [
                    'Open the BUILD panel',
                    'Place stations in Bushwick (eastern Brooklyn)',
                    'Target the residential areas (red on heatmap)',
                    'Artists and creatives live here!',
                ],
                actionPanel: 'construction',
                actionLabel: 'Start Building',
            },
            {
                id: 'star2',
                label: 'Transport 1,000 passengers from Bushwick to Lower Manhattan',
                shortLabel: '1K Bushwick→Manhattan',
                icon: '🎨',
                metric: api.career.METRICS.PASSENGERS_BETWEEN_REGIONS,
                target: 1000,
                params: {
                    originBbox: BUSHWICK,
                    destBbox: LOWER_MANHATTAN,
                },
                howTo: [
                    'Bushwick residents commute to Manhattan jobs',
                    'Build a direct line from Bushwick through Williamsburg',
                    'Cross the East River to Lower Manhattan',
                    'Track your progress as commuters use your line!',
                ],
                actionPanel: 'demand-stats',
                actionLabel: 'View Demand',
            },
            {
                id: 'star3',
                label: 'Transport 5,000 passengers from Bushwick to Manhattan',
                shortLabel: '5K Bushwick→Manhattan',
                icon: '🌆',
                metric: api.career.METRICS.PASSENGERS_BETWEEN_REGIONS,
                target: 5000,
                params: {
                    originBbox: BUSHWICK,
                    destBbox: LOWER_MANHATTAN,
                },
                howTo: [
                    'Scale up your Bushwick service',
                    'Add more trains for shorter wait times',
                    'Expand station coverage in Bushwick',
                    'Make the commute faster than driving!',
                ],
            },
        ],
    });

    if (success) {
        console.log('[Bushwick Express] Mission registered successfully!');
        console.log('[Bushwick Express] Bushwick bbox:', BUSHWICK);
        console.log('[Bushwick Express] Lower Manhattan bbox:', LOWER_MANHATTAN);
        api.ui.showNotification('Bushwick Express: Geographic mission added to NYC!', 'success');
    } else {
        console.error('[Bushwick Express] Failed to register mission');
    }
});
