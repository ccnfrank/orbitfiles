/**
 * Reads the JPEG thumbnail that Photoshop stores inside a .psd file (image resource 1036,
 * or 1033 in older files). Browsers cannot decode PSD, but this thumbnail is a normal JPEG.
 * Returns null when the file has no such thumbnail.
 */

const SIGNATURE_8BPS = 0x38425053; // "8BPS"
const SIGNATURE_8BIM = 0x3842494d; // "8BIM"
const RESOURCE_THUMB_NEW = 1036;
const RESOURCE_THUMB_OLD = 1033;
const THUMB_HEADER_BYTES = 28;
const JPEG_FORMAT = 1;

export function extractPsdThumbnail(buf: ArrayBuffer): Blob | null {
  try {
    const view = new DataView(buf);
    if (buf.byteLength < 30 || view.getUint32(0) !== SIGNATURE_8BPS) return null;
    if (view.getUint16(4) !== 1) return null; // PSB (version 2) uses wider length fields; not handled

    // Header is 26 bytes, then the colour mode data section, then image resources.
    let off = 26;
    off += 4 + view.getUint32(off);
    const resourcesLength = view.getUint32(off);
    off += 4;
    const end = Math.min(buf.byteLength, off + resourcesLength);

    while (off + 12 <= end) {
      if (view.getUint32(off) !== SIGNATURE_8BIM) break;
      const id = view.getUint16(off + 4);

      // Pascal name: length byte + characters, padded so the total is even.
      let p = off + 6;
      const nameLength = view.getUint8(p);
      p += 1 + nameLength;
      if ((1 + nameLength) % 2 === 1) p += 1;

      const size = view.getUint32(p);
      p += 4;

      if ((id === RESOURCE_THUMB_NEW || id === RESOURCE_THUMB_OLD) && size > THUMB_HEADER_BYTES) {
        if (view.getUint32(p) === JPEG_FORMAT) {
          return new Blob([buf.slice(p + THUMB_HEADER_BYTES, p + size)], { type: "image/jpeg" });
        }
      }

      off = p + size + (size % 2); // data is padded to an even length
    }
    return null;
  } catch {
    return null; // truncated or malformed file
  }
}
