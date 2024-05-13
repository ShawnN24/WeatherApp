export function metersToKilometers(visibilityInMeters: number): string {
    const visibilityInKilometers = visibilityInMeters / 1000;
    return `${visibilityInKilometers.toFixed(0)}km`; //round to 0 decimal places
}