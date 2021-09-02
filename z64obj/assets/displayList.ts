import { SegmentAddress } from "./segment";
import { spawnSync } from "child_process";
import { resolve } from "path";
import { IObjectMeta } from "../program";

export type MacroNames = "gsSPMatrix" | "gsSPVertex";

export interface IDisplayListMeta {
    segmentOffset: string,
    infoDescriptor: string,
    symbolName: string
}

export class GfxInstruction {
    public opcode: string;
    public parameters: string[];

    constructor();
    constructor(_gfx: string);
    constructor(_gfx?: string) {
        if (_gfx !== undefined) {
            let match = _gfx.match(/(\S*)\((.*)\)/);

            if (match && match.length > 2) { // asserts that there was a match
                this.opcode = match[1] as MacroNames;
                this.parameters = match[2].split(',').map(val => val.trim());
            }
            else {
                this.opcode = "";
                this.parameters = [];
            }
        }
        else {
            this.opcode = "";
            this.parameters = [];
        }
    }

    public toString() {
        return `${this.opcode}(${this.parameters.join(", ")})`;
    }
}

export class DisplayList {
    public symbol = "";
    public comment = "";
    public address: SegmentAddress;
    public raw: Buffer;
    public disassembled: GfxInstruction[];

    constructor();
    constructor(srcFile: string, src: Buffer, json: IDisplayListMeta);
    constructor(srcFile?: string, src?: Buffer, meta?: IDisplayListMeta) {
        if (srcFile !== undefined && src !== undefined && meta !== undefined) {
            this.address = new SegmentAddress(Number.parseInt(meta.segmentOffset, 16));
            let dlSize = 0;
            while (src[this.address.offset + dlSize] !== 0xDF) {
                dlSize += 8;
            }
            this.raw = Buffer.alloc(dlSize);
            src.copy(this.raw, 0, this.address.offset, this.address.offset + dlSize);
            this.disassembled = DisplayList.disassemble(srcFile, this.address);
            this.symbol = meta.symbolName;
            this.comment = meta.infoDescriptor;
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
        return proc.stdout.substr(0, proc.stdout.length - 2).split("!").map(dl => new GfxInstruction(dl));
    }

    public symbolize() {
        for (let i = 0; i < this.disassembled.length; i++) {
            switch (this.disassembled[i].opcode as MacroNames) {
                case "gsSPMatrix": {
                    let dataAddress = new SegmentAddress(Number.parseInt(this.disassembled[i].parameters[0], 16));
                    if (dataAddress.segment == 0x0D)
                    {
                        this.disassembled[i].parameters[0] = `LIMB_MATRIX(LIMB_${(dataAddress.offset / 0x40).toString().padStart(2,"0")})`;
                    }
                } break;

                case "gsSPVertex": {
                    let dataAddress = new SegmentAddress(Number.parseInt(this.disassembled[i].parameters[0], 16));
                    this.disassembled[i].parameters[0] = `&vtx_${dataAddress.offset.toString(16).toUpperCase().padStart(6,"0")}`;
                    this.disassembled[i].parameters[1] = `Vtx_sizeof(${this.disassembled[i].parameters[0]})`;
                } break;
            }
        }
    }
}