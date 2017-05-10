export declare class Dictionary<TKey, TValue> {
    private _internal;
    private _getKey;
    private _count;
    constructor(keyMaker?: (key: TKey) => string);
    Set(key: TKey, value: TValue): void;
    Add(key: TKey, value: TValue): void;
    TryGet(key: TKey, refResult: TValue[]): boolean;
    Remove(key: TKey): boolean;
    readonly Count: number;
    Where(condition: (value: TValue) => boolean): TValue[];
    ForEach(action: (value: TValue) => void): void;
}
