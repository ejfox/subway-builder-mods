# Bushwick Express

Custom NYC career mission that uses **geographic metrics** to track actual passenger flows from Bushwick to Lower Manhattan.

## What This Mod Does

Adds a 3-star mission to NYC's starter tier:

1. **Star 1**: Build 3 stations in Bushwick/Williamsburg area
2. **Star 2**: Transport 1,000 passengers from Bushwick to Lower Manhattan
3. **Star 3**: Transport 5,000 passengers from Bushwick to Lower Manhattan

Uses bounding box origin-destination tracking - counts actual commuters whose home is in Bushwick and workplace is in Lower Manhattan.

## Playtest Checklist

1. **Load NYC game** - Bushwick Express mod should register automatically
2. **Check Career menu** - Mission should appear in NYC starter tier
3. **Build stations in Bushwick** - Star 1 tracks `stations_in_region` metric
4. **Wait for commutes** - Star 2/3 track `passengers_between_regions` from Bushwick to Manhattan
5. **Console output** - Watch for these logs:
   - `[Bushwick Express] Mission registered successfully!`
   - `[Bushwick Express] Bushwick bbox: [-73.935, 40.688, -73.905, 40.71]`
   - `[Bushwick Express] Lower Manhattan bbox: [-74.02, 40.698, -73.97, 40.725]`

## Geographic Regions Used

```
Bushwick:        [-73.9350, 40.6880, -73.9050, 40.7100]
Lower Manhattan: [-74.0200, 40.6980, -73.9700, 40.7250]
Williamsburg:    [-73.9700, 40.7000, -73.9350, 40.7250]
```

## API Features Demonstrated

- `api.career.REGIONS.NYC` - Pre-defined neighborhood bounding boxes
- `api.career.METRICS.STATIONS_IN_REGION` - Count stations in a bbox
- `api.career.METRICS.PASSENGERS_BETWEEN_REGIONS` - Track origin-destination flows
- `params.bbox` / `params.originBbox` / `params.destBbox` - Geographic parameters

## Debugging

If the mission doesn't appear:
1. Check browser console for registration errors
2. Verify mod is enabled in Settings > Mods
3. Ensure you're playing NYC (mission is city-specific)

If passenger counts aren't updating:
1. Passengers must complete full commutes (home -> work or work -> home)
2. Both origin AND destination must be within the specified bounding boxes
3. Check that your transit line actually connects Bushwick to Lower Manhattan
