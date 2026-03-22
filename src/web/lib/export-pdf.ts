'use client';

import type { Session } from '../../types/session';

/**
 * Export session as PDF with tactical boards and sequences
 * TODO: Implement PDF export with a browser-compatible library
 * For now, users can export as PNG or FSP format
 */
export async function exportSessionPDF(
  session: Session,
  svgElements: SVGSVGElement[]
): Promise<void> {
  alert(
    'PDF Export is coming soon!\n\n' +
    'For now, you can:\n' +
    '• Export as PNG image\n' +
    '• Export as FSP file (JSON format)\n' +
    '• Share via link'
  );

  // TODO: Implement actual PDF generation
  // Possible approaches:
  // 1. Use pdfmake (browser-friendly)
  // 2. Use jsPDF with proper webpack config
  // 3. Server-side PDF generation via API
  console.log('PDF export requested for session:', session.id);
  console.log('SVG elements to export:', svgElements.length);
}
