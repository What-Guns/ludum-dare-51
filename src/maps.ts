import TiledMap from './Tiled.js';

interface MapPathMap { [key: string]: MapPathMapEntry }
type MapPathMapEntry = string | MapPathMap

interface MapMap { [key: string]: MapMapEntry }
type MapMapEntry = TiledMap
const maps: MapMap = {}

function loadMap(maps: MapMap): ([name, mapPath]: [string, MapPathMapEntry]) => Promise<void> {
    return async function([name, mapPath]: [string, MapPathMapEntry]): Promise<void> {
        console.log("loading", name)
        if (typeof mapPath === 'string') {
            return new Promise((resolve, reject) => {
                fetch(mapPath).then(rsp => rsp.json()).then(tiled => { maps[name] = tiled; resolve(); }).catch(reject);
            });
        } else {
            throw "No nested maps!";
        }
    }
}

async function load() {
    const mapManifest: MapPathMap = await fetch('./mapManifest.json').then(m => m.json())
    await Promise.all(Object.entries(mapManifest).map(loadMap(maps))/*.catch(console.error)*/);
}

function tiledMap(map: MapMap, name: string): TiledMap {
    return map[name];
}

export default tiledMap.bind(null, maps)
export { load }
