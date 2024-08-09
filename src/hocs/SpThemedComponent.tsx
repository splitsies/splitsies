import React from "react";
import { useObservable } from "../hooks/use-observable";
import { lazyInject } from "../utils/lazy-inject";
import { IThemeViewModel } from "../view-models/theme-view-model/theme-view-model-interface";

const _themeViewModel = lazyInject<IThemeViewModel>(IThemeViewModel);

/**
 * A higher order component that provides a watcher to re-render when the system color scheme changes
 * @param BaseComponent
 * @returns
 */
export function SpThemedComponent(BaseComponent: (props: any) => JSX.Element | React.ReactNode | null): (props: any) => JSX.Element {
    return (props: any): JSX.Element => {
        useObservable(_themeViewModel.theme$, _themeViewModel.theme);

        return <BaseComponent {...props}>{props.children}</BaseComponent>;
    };
}
