# Rush Hour Remix

Customize AM/PM commute windows and simulate weekend demand boosts.

## Installation

1. Open the game and go to Settings > Mod Manager
2. Click Open Mods Folder
3. Copy this entire `rush-hour-remix` folder into the mods folder
4. Refresh Mod Manager and enable "Rush Hour Remix"
5. Restart the game

## What it does

- Adds settings sliders for AM/PM commute windows
- Applies those windows via `popTiming.setCommuteTimeRanges`
- On weekend days, adds a bonus based on total demand pops and ticket price
- Optional weekend boost notifications (start/end of weekend)

## Notes

- Weekend is detected using day % 7 (days 6 and 7).
- Bonus is simulated revenue; the API does not allow direct demand edits.
- Storage persists settings in the desktop app only.
