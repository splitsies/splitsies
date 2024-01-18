import { injectable } from "inversify";
import { IInviteViewModel } from "./invite-view-model-interface";
import { BehaviorSubject, Observable } from "rxjs";

@injectable()
export class InviteViewModel implements IInviteViewModel {
    private readonly _mode = new BehaviorSubject<"contacts" | "guests">("contacts");
    private readonly _inviteMenuOpen = new BehaviorSubject<boolean>(false);
    private readonly _searchFilter = new BehaviorSubject<string>("");

    get mode$(): Observable<"contacts" | "guests"> {
        return this._mode.asObservable();
    }
    get mode(): "contacts" | "guests" {
        return this._mode.value;
    }
    setMode(value: "contacts" | "guests"): void {
        if (this.mode === value) return;
        this._mode.next(value);
    }

    get inviteMenuOpen$(): Observable<boolean> {
        return this._inviteMenuOpen.asObservable();
    }
    get inviteMenuOpen(): boolean {
        return this._inviteMenuOpen.value;
    }
    setInviteMenuOpen(value: boolean): void {
        if (this.inviteMenuOpen === value) return;
        this._inviteMenuOpen.next(value);
    }

    get searchFilter$(): Observable<string> {
        return this._searchFilter.asObservable();
    }
    get searchFilter(): string {
        return this._searchFilter.value;
    }
    setSearchFilter(value: string): void {
        if (this.searchFilter === value) return;
        this._searchFilter.next(value);
    }
}
