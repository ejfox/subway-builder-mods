/**
 * Rush Hour Remix
 * - Two commute windows (AM + PM)
 * - Optional weekend demand boost (simulated via bonus revenue)
 */

const API = window.SubwayBuilderAPI;

const DEFAULTS = {
    amStart: 7,
    amEnd: 9,
    pmStart: 17,
    pmEnd: 19,
    weekendBoostEnabled: true,
    weekendBoostMultiplier: 0.12,
    weekendRandomRange: 0.2,
    weekendNotifyEnabled: true,
};

let currentSettings = { ...DEFAULTS };
let lastWasWeekend = null;

const clampHour = (value) => Math.max(0, Math.min(23, Math.round(value)));

const normalizeRanges = (settings) => {
    const next = { ...settings };
    next.amStart = clampHour(next.amStart);
    next.amEnd = clampHour(next.amEnd);
    next.pmStart = clampHour(next.pmStart);
    next.pmEnd = clampHour(next.pmEnd);

    if (next.amEnd <= next.amStart) next.amEnd = Math.min(23, next.amStart + 1);
    if (next.pmEnd <= next.pmStart) next.pmEnd = Math.min(23, next.pmStart + 1);

    return next;
};

const applyCommuteRanges = (settings) => {
    const ranges = [
        { start: settings.amStart, end: settings.amEnd },
        { start: settings.pmStart, end: settings.pmEnd },
    ];
    API.popTiming.setCommuteTimeRanges(ranges);
};

const loadSettings = async () => {
    const stored = await API.storage.get('settings', DEFAULTS);
    currentSettings = normalizeRanges({ ...DEFAULTS, ...stored });
    return currentSettings;
};

const saveSettings = async (settings) => {
    currentSettings = normalizeRanges(settings);
    await API.storage.set('settings', currentSettings);
    applyCommuteRanges(currentSettings);
};

const getTotalPopSize = () => {
    const demandData = API.gameState.getDemandData();
    if (!demandData) return 0;

    let total = 0;
    demandData.popsMap.forEach((pop) => {
        total += pop.size || 0;
    });
    return total;
};

const isWeekend = (dayNumber) => {
    const mod = dayNumber % 7;
    return mod === 6 || mod === 0;
};

const applyWeekendBoost = (dayNumber) => {
    if (!currentSettings.weekendBoostEnabled) return;
    if (!isWeekend(dayNumber)) return;

    const totalPop = getTotalPopSize();
    if (!totalPop) return;

    const ticketPrice = API.gameState.getTicketPrice();
    const base = totalPop * ticketPrice * currentSettings.weekendBoostMultiplier;
    const jitter = 1 + (Math.random() * 2 - 1) * currentSettings.weekendRandomRange;
    const bonus = Math.max(0, Math.round(base * jitter));

    if (bonus > 0) {
        API.actions.addMoney(bonus, 'bonus');
    }

    return bonus;
};

const registerUI = (settings) => {
    API.ui.addSeparator('settings-menu', { id: 'rush-hour-sep' });
    API.ui.addText('settings-menu', {
        id: 'rush-hour-title',
        text: 'Rush Hour Remix',
        className: 'text-sm font-medium',
    });

    const weekendStatus = isWeekend(API.gameState.getCurrentDay()) ? 'ON' : 'OFF';
    API.ui.addText('settings-menu', {
        id: 'rush-hour-weekend-status',
        text: `Weekend boost status: ${weekendStatus}`,
        className: 'text-xs text-muted-foreground',
    });

    API.ui.addSlider('settings-menu', {
        id: 'rush-hour-am-start',
        label: 'AM start (hour)',
        min: 0,
        max: 23,
        step: 1,
        defaultValue: settings.amStart,
        onChange: (value) => saveSettings({ ...currentSettings, amStart: value }),
    });

    API.ui.addSlider('settings-menu', {
        id: 'rush-hour-am-end',
        label: 'AM end (hour)',
        min: 0,
        max: 23,
        step: 1,
        defaultValue: settings.amEnd,
        onChange: (value) => saveSettings({ ...currentSettings, amEnd: value }),
    });

    API.ui.addSlider('settings-menu', {
        id: 'rush-hour-pm-start',
        label: 'PM start (hour)',
        min: 0,
        max: 23,
        step: 1,
        defaultValue: settings.pmStart,
        onChange: (value) => saveSettings({ ...currentSettings, pmStart: value }),
    });

    API.ui.addSlider('settings-menu', {
        id: 'rush-hour-pm-end',
        label: 'PM end (hour)',
        min: 0,
        max: 23,
        step: 1,
        defaultValue: settings.pmEnd,
        onChange: (value) => saveSettings({ ...currentSettings, pmEnd: value }),
    });

    API.ui.addToggle('settings-menu', {
        id: 'rush-hour-weekend-enabled',
        label: 'Weekend demand boost',
        defaultValue: settings.weekendBoostEnabled,
        onChange: (value) => saveSettings({ ...currentSettings, weekendBoostEnabled: value }),
    });

    API.ui.addSlider('settings-menu', {
        id: 'rush-hour-weekend-multiplier',
        label: 'Weekend boost multiplier',
        min: 0,
        max: 0.5,
        step: 0.01,
        defaultValue: settings.weekendBoostMultiplier,
        onChange: (value) => saveSettings({ ...currentSettings, weekendBoostMultiplier: value }),
    });

    API.ui.addSlider('settings-menu', {
        id: 'rush-hour-weekend-random',
        label: 'Weekend randomness',
        min: 0,
        max: 0.5,
        step: 0.01,
        defaultValue: settings.weekendRandomRange,
        onChange: (value) => saveSettings({ ...currentSettings, weekendRandomRange: value }),
    });

    API.ui.addToggle('settings-menu', {
        id: 'rush-hour-weekend-notify',
        label: 'Weekend boost notification',
        defaultValue: settings.weekendNotifyEnabled,
        onChange: (value) => saveSettings({ ...currentSettings, weekendNotifyEnabled: value }),
    });

    API.ui.addText('settings-menu', {
        id: 'rush-hour-weekend-note',
        text: 'Weekend is day 6/7 based on in-game day count. Boost is simulated via bonus revenue.',
        className: 'text-xs text-muted-foreground',
    });
};

const init = async () => {
    if (!API) return;

    const settings = await loadSettings();
    applyCommuteRanges(settings);
    registerUI(settings);
    lastWasWeekend = isWeekend(API.gameState.getCurrentDay());

    API.hooks.onDayChange((dayNumber) => {
        const weekendNow = isWeekend(dayNumber);
        const bonus = applyWeekendBoost(dayNumber) || 0;

        if (currentSettings.weekendNotifyEnabled) {
            if (weekendNow && !lastWasWeekend) {
                const multiplierPct = Math.round(currentSettings.weekendBoostMultiplier * 100);
                const jitterPct = Math.round(currentSettings.weekendRandomRange * 100);
                const bonusLabel = bonus > 0 ? ` +$${bonus.toLocaleString()}` : '';
                API.ui.showNotification(
                    `Weekend boost started (Day ${dayNumber}).${bonusLabel} (${multiplierPct}% ±${jitterPct}%)`,
                    'info'
                );
            } else if (!weekendNow && lastWasWeekend) {
                API.ui.showNotification(`Weekend boost ended (Day ${dayNumber}).`, 'info');
            }
        }

        lastWasWeekend = weekendNow;
    });

    console.log('[Rush Hour Remix] Loaded');
};

init();
