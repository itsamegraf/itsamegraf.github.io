import { Assets, TilingSprite } from '../bin/pixi.mjs';
import Matter from '../bin/matter.0.20.0.mjs.js';

export async function createGround(screen) {
    const groundTexture = await Assets.load('assets/ground_notforprod.png');
    const tilingSprite = new TilingSprite({
        texture: groundTexture, width: screen.width
    });
    tilingSprite.position.y = screen.height - tilingSprite.height;

    const groundBody = Matter.Bodies.rectangle(
        tilingSprite.position.x, tilingSprite.position.y, 
        tilingSprite.height, tilingSprite.width,
        { isStatic: true });

    return {
        sprite: tilingSprite,
        body: groundBody,
    };
}