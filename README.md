# Subway Builder Mods

A collection of mods for [Subway Builder](https://subwaybuilder.io), a subway/metro simulation game.

## Installation

1. Open Subway Builder
2. Go to **Settings > System**
3. Click **"Open Saves Folder"**
4. Navigate up one level to the `metro-maker4/` folder
5. Create a `mods/` folder if it doesn't exist
6. Copy the mod folder (e.g., `day-night-cycle/`) into the `mods/` folder
7. Restart the game and enable the mod in **Settings > Mods**

**Mods folder locations by platform:**
- **macOS**: `~/Library/Application Support/metro-maker4/mods/`
- **Windows**: `%APPDATA%\metro-maker4\mods\`
- **Linux**: `~/.config/metro-maker4/mods/`

## Available Mods

### Day/Night Theme Cycle

Automatically switches between light and dark theme based on in-game time of day.

- **Day (6:00 AM - 5:59 PM)**: Light theme
- **Night (6:00 PM - 5:59 AM)**: Dark theme

Shows a notification when the theme changes at sunrise/sunset.

**Files:** [`day-night-cycle/`](./day-night-cycle/)

### Bushwick Express

Custom NYC career mission that uses **geographic metrics** to track actual passenger flows from Bushwick to Lower Manhattan.

- **Star 1**: Build 3 stations in Bushwick/Williamsburg area
- **Star 2**: Transport 1,000 passengers from Bushwick to Lower Manhattan
- **Star 3**: Transport 5,000 passengers from Bushwick to Lower Manhattan

Uses bounding box origin-destination tracking to count actual commuters.

**Files:** [`bushwick-express/`](./bushwick-express/)

### Rush Hour Remix

Customize AM/PM commute windows and simulate weekend demand boosts.

- Adds settings sliders for AM/PM commute windows
- Applies custom timing via `popTiming.setCommuteTimeRanges`
- Weekend bonus based on total demand and ticket price
- Optional weekend boost notifications

**Files:** [`rush-hour-remix/`](./rush-hour-remix/)

### Stats Dashboard

Real-time transit statistics dashboard with charts.

- Mode share breakdown (subway vs walking)
- Ridership tracking over time
- Route performance metrics

**Files:** [`stats-dashboard/`](./stats-dashboard/)

## Creating Your Own Mods

See the [Subway Builder Modding Guide](https://gist.github.com/ejfox/fcc7dcc4b97d7f6a43800cf384dc694b) for full documentation on the modding API.

## License

MIT
