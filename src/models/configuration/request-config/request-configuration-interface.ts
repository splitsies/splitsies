export interface IRequestConfiguration {
    readonly connectionTimeoutMs: number;
}
export const IRequestConfiguration = Symbol.for("IRequestConfiguration");
