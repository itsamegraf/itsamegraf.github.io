import { Assets, TilingSprite } from '@pixi';

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