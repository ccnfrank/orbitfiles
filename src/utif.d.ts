// Minimal typings for the parts of utif.js used by the thumbnail renderer.
declare module "utif" {
  export interface TiffIfd {
    width: number;
    height: number;
    data?: Uint8Array;
    [key: string]: unknown;
  }

  interface UtifStatic {
    decode(buffer: ArrayBuffer): TiffIfd[];
    decodeImage(buffer: ArrayBuffer, ifd: TiffIfd): void;
    toRGBA8(ifd: TiffIfd): Uint8Array;
  }

  const UTIF: UtifStatic;
  export default UTIF;
}
