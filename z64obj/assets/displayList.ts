import { SegmentAddress } from "./segment";
import { spawnSync } from "child_process";
import { resolve } from "path";

export class DisplayList {
    public symbol = "";
    public comment = "";
    public address: SegmentAddress;
    public raw: Buffer;
    public disassembled: string[];

    constructor();
    constructor(srcFile: string, src: Buffer, addr: number)
    constructor(srcFile?: string, src?: Buffer, addr?: number) {
        if (srcFile && src && addr) {
            this.address = new SegmentAddress(addr);
            let dlSize = 0;
            for (let i = this.address.offset; i < src.length; i += 8) {
                dlSize += 8;
                if (src.readUInt32BE(i) === 0xDF000000) {
                    break;
                }
            }
            this.raw = Buffer.alloc(dlSize);
            src.copy(this.raw, 0, this.address.offset, this.address.offset + dlSize);
            this.disassembled = DisplayList.disassemble(srcFile, this.address); // @TODO: finish this
        }
        else {
            this.address = new SegmentAddress();
            this.raw = Buffer.alloc(0);
            this.disassembled = [];
        }
    }

    
    public static disassemble(fileName: string, segAddr: SegmentAddress) {
        let proc = spawnSync(`gfxdis_z64obj.f3dex2 -f ${resolve(fileName)} -a 0x${segAddr.offset.toString().toUpperCase().padStart(6, "0")}`,
            { encoding: "utf-8", shell: false });

        return proc.stdout.split("!");
    }
}