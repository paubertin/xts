import { Logger } from "src/core/utils/log";

class RegionMap extends Map<string, number> {}

export class Profiler {
    public beginRegion(region: string): void {
        this.regions.set(region, performance.now());
    }

    public endRegion(region: string): void {
        let begin = this.regions.get(region);
        if (begin === undefined) return;

        const elapsed = performance.now() - begin;
        Logger.debug(`End '${region}, dt = ${elapsed * 0.001}'s`);
    }

    private regions: RegionMap = new RegionMap();
}