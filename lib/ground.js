import { Assets, TilingSprite } from '../bin/pixi.mjs';

export async function createGround(screen) {
    const groundTexture = await Assets.load('assets/ground_notforprod.png');
    const tilingSprite = new TilingSprite({
        texture: groundTexture, width: screen.width
    });
    tilingSprite.position.y = screen.height - tilingSprite.height;

    return {
        sprite: tilingSprite,
    };
}