export class LRUCache<T extends { id: string }> {
    private readonly _capacity: number;

    private _mostRecentlyUsed: Node<T> | null;
    private _leastRecentlyUsed: Node<T> | null;
    private _index = new Map<string, Node<T>>();

    constructor(capacity: number) {
        if (capacity < 1) { throw new Error("Invalid capacity given for cache"); }

        this._capacity = capacity;
        this._mostRecentlyUsed = null;
        this._leastRecentlyUsed = null;
    }

    has(id: string): boolean {
        return this._index.has(id);
    }

    get(id: string): T | undefined {
        const node = this._index.get(id);
        if (!node) return undefined;

        this.makeMostRecent(node);
        return node.value;
    }

    add(item: T): void {
        const node = new Node(item);

        if (this._index.size === 0) {
            this._leastRecentlyUsed = node;
            this._mostRecentlyUsed = node;
            this._index.set(node.value.id, node);
            return;
        }
        
        if (!this._leastRecentlyUsed) throw new Error("Invalid cache state");
        
        if (this._capacity === 1) {
            this._index.delete(this._leastRecentlyUsed.value.id);
            this._leastRecentlyUsed = node;
            this._mostRecentlyUsed = node;
            this._index.set(node.value.id, node);
            return;
        }

        const existing = this._index.get(node.value.id);
        if (existing) {
            existing.value = item;
            this.makeMostRecent(existing);
            return;
        }

        if (this._index.size === this._capacity) {
            const id = this._leastRecentlyUsed.value.id;
            this._leastRecentlyUsed = this._leastRecentlyUsed.next;
            this._leastRecentlyUsed!.previous = null;
            this._index.delete(id);
        }

        this.makeMostRecent(node);
        this._index.set(node.value.id, node);
    }

    private makeMostRecent(node: Node<T>): void {
        if (this._capacity === 1 || node === this._mostRecentlyUsed) return;

        if (this._mostRecentlyUsed === null) {
            this._leastRecentlyUsed = node;
            this._mostRecentlyUsed = node;
            return;
        }

        if (node === this._leastRecentlyUsed) {
            this._leastRecentlyUsed = this._leastRecentlyUsed.next;
        }

        if (node.next) node.next.previous = node.previous;
        if (node.previous) node.previous.next = node.next;

        node.previous = this._mostRecentlyUsed;
        this._mostRecentlyUsed.next = node;
        this._mostRecentlyUsed = node;        
    }

}

class Node<T extends { id: string }> {
    previous: Node<T> | null;
    next: Node<T> | null;
    value: T;

    constructor(value: T, previous: Node<T> | null = null, next: Node<T> | null = null) {
        this.value = value;
        this.previous = previous;
        this.next = next;
    }
}