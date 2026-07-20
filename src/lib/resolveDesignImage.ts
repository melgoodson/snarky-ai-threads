/**
 * The designs DB table stores image_url values like /src/assets/foo.png
 * which don't work in production because Vite hashes asset filenames.
 * This function maps those paths to the /images/designs/ public directory.
 * Old design images (numbered: 1.png–11.png) were converted to JPEG.
 * New designs (July 2026+) are stored as actual PNGs with descriptive names.
 */
export const resolveDesignImage = (url: string): string => {
    if (url.startsWith('/src/assets/')) {
        const filename = url.replace('/src/assets/', '').replace(/\.png$/i, '.jpg');
        return '/images/designs/' + filename;
    }
    // Legacy numbered designs (1.png through 11.png) are stored as .jpg on disk
    if (url.startsWith('/images/designs/') && url.endsWith('.png')) {
        const basename = url.replace('/images/designs/', '');
        if (/^\d+\.png$/i.test(basename)) {
            return url.replace(/\.png$/i, '.jpg');
        }
    }
    return url;
};
