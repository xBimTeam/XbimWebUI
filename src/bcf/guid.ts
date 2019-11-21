export class Guid {
    public static new(): string {
        // implementation taken from https://gist.github.com/jed/982883 (MIT license)
        let template = "10000000-1000-4000-8000-100000000000";
        let replacer = (s: string): string => {
            let a = parseInt(s, 10);
            // tslint:disable-next-line: no-bitwise
            return (a ^ Math.random() * 16 >> a / 4).toString(16);
        };
        return template.replace(/[018]/g, replacer);
    }
}