export interface IThemeManager {
    initialize(): void;
}

export const IThemeManager = Symbol.for("IThemeManager");
