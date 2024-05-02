import { IVersion } from "./version-interface";

export class Version implements IVersion {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;

    constructor(versionString: string) {
        try {
            const parts = versionString.split(".");
            this.major = parseInt(parts[0]);
            this.minor = parseInt(parts[1]);
            this.patch = parseInt(parts[2]);
        } catch {
            console.warn("Invalid version string given. Constructing with zeros....");
            this.major = Number.MAX_SAFE_INTEGER;
            this.minor = Number.MAX_SAFE_INTEGER;
            this.patch = Number.MAX_SAFE_INTEGER;
        }
    }

    get isDefault(): boolean {
        return (
            this.major === Number.MAX_SAFE_INTEGER &&
            this.minor === Number.MAX_SAFE_INTEGER &&
            this.patch === Number.MAX_SAFE_INTEGER
        );
    }

    isGreater(other: IVersion): boolean {
        if (this.major > other.major) return true;
        if (this.major < other.major) return false;

        if (this.minor > other.minor) return true;
        if (this.minor < other.minor) return false;

        if (this.patch > other.patch) return true;
        return false;
    }
}
