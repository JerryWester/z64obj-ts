import { SegmentAddress } from "./segment";

export const VERTEX_SIZE = 16;

export class VertexBlock {
    public address: SegmentAddress;
    public raw: Buffer;

    constructor();
    constructor(src: Buffer, address: number, size: number);
    constructor(src?: Buffer, address?: number, size?: number) {
        if (src !== undefined && address !== undefined && size !== undefined) {
            this.address = new SegmentAddress(address);
            this.raw = Buffer.alloc(size);
            src.copy(this.raw, 0, this.address.offset, this.address.offset + size);
        }
        else {
            this.address = new SegmentAddress();
            this.raw = Buffer.alloc(0);
        }
    }
}