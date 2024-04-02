export interface ILRUCache<T extends { id: string }> {
    has(id: string): boolean;
    get(id: string): T | undefined;
    add(item: T): void;
}
export const ILRUCache = Symbol.for("ILRUCache");
