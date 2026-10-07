import QRCode from 'qrcode';

/**
 * Valid ISO/IEC 18004 Compliant QR Code Generator
 * Uses the official 'qrcode' engine to generate real, camera-scannable QR SVGs.
 */
export function generateQrSvg(
  text: string,
  size = 200,
  fgColor = '#1C2433',
  bgColor = '#FFFFFF'
): string {
  try {
    const rawText = text && text.trim() ? text.trim() : 'https://hairmart.in/reviews';

    // Generate real standard QR matrix with Medium (M) error correction (15% redundancy)
    const qr = QRCode.create(rawText, { errorCorrectionLevel: 'M' });
    const moduleCount = qr.modules.size;
    const margin = 2; // Standard quiet zone (2 modules)
    const totalCount = moduleCount + margin * 2;

    let path = '';
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.modules.get(r, c)) {
          path += `M${c + margin},${r + margin}h1v1h-1z `;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalCount} ${totalCount}" width="${size}" height="${size}" shape-rendering="crispEdges">
  <rect width="${totalCount}" height="${totalCount}" fill="${bgColor}" />
  <path d="${path}" fill="${fgColor}" />
</svg>`;
  } catch (err) {
    console.error('Failed to generate real QR code SVG:', err);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <rect width="100" height="100" fill="#FEE2E2" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#EF4444" font-size="10">QR Error</text>
</svg>`;
  }
}

/**
 * Generates high-res PNG data URL for sharing or downloading
 */
export async function generateQrDataUrl(
  text: string,
  size = 300,
  fgColor = '#1C2433',
  bgColor = '#FFFFFF'
): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 2,
    color: {
      dark: fgColor,
      light: bgColor,
    },
    errorCorrectionLevel: 'M',
  });
}
