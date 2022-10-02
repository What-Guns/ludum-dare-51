type TiledMap = {
    layers: Array<TiledLayer>,
    properties: Array<TiledProperty>,
}

type TiledLayer = TiledTileLayer | TiledObjectLayer;

type TiledTileLayer = {
    name: string,
    height: number,
    width: number,
    data: Array<number>,
    type: "tilelayer",
}

type TiledObjectLayer = {
    name: string,
    objects: Array<TiledObject>,
    type: "objectgroup",
}

type TiledObject = {
    x: number,
    y: number,
    width: number,
    height: number,
    properties: Array<TiledProperty>,
}

type TiledProperty = TiledStringProperty | TiledNumberProperty;

type TiledStringProperty = {
    name: string,
    type: "string",
    value: string,
}

type TiledNumberProperty = {
    name: string,
    type: "int",
    value: number,
}

export default TiledMap
