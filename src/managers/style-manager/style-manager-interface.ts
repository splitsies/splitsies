export interface IStyleManager {
    initialize(): void;

    readonly typography: {
        heading: object;
        subheading: object;
        body: object;
        bodyBold: object;
        subtext: object;
        letter: object;
        letterHeading: object;
        hint: object;
    };
}

export const IStyleManager = Symbol.for("IStyleManager");
