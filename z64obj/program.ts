import fs from 'fs';

interface IObjectMeta {
    objectDetails: {
      extractFromROM: boolean,
      vromStartAddress: string,
      vromEndAddress: string,
      fileName: string
    }
}

const loadJSON = (path: string) => JSON.parse(fs.readFileSync(path).toString()) as IObjectMeta;

function main(args: string[]) {
    let baseROM = fs.readFileSync(args[0]);
    let zobjJSON = loadJSON(args[1]);

    extract(baseROM, zobjJSON);
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