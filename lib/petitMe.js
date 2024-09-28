import {Assets, Sprite} from '../bin/pixi.mjs';

export async function createPetitMe(screen) {
    const sprite = await createSprite();

    async function createSprite() {
        const petitMeTexture = await Assets.load('assets/petit_graf.png');
        let petitMeSprite = Sprite.from(petitMeTexture);
        petitMeSprite.scale = 0.7;
        petitMeSprite.anchor.x = 0.5;
        return petitMeSprite;
    }

    function positionOnGround(groundSprite) {
        sprite.position.x = screen.width / 2;
        sprite.position.y = groundSprite.position.y - sprite.height + 20;
    }

    function moveToRc(rc) {
        sprite.removeFromParent();
        rc.cart.container.addChildAt(sprite, 0); // behind all other children
        
        // maintain petitMe location (rc just out of screen)
        sprite.position.copyFrom(rc.cart.container.toLocal(sprite.position));
    }

    return {
        sprite,
        positionOnGround,
        moveToRc,
    };
}