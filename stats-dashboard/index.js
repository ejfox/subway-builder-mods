/**
 * Stats Dashboard Mod
 * Beautiful Sankey diagram showing commuter flow through the transit system
 *
 * Uses the simple addToolbarPanel API - look how clean this is!
 */

(function () {
    'use strict';

    var api = window.SubwayBuilderAPI;
    if (!api) {
        console.error('[Stats Dashboard] API not available');
        return;
    }

    var React = api.utils.React;
    var charts = api.utils.charts;
    var Badge = api.utils.components.Badge;

    // Verify Sankey is available
    if (!charts || !charts.Sankey) {
        console.error('[Stats Dashboard] Sankey chart not available');
        api.ui.showNotification('Stats Dashboard: Charts not available', 'error');
        return;
    }

    var Sankey = charts.Sankey;
    var h = React.createElement;

    // Color palette
    var COLORS = {
        population: '#8b5cf6',
        transit: '#22c55e',
        driving: '#ef4444',
        walking: '#3b82f6',
        unknown: '#6b7280',
        routes: ['#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#a855f7', '#14b8a6', '#eab308'],
    };

    /**
     * Custom node component for the Sankey
     */
    function SankeyNode(props) {
        var payload = props.payload;
        var colors = {
            Commuters: COLORS.population,
            Transit: COLORS.transit,
            Driving: COLORS.driving,
            Walking: COLORS.walking,
            Unknown: COLORS.unknown,
            Arrived: '#10b981',
        };
        var fill = colors[payload.name] || COLORS.routes[props.index % COLORS.routes.length];

        return h('g', null, [
            h('rect', {
                key: 'rect',
                x: props.x, y: props.y,
                width: props.width, height: props.height,
                fill: fill, fillOpacity: 0.9, rx: 3, ry: 3,
            }),
            h('text', {
                key: 'label',
                x: props.x + props.width + 6,
                y: props.y + props.height / 2,
                textAnchor: 'start', dominantBaseline: 'middle',
                fontSize: 11, fill: '#e5e7eb',
                fontWeight: payload.name === 'Commuters' ? 'bold' : 'normal',
            }, payload.name),
            h('text', {
                key: 'value',
                x: props.x + props.width + 6,
                y: props.y + props.height / 2 + 12,
                textAnchor: 'start', dominantBaseline: 'middle',
                fontSize: 9, fill: '#9ca3af',
            }, payload.value ? payload.value.toLocaleString() : ''),
        ]);
    }

    /**
     * Main Sankey content
     */
    function CommuteSankey() {
        var stateHook = React.useState({ nodes: [], links: [] });
        var sankeyData = stateHook[0];
        var setSankeyData = stateHook[1];

        var statsHook = React.useState({ total: 0, transitShare: 0 });
        var stats = statsHook[0];
        var setStats = statsHook[1];

        React.useEffect(function () {
            function updateData() {
                var modes = api.gameState.getModeChoiceStats();
                var total = modes.walking + modes.driving + modes.transit + modes.unknown;

                if (total === 0) {
                    setSankeyData({ nodes: [], links: [] });
                    setStats({ total: 0, transitShare: 0 });
                    return;
                }

                var divisor = total - modes.unknown;
                var transitShare = divisor > 0 ? ((modes.transit / divisor) * 100).toFixed(1) : '0';

                var lineMetrics = api.gameState.getLineMetrics()
                    .filter(function (m) { return m.ridersPerHour > 0; })
                    .sort(function (a, b) { return b.ridersPerHour - a.ridersPerHour; })
                    .slice(0, 5);

                var nodes = [{ name: 'Commuters' }, { name: 'Transit' }, { name: 'Driving' }, { name: 'Walking' }];
                lineMetrics.forEach(function (m) { nodes.push({ name: 'Route ' + m.routeBullet }); });
                nodes.push({ name: 'Arrived' });

                var links = [];
                var arrivedIndex = nodes.length - 1;

                if (modes.transit > 0) links.push({ source: 0, target: 1, value: modes.transit });
                if (modes.driving > 0) links.push({ source: 0, target: 2, value: modes.driving });
                if (modes.walking > 0) links.push({ source: 0, target: 3, value: modes.walking });
                if (modes.driving > 0) links.push({ source: 2, target: arrivedIndex, value: modes.driving });
                if (modes.walking > 0) links.push({ source: 3, target: arrivedIndex, value: modes.walking });

                if (lineMetrics.length > 0) {
                    var totalRouteRiders = lineMetrics.reduce(function (sum, m) { return sum + m.ridersPerHour; }, 0);
                    lineMetrics.forEach(function (m, i) {
                        var routeNodeIndex = 4 + i;
                        var scaledRiders = Math.round((m.ridersPerHour / totalRouteRiders) * modes.transit);
                        if (scaledRiders > 0) {
                            links.push({ source: 1, target: routeNodeIndex, value: scaledRiders });
                            links.push({ source: routeNodeIndex, target: arrivedIndex, value: scaledRiders });
                        }
                    });
                } else if (modes.transit > 0) {
                    links.push({ source: 1, target: arrivedIndex, value: modes.transit });
                }

                setSankeyData({ nodes: nodes, links: links });
                setStats({ total: total, transitShare: transitShare });
            }

            updateData();
            var interval = setInterval(updateData, 3000);
            return function () { clearInterval(interval); };
        }, []);

        // Empty state
        if (sankeyData.nodes.length === 0) {
            return h('div', { className: 'flex flex-col items-center justify-center p-8 text-center' }, [
                h('div', { key: 'icon', className: 'text-4xl mb-4' }, '🚇'),
                h('div', { key: 'msg', className: 'text-sm text-muted-foreground' }, 'Waiting for commute data...'),
                h('div', { key: 'hint', className: 'text-xs text-muted-foreground mt-1' }, 'Build stations and let time pass'),
            ]);
        }

        return h('div', { className: 'space-y-3' }, [
            // Header stats
            h('div', { key: 'header', className: 'flex items-center justify-between' }, [
                h('div', { key: 'left', className: 'flex items-center gap-2' }, [
                    h('span', { key: 'pct', className: 'text-2xl font-bold' }, stats.transitShare + '%'),
                    h(Badge, { key: 'badge', variant: 'secondary', className: 'bg-green-500/20 text-green-400' }, 'Transit'),
                ]),
                h('div', { key: 'right', className: 'text-right' }, [
                    h('div', { key: 'total', className: 'text-lg font-semibold' }, stats.total.toLocaleString()),
                    h('div', { key: 'label', className: 'text-xs text-muted-foreground' }, 'commuters'),
                ]),
            ]),

            // Sankey diagram
            h('div', { key: 'chart', style: { height: '280px' } },
                h(Sankey, {
                    width: 350, height: 260,
                    data: sankeyData,
                    node: SankeyNode,
                    link: { stroke: '#374151' },
                    nodePadding: 20, nodeWidth: 8,
                    margin: { top: 10, right: 90, bottom: 10, left: 10 },
                })
            ),

            // Legend
            h('div', { key: 'legend', className: 'flex gap-4 justify-center text-xs' }, [
                h('div', { key: 'l1', className: 'flex items-center gap-1' }, [
                    h('div', { key: 'c', className: 'w-2 h-2 rounded-full', style: { background: COLORS.transit } }),
                    h('span', { key: 't' }, 'Transit'),
                ]),
                h('div', { key: 'l2', className: 'flex items-center gap-1' }, [
                    h('div', { key: 'c', className: 'w-2 h-2 rounded-full', style: { background: COLORS.driving } }),
                    h('span', { key: 't' }, 'Driving'),
                ]),
                h('div', { key: 'l3', className: 'flex items-center gap-1' }, [
                    h('div', { key: 'c', className: 'w-2 h-2 rounded-full', style: { background: COLORS.walking } }),
                    h('span', { key: 't' }, 'Walking'),
                ]),
            ]),
        ]);
    }

    // ========================================
    // Use the simple API if available, otherwise fallback
    // ========================================
    if (api.ui.addToolbarPanel) {
        api.ui.addToolbarPanel({
            id: 'stats-dashboard',
            icon: 'BarChart3',
            tooltip: 'Commuter Flow',
            title: 'Commuter Flow',
            width: 400,
            render: CommuteSankey,
        });
    } else {
        // Fallback for older API versions
        var icons = api.utils.icons;
        var BarChart3 = icons.BarChart3;
        var X = icons.X;
        var Card = api.utils.components.Card;
        var CardHeader = api.utils.components.CardHeader;
        var CardTitle = api.utils.components.CardTitle;
        var CardContent = api.utils.components.CardContent;

        function StatsButton() {
            var stateHook = React.useState(false);
            var isOpen = stateHook[0];
            var setIsOpen = stateHook[1];

            var handleBackdropClick = function (e) {
                if (e.target === e.currentTarget) setIsOpen(false);
            };

            return h(React.Fragment, null, [
                h('div', {
                    key: 'btn',
                    onClick: function () { setIsOpen(!isOpen); },
                    title: 'Commuter Flow',
                    className: 'w-10 h-10 p-2 cursor-pointer rounded-lg border flex items-center justify-center bg-background/80 backdrop-blur-sm hover:bg-secondary',
                }, h(BarChart3, { className: 'w-full h-full stroke-[1.5]' })),
                isOpen && h('div', {
                    key: 'backdrop',
                    className: 'fixed inset-0 z-50',
                    onClick: handleBackdropClick,
                }, h('div', {
                    className: 'absolute top-14 right-14',
                }, h(Card, { className: 'w-[400px] bg-background/95 backdrop-blur-sm border shadow-xl' }, [
                    h(CardHeader, { key: 'header', className: 'pb-2 flex flex-row items-center justify-between' }, [
                        h(CardTitle, { key: 'title', className: 'text-sm' }, 'Commuter Flow'),
                        h('button', {
                            key: 'close',
                            className: 'h-6 w-6 p-1 rounded hover:bg-secondary cursor-pointer',
                            onClick: function () { setIsOpen(false); },
                        }, h(X, { className: 'w-full h-full' })),
                    ]),
                    h(CardContent, { key: 'content' }, h(CommuteSankey)),
                ]))),
            ]);
        }

        api.ui.registerComponent('top-bar', {
            id: 'stats-dashboard',
            component: StatsButton,
        });
    }

    api.ui.showNotification('Stats Dashboard loaded!', 'success');
    console.log('[Stats Dashboard] Loaded, addToolbarPanel available:', !!api.ui.addToolbarPanel);
})();
