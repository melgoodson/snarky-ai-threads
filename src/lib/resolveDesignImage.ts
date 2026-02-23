/**
 * The designs DB table stores image_url values like /src/assets/foo.png
 * which don't work in production because Vite hashes asset filenames.
 * This function maps those paths to the /images/designs/ public directory.
 */
export const resolveDesignImage = (url: string): string => {
    if (url.startsWith('/src/assets/')) {
        const filename = url.replace('/src/assets/', '');
        return '/images/designs/' + filename;
    }
    return url;
};
