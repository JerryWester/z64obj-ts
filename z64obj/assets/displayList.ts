import { SegmentAddress } from "./segment";
import { spawnSync } from "child_process";
import { resolve } from "path";

export type MacroNames = "gsSPMatrix" | "gsSPVertex";

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
            while (src[this.address.offset + dlSize] !== 0xDF) {
                dlSize += 8;
            }
            this.raw = Buffer.alloc(dlSize);
            src.copy(this.raw, 0, this.address.offset, this.address.offset + dlSize);
            this.disassembled = DisplayList.disassemble(srcFile, this.address);
        }
        else {
            this.address = new SegmentAddress();
            this.raw = Buffer.alloc(0);
            this.disassembled = [];
        }
    }
    
    public static disassemble(fileName: string, segAddr: SegmentAddress) {
        let proc = spawnSync('gfxdis_z64obj.f3dex2',
            ['-f', resolve(fileName), '-a', `0x${segAddr.offset.toString(16).toUpperCase().padStart(6, "0")}`],
            { encoding: "utf-8", shell: false });
        if (proc.stderr) throw proc.stderr;
        return proc.stdout.substr(0, proc.stdout.length - 2).split("!");
    }

    public static symbolize(dl: DisplayList) {
        for (let i = 0; i < dl.disassembled.length; i++) {
            let match = dl.disassembled[i].match(/(\S*)\((.*)\)/);

            if (match && match.length > 2) { // asserts that there was a match
                let macroName = match[1] as MacroNames;
                let macroParams = match[2].split(',').map(val => val.trim());

                switch (macroName) {
                    case "gsSPMatrix": {
                        let dataAddress = new SegmentAddress(Number.parseInt(macroParams[0], 16));
                        if (dataAddress.segment == 0x0D)
                        {
                            macroParams[0] = `LIMB_MATRIX(LIMB_${(dataAddress.offset / 0x40).toString().padStart(2,"0")})`;
                        }
                    } break;

                    case "gsSPVertex": {
                        let dataAddress = new SegmentAddress(Number.parseInt(macroParams[0], 16));
                        macroParams[0] = `&vtx_${dataAddress.offset.toString(16).toUpperCase().padStart(6,"0")}`;
                        macroParams[1] = `Vtx_sizeof(${macroParams[0]})`;
                    } break;
                }

                dl.disassembled[i] = `${macroName}(${macroParams.join(', ')})`;
                console.log(dl.disassembled[i]);
            }
        }
    }
}