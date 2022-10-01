interface ImagePathMap { [key: string]: ImagePathMapEntry }
type ImagePathMapEntry = string | ImagePathMap

interface ImageMap { [key: string]: ImageMapEntry }
type ImageMapEntry = HTMLImageElement | ImageMap
const images: ImageMap = {}

function loadImage(images: ImageMap): ([name, imagePath]: [string, ImagePathMapEntry]) => Promise<void> {
    return async function([name, imagePath]: [string, ImagePathMapEntry]): Promise<void> {
        console.log("loading", name)
        if (typeof imagePath === 'string') {
            return new Promise((resolve, reject) => {
                const img = new Image();
                images[name] = img;
                img.src = imagePath as string;
                img.addEventListener('load', () => resolve());
                img.addEventListener('error', reject);
            });
        } else {
            const innerImageMap: ImageMap = {}
            images[name] = innerImageMap;
            await Promise.all(Object.entries(imagePath as ImagePathMap).map(loadImage(innerImageMap)));
        }
    }
}

async function load() {
    const imageManifest: ImagePathMap = await fetch('./imageManifest.json').then(m => m.json())
    await Promise.all(Object.entries(imageManifest).map(loadImage(images))/*.catch(console.error)*/);
}

function image(map: ImageMap, name: string): HTMLImageElement {
    const nameChunks = name.split('/')
    if (map[nameChunks[0]] instanceof Image) {
        return map[nameChunks[0]] as HTMLImageElement
    } else if (typeof map[nameChunks[0]] === 'object') {
        return image(map[nameChunks[0]] as ImageMap, nameChunks.slice(1).join('/'));
    } else {
        throw (nameChunks[0] + " is a " + typeof nameChunks[0])
    }
}

export default image.bind(null, images)
export { load }
