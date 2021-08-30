import { segmentAddress } from "./segmentAddress";

export class DisplayList {
    public address: segmentAddress;
    public raw: Buffer;
    public disassembled: string[];

    constructor();
    constructor(src: Buffer, addr: number)
    constructor(src?: Buffer, addr?: number) {
        if (src && addr) {
            this.address = new segmentAddress(addr);
            let dlSize = 0;
            for (let i = this.address.offset; i < src.length; i += 8) {
                dlSize += 8;
                if (src.readUInt32BE(i) === 0xDF000000) {
                    break;
                }
            }
            this.raw = Buffer.alloc(dlSize);
            src.copy(this.raw, 0, this.address.offset, this.address.offset + dlSize);
            this.disassembled = []; // @TODO: finish this
        }
        else {
            this.address = new segmentAddress();
            this.raw = Buffer.alloc(0);
            this.disassembled = [];
        }
    }
}