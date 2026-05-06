import { toPng, toBlob } from 'html-to-image';

/**
 * Robust utility for exporting DOM elements to images.
 * Fixes common issues with iOS Safari (requires canvas priming) 
 * and utilizes native Share API for better mobile UX.
 */
export async function exportAsImage(element: HTMLElement, filename: string) {
  try {
    // 1. Prime the canvas (fixes iOS Safari blank image bug)
    await toPng(element, { cacheBust: true, pixelRatio: 2, skipFonts: true });
    
    // 2. Wait a brief moment to ensure fonts/images are ready
    await new Promise(resolve => setTimeout(resolve, 150));

    // 3. Generate Blob for better mobile sharing capabilities
    const blob = await toBlob(element, { cacheBust: true, pixelRatio: 2 });
    
    if (!blob) throw new Error("Failed to generate image blob");

    // 4. Try native Web Share API first (Ideal for Mobile browsers)
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'HashPilot Terminal Report',
            text: 'Check out my HashPilot report! ⬡'
          });
          return; // Successfully shared
        } catch (shareErr) {
          // If the user cancelled the share, we can just return or fallback.
          // We'll fall back to download just in case it wasn't a user cancellation.
          console.log("Share action failed or was cancelled", shareErr);
        }
      }
    }

    // 5. Fallback to standard download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error("HashPilot Export Failed:", error);
    alert("Export failed. Complex terminal filters may not be supported on this browser.");
  }
}
