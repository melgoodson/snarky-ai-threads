/**
 * The designs DB table stores image_url values like /src/assets/foo.png
 * which don't work in production because Vite hashes asset filenames.
 * This function maps those paths to the /images/designs/ public directory.
 * Design images have been converted from transparent PNG to JPEG (white bg).
 */
export const resolveDesignImage = (url: string): string => {
    if (url.startsWith('/src/assets/')) {
        const filename = url.replace('/src/assets/', '').replace(/\.png$/i, '.jpg');
        return '/images/designs/' + filename;
    }
    // Also handle direct /images/designs/ references that still say .png
    if (url.startsWith('/images/designs/') && url.endsWith('.png')) {
        return url.replace(/\.png$/i, '.jpg');
    }
    return url;
};
