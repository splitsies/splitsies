export interface IAdConfiguration {
    readonly appId: string;
    readonly interstitialId: string;
}

export const IAdConfiguration = Symbol.for("IAdConfiguration");
