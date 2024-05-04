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
        notificationTimeoutMs: number;
        notificationDismissDurationMs: number;
    };

    readonly card: {
        borderRadius: number;
        borderWidth: number;
    };
}
export const IUiConfiguration = Symbol.for("IUiConfiguration");
