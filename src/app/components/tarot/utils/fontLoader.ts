/**
 * Font loading utilities for PIXI.js custom fonts
 */

/**
 * Checks if a font is loaded and available for use
 */
function isFontLoaded(fontFamily: string): boolean {
  // Create a temporary canvas to test font availability
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return false;

  // Measure text width with a fallback font
  context.font = '12px monospace';
  const fallbackWidth = context.measureText('abcdefghijklmnopqrstuvwxyz').width;

  // Measure text width with the target font
  context.font = `12px "${fontFamily}", monospace`;
  const testWidth = context.measureText('abcdefghijklmnopqrstuvwxyz').width;

  // If widths are different, the custom font is loaded
  return fallbackWidth !== testWidth;
}

/**
 * Waits for a font to be loaded
 */
export function waitForFont(fontFamily: string, timeout: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    function checkFont() {
      if (isFontLoaded(fontFamily)) {
        resolve(true);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        console.warn(`Font "${fontFamily}" failed to load within ${timeout}ms`);
        resolve(false);
        return;
      }
      
      requestAnimationFrame(checkFont);
    }
    
    checkFont();
  });
}

/**
 * Waits for multiple fonts to be loaded
 */
export function waitForFonts(fontFamilies: string[], timeout: number = 5000): Promise<boolean[]> {
  return Promise.all(fontFamilies.map(font => waitForFont(font, timeout)));
}

/**
 * Gets the appropriate font family for PIXI text with fallbacks
 */
export function getPixiFontFamily(customFont: string = 'Bloverly'): string {
  return `"${customFont}", "Poppins", ui-sans-serif, system-ui, -apple-system, sans-serif`;
}
