import { Observable } from "rxjs";

export interface IInviteViewModel {
    readonly mode: "contacts" | "guests";
    readonly mode$: Observable<"contacts" | "guests">;
    setMode(value: "contacts" | "guests"): void;

    readonly inviteMenuOpen: boolean;
    readonly inviteMenuOpen$: Observable<boolean>;
    setInviteMenuOpen(value: boolean): void;

    readonly searchFilter: string
    readonly searchFilter$: Observable<string>;
    setSearchFilter(value: string): void;
}

export const IInviteViewModel = Symbol.for("IInviteViewModel");