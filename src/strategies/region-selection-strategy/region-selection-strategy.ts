import { injectable } from "inversify";
import { IRegionSelectionStrategy } from "./region-selection-strategy.i";

const regions = [
    {
        region: "us-west-1",
        url: "https://dynamodb.us-west-1.amazonaws.com",
    },
    {
        region: "us-east-1",
        url: "https://dynamodb.us-east-1.amazonaws.com",
    },
];

@injectable()
export class RegionSelectionStrategy implements IRegionSelectionStrategy {
    async byLowestLatency(): Promise<"us-east-1" | "us-west-1"> {
        const latencies: { region: "us-east-1" | "us-west-1"; latency: number }[] = [];
        const pings = [];

        for (const region of regions) {
            pings.push(
                new Promise<void>(async (res) => {
                    try {
                        const start = Date.now();
                        await fetch(region.url);
                        const end = Date.now();

                        latencies.push({ region: region.region, latency: end - start });
                        console.log({ region: region.region, latency: end - start });
                    } catch {
                        latencies.push({ region: region.region, latency: Number.MAX_SAFE_INTEGER });
                    }

                    res();
                }),
            );
        }

        await Promise.all(pings);

        latencies.sort((a, b) => a.latency - b.latency);
        if (latencies[0].latency === Number.MAX_SAFE_INTEGER) return "us-east-1"; // Everything is down
        return latencies[0].region;
    }
}
