/**
 * Generate favicon.ico from 16px and 32px PNGs.
 * ICO format: header + entries + PNG data concatenated.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webDir = join(__dirname, "..");

const png16 = readFileSync(join(webDir, "src/app/favicon-16.png"));
const png32 = readFileSync(join(webDir, "src/app/favicon-32.png"));

const images = [
  { width: 16, height: 16, data: png16 },
  { width: 32, height: 32, data: png32 },
];

// ICO header: 6 bytes
// Each entry: 16 bytes
// Then PNG data
const headerSize = 6;
const entrySize = 16;
const totalEntries = images.length;
const dataOffset = headerSize + entrySize * totalEntries;

const buf = Buffer.alloc(dataOffset + images.reduce((s, i) => s + i.data.length, 0));

// ICO header
buf.writeUInt16LE(0, 0);      // reserved
buf.writeUInt16LE(1, 2);      // type: 1 = ICO
buf.writeUInt16LE(totalEntries, 4); // count

let offset = dataOffset;
images.forEach((img, i) => {
  const entryOffset = headerSize + i * entrySize;
  buf.writeUInt8(img.width === 256 ? 0 : img.width, entryOffset);      // width
  buf.writeUInt8(img.height === 256 ? 0 : img.height, entryOffset + 1); // height
  buf.writeUInt8(0, entryOffset + 2);        // color palette
  buf.writeUInt8(0, entryOffset + 3);        // reserved
  buf.writeUInt16LE(1, entryOffset + 4);     // color planes
  buf.writeUInt16LE(32, entryOffset + 6);    // bits per pixel
  buf.writeUInt32LE(img.data.length, entryOffset + 8);  // size of PNG data
  buf.writeUInt32LE(offset, entryOffset + 12);           // offset to PNG data

  img.data.copy(buf, offset);
  offset += img.data.length;
});

const outPath = join(webDir, "src/app/favicon.ico");
writeFileSync(outPath, buf);
console.log(`Generated favicon.ico (${buf.length} bytes)`);
