import fs from 'fs';
import { DisplayList } from './assets/displayList';
import { SegmentAddress } from './assets/segment';
import { Skeleton } from './assets/skeleton';
import { ZObject } from './assets/ZObject';

interface IObjectMeta {
    objectDetails: {
      extractFromROM: boolean,
      vromStartAddress: string,
      vromEndAddress: string,
      fileName: string
    },
    displayLists?: {
        segmentOffset: string,
        infoDescriptor: string,
        symbolName: string
    }[],
    textureImages?: {
        segmentOffset: string,
        infoDescriptor: string,
        fmtCodec: string,
        imgDimensions: [
            number,
            number
        ],
        imgPalette: string,
        symbolName: string
    }[],
    texturePalettes?: {
        segmentOffset: string,
        infoDescriptor: string,
        blockSize: string
    }[],
    skeletonTrees?: {
        segmentOffset: string,
        infoDescriptor: string,
        isFlexSkeleton: boolean
    }[],
    externalSegments?: {
        segmentOffset: string,
        infoDescriptor: string,
        symbolName: string
    }[],
    miscellaneousData?: {
        segmentOffset: string,
        infoDescriptor: string,
        blockSize: string
    }[]
}

const loadJSON = (path: string) => JSON.parse(fs.readFileSync(path).toString()) as IObjectMeta;

function main(args: string[]) {
    let baseROM = fs.readFileSync(args[0]);
    let zobjJSON = loadJSON(args[1]);

    extract(baseROM, zobjJSON);

    let zobjBytes = fs.readFileSync(zobjJSON.objectDetails.fileName);
    let zobjProcessed = new ZObject();

    // Collect Display Lists
    if (zobjJSON.displayLists) {
        console.log("Display lists section found in JSON. Collecting display lists...");
        for (const dlist of zobjJSON.displayLists) {
            let dl = new DisplayList(zobjJSON.objectDetails.fileName, zobjBytes, Number.parseInt(dlist.segmentOffset, 16));
            dl.comment = dlist.infoDescriptor;
            dl.symbol = dlist.symbolName;

            zobjProcessed.displayLists.push(dl);
        }
        console.log(`Collected Display Lists! (${zobjProcessed.displayLists.length})`);
    }

    // Extract Assets
    // -- Vertex Data
    zobjProcessed.extractVertices(zobjBytes);
    console.log("Vertex Blocks Extracted!");
    // -- Skeletons
    if (zobjJSON.skeletonTrees) {
        console.log("Skeletons section found in JSON. Collecting skeletons...")
        for (const skeleton of zobjJSON.skeletonTrees) {
            zobjProcessed.skeletons.push(
                new Skeleton(zobjBytes, new SegmentAddress(Number.parseInt(skeleton.segmentOffset, 16)), skeleton.isFlexSkeleton)
            );
        }
        console.log(`Collected Skeletons! (${zobjProcessed.skeletons.length})`);
    }

    zobjProcessed.displayLists[0].symbolize();


}

function extract(src: Buffer, json: IObjectMeta) {
    let toBeExtracted = json.objectDetails.extractFromROM;
    if (toBeExtracted) {
        console.log(`Extracting ${json.objectDetails.fileName}...`);
        let vROMStart = Number.parseInt(json.objectDetails.vromStartAddress, 16)
        let vROMEnd = Number.parseInt(json.objectDetails.vromEndAddress, 16);
        let size = vROMEnd - vROMStart;

        let extractedFile = Buffer.alloc(size);
        src.copy(extractedFile, 0, vROMStart, vROMEnd);

        if (extractedFile.length > 0) {
            fs.writeFileSync(json.objectDetails.fileName, extractedFile);
            console.log("Extracted file!");
        }
    }
    else {
        console.log("Token \"extractFromROM\" is false--nothing to be extracted.");
    }
}

process.argv.shift(); // node
process.argv.shift(); // script path
main(process.argv);