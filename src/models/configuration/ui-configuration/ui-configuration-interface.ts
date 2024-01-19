export interface IUiConfiguration {
    readonly sizes: {
        smallIcon: number;
        icon: number;
        largeIcon: number;
    };
}
export const IUiConfiguration = Symbol.for("IUiConfiguration");
