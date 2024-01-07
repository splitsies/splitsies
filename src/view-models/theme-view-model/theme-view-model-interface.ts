import { Observable } from "rxjs";

export interface IThemeViewModel {
    readonly theme: "dark" | "light";
    readonly theme$: Observable<"dark" | "light">;
    setTheme(value: "dark" | "light"): void;
}
export const IThemeViewModel = Symbol.for("IThemeViewModel");
