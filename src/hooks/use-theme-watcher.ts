import { lazyInject } from "../utils/lazy-inject";
import { IThemeViewModel } from "../view-models/theme-view-model/theme-view-model-interface";
import { useObservable } from "./use-observable";

const _themeViewModel = lazyInject<IThemeViewModel>(IThemeViewModel);

export const useThemeWatcher = () => {
    const theme = useObservable(_themeViewModel.theme$, _themeViewModel.theme);
    return theme;
};
