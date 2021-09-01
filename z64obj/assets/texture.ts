export type Codecs = "RGBA16" | "RGBA32" | "IA16" | "IA8" | "IA4" | "I8" | "I4" | "CI8" | "CI4" | "ONEBPP";

export function pixelsToBytes(codec: Codecs, numPixels: number) {
    switch (codec) {
        case "RGBA16": return numPixels * 2;
        case "RGBA32": return numPixels * 4;
        case "IA16": return numPixels * 2;
        case "IA8": return numPixels;
        case "IA4": return numPixels / 2;
        case "I8": return numPixels;
        case "I4": return numPixels / 2;
        case "CI8": return numPixels;
        case "CI4": return numPixels / 2;
        case "ONEBPP": return numPixels / 8;
        default: return 0;
    }
}