export class SegmentAddress {
    public segment: number;
    public offset: number;

    constructor();
    constructor(s: number);
    constructor(seg: number, off: number);
    constructor(a1?: number, a2?: number) {
        if (a1 !== undefined && a2 === undefined) { // 0x060001B0
            let buf = Buffer.alloc(4);
            buf.writeUInt32BE(a1);
            this.segment = buf[0];
            this.offset = buf.readUInt32BE() & 0x00FFFFFF;
        }
        else if (a1 !== undefined && a2 !== undefined) { // 0x06, 0x1B0
            this.segment = a1;
            this.offset = a2;
        }
        else { // no args
            this.segment = 0;
            this.offset = 0;
        }
    }

    public toString() {
        return `${this.segment.toString().toUpperCase().padStart(2,"0")}${this.offset.toString().toUpperCase().padStart(6,"0")}`;
    }
}