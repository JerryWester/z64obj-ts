import { DisplayList } from "./displayList";
import { Skeleton } from "./skeleton";
import { VertexBlock, VERTEX_SIZE } from "./vertex";

export class ZObject {
    public displayLists: DisplayList[];
    public vertexBlocks: VertexBlock[];
    public skeletons: Skeleton[];

    constructor() {
        this.displayLists = [];
        this.vertexBlocks = [];
        this.skeletons = [];
    }

    public extractVertices(src: Buffer/* , zobj: ZObject */) {
        for (const dl of this.displayLists) {
            for (const disassembly of dl.disassembled) {

                if (disassembly.opcode == "gsSPVertex") {
                    this.vertexBlocks.push(new VertexBlock(
                        src,
                        Number.parseInt(disassembly.parameters[0], 16),
                        Number.parseInt(disassembly.parameters[1]) * VERTEX_SIZE
                    ));
                }
            }
        }
    }
}