export class ChecksumUtils {
  static async computeSHA256(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return this.bufferToHex(hashBuffer);
  }

  static async computeSHA256FromText(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToHex(hashBuffer);
  }

  static bufferToHex(buffer: ArrayBuffer): string {
    const view = new Uint8Array(buffer);
    return Array.from(view)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static truncateChecksum(checksum: string, length: number = 16): string {
    return checksum.substring(0, length) + '...';
  }

  static compareChecksums(
    checksum1: string,
    checksum2: string
  ): { match: boolean; similarity: number } {
    const match = checksum1 === checksum2;
    let similarity = 0;

    if (match) {
      similarity = 100;
    } else {
      const matchingChars = Array.from(checksum1).filter(
        (char, index) => char === checksum2[index]
      ).length;
      similarity = Math.round((matchingChars / checksum1.length) * 100);
    }

    return { match, similarity };
  }
}
