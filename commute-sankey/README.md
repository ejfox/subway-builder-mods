# Commute Sankey

Beautiful Sankey diagram showing commuter flow through your transit system.

## What This Mod Does

Adds a toolbar panel that visualizes how commuters travel through your city:

- **Commuters** flow into different transport modes (Transit, Driving, Walking)
- **Transit riders** are broken down by your top 5 routes
- **All modes** flow to "Arrived" at their destination

## Features

- Real-time updates every 3 seconds
- Shows transit mode share percentage
- Total commuter count
- Color-coded by transport mode:
  - Green: Transit
  - Red: Driving
  - Blue: Walking
  - Various colors for individual routes

## Usage

Click the branch icon in the toolbar to open the Sankey diagram panel.

## API Features Used

- `api.gameState.getModeChoiceStats()` - Get walking/driving/transit/unknown counts
- `api.gameState.getLineMetrics()` - Get per-route ridership data
- `api.utils.charts.Sankey` - Recharts Sankey component
- `api.ui.addToolbarPanel()` - Register toolbar panel
