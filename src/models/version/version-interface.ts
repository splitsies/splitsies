export interface IVersion {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly isDefault: boolean;
    isGreater(other: IVersion): boolean;
}