import { injectable } from "inversify";
import { IThemeViewModel } from "./theme-view-model-interface";
import { BehaviorSubject, Observable } from "rxjs";

@injectable()
export class ThemeViewModel implements IThemeViewModel {
    private readonly _theme = new BehaviorSubject<"dark" | "light">("light");

    get theme$(): Observable<"dark" | "light"> {
        return this._theme.asObservable();
    }

    get theme(): "dark" | "light" {
        return this._theme.value;
    }

    setTheme(value: "dark" | "light"): void {
        if (this.theme === value) return;
        this._theme.next(value);
    }
}
