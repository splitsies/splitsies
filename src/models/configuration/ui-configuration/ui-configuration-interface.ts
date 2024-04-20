export interface IUiConfiguration {
    readonly sizes: {
        smallIcon: number;
        icon: number;
        largeIcon: number;
        carouselPadding: number;
    };

    readonly durations: {
        focusThrottleMs: number;
        searchDebounceMs: number;
        adBufferMs: number;
    };
}
export const IUiConfiguration = Symbol.for("IUiConfiguration");
