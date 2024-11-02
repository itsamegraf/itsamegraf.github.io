import { Assets, TilingSprite } from '@pixi';

export async function createGround(width, screen) {
    const groundTexture = await Assets.load('assets/ground_notforprod.png');
    const tilingSprite = new TilingSprite({
        texture: groundTexture, width: width
    });
    tilingSprite.position.y = screen.height - tilingSprite.height;

    return {
        sprite: tilingSprite,
    };
}