export interface IRegionSelectionStrategy {
    byLowestLatency(): Promise<"us-east-1" | "us-west-1">;
}
export const IRegionSelectionStrategy = Symbol.for("IRegionSelectionStrategy");
