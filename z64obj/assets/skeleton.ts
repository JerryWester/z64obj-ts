import { SegmentAddress } from "./segment";

export class Limb {
    public address: SegmentAddress;
    public x: number;
    public y: number;
    public z: number;
    public child: number;
    public next: number;
    public displayList: SegmentAddress;
    public displayListFar?: SegmentAddress;

    constructor();
    constructor(address: SegmentAddress, _x: number, _y: number, _z: number, _c: number, _n: number, dl: SegmentAddress, dlFar?: SegmentAddress);
    constructor(address?: SegmentAddress, _x?: number, _y?: number, _z?: number, _c?: number, _n?: number, dl?: SegmentAddress, dlFar?: SegmentAddress) {
        if (address !== undefined && _x !== undefined && _y !== undefined && _z !== undefined && _c !== undefined && _n !== undefined && dl !== undefined) {
            this.address = address;
            this.x = _x;
            this.y = _y;
            this.z = _z;
            this.child = _c;
            this.next = _n;
            this.displayList = dl;
            this.displayListFar = dlFar;
        }
        else {
            this.address = new SegmentAddress();
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.child = 0;
            this.next = 0;
            this.displayList = new SegmentAddress();
        }
    }
}

export class SkeletonHeader {
    public limbListAddress: SegmentAddress;
    public limbCount: number;
    public gfxLimbCount?: number;

    constructor();
    constructor(address: SegmentAddress, total: number, gfx?: number);
    constructor(address?: SegmentAddress, total?: number, gfx?: number) {
        if (address !== undefined && total !== undefined) {
            this.limbListAddress = address;
            this.limbCount = total;
            this.gfxLimbCount = gfx;
        }
        else {
            this.limbListAddress = new SegmentAddress();
            this.limbCount = 0;
        }
    }
}


export class Skeleton
{
    public isFlex: boolean;
    public isLOD: boolean;
    public address: SegmentAddress;
    public limbs: Limb[];
    public header: SkeletonHeader;

    constructor();
    constructor(src: Buffer, address: SegmentAddress, flex: boolean);
    constructor(src?: Buffer, address?: SegmentAddress, flex?: boolean) {
        if (src !== undefined && address !== undefined && flex !== undefined) {
            this.address = address;
            this.isFlex = flex;
            this.header = new SkeletonHeader(new SegmentAddress(src.readUInt32BE(this.address.offset)), src[this.address.offset + 4], flex ? src[this.address.offset + 8] : undefined)
            this.isLOD = (() => {
                let testLimb1 = new SegmentAddress(src.readUInt32BE(this.header.limbListAddress.offset));
                let testLimb2 = new SegmentAddress(src.readUInt32BE(this.header.limbListAddress.offset + 4));
                return testLimb2.offset - testLimb1.offset > 12;
            })();

            this.limbs = [];
            for (let i = 0; i < this.header.limbCount; i++) {
                let limbAddress = new SegmentAddress(src.readUInt32BE(this.header.limbListAddress.offset + (i * 4)));

                this.limbs[i] = new Limb(
                    limbAddress,
                    src.readUInt16BE(limbAddress.offset),
                    src.readUInt16BE(limbAddress.offset + 2),
                    src.readUInt16BE(limbAddress.offset + 4),
                    src.readInt8(limbAddress.offset + 6),
                    src.readInt8(limbAddress.offset + 7),
                    new SegmentAddress(src.readUInt32BE(limbAddress.offset + 8)),
                    this.isLOD ? new SegmentAddress(src.readUInt32BE(limbAddress.offset + 12)) : undefined
                );
            }
        }
        else {
            this.isFlex = false;
            this.isLOD = false;
            this.address = new SegmentAddress();
            this.limbs = [];
            this.header = new SkeletonHeader();
        }
    }
}