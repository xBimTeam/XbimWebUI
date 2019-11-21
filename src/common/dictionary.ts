export class Dictionary<TKey, TValue> {
    private _internal: { [key: string]: TValue } = {};
    private _getKey: (key: TKey) => string;
    private _count: number = 0;


    constructor(keyMaker?: (key: TKey) => string) {
        if (keyMaker) {
            this._getKey = keyMaker
        } else {
            this._getKey = k => k.toString();
        }
    }

    public Set(key: TKey, value: TValue): void {
        var index = this._getKey(key);
        var exist = this._internal[index];
        if (!exist) {
            this._count++;
        }
        this._internal[index] = value;
    }

    public Add(key: TKey, value: TValue): void {
        var index = this._getKey(key);
        var exist = this._internal[index];
        if (exist) {
            throw new Error("This key exists already: " + index);
        }

        this._internal[index] = value;
        this._count++;
    }

    public TryGet(key: TKey, refResult: TValue[]): boolean {
        var index = this._getKey(key);
        var exist = this._internal[index];
        if (exist) {
            refResult[0] = exist;
            return true;
        }
        refResult[0] = null;
        return false;
    }

    public Remove(key: TKey): boolean {
        var index = this._getKey(key);
        var exist = this._internal[index];
        if (exist) {
            delete this._internal[index];
            this._count--;
            return true;
        }
        return false;
    }

    public get Count(): number {
        return this._count;
    }

    public Where(condition: (value: TValue) => boolean): TValue[] {
        let result = new Array<TValue>();
        Object.keys(this._internal).forEach(key => {
            let value = this._internal[key];
            if (condition(value)) {
                result.push(value);
            }
        });
        return result;
    }

    public ForEach(action: (value: TValue) => void): void {
        Object.keys(this._internal).forEach(key => {
            let value = this._internal[key];
            action(value);
        });
    }
}
