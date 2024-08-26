export interface IRequestConfiguration {
    readonly connectionTimeoutMs: number;
    readonly connectionCheckIntervalMs: number;
}
export const IRequestConfiguration = Symbol.for("IRequestConfiguration");
