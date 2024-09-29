import {Assets, Sprite} from '@pixi';

export async function createPetitMe(screen) {
    const sprite = await createSprite();

    async function createSprite() {
        const petitMeTexture = await Assets.load('assets/petit_graf.png');
        let petitMeSprite = Sprite.from(petitMeTexture);
        petitMeSprite.scale = 0.7;
        petitMeSprite.anchor = 0.5;
        return petitMeSprite;
    }

    function positionOnGround(groundSprite) {
        return sprite.position.copyFrom(getInitialPosition(groundSprite));
    }

    function getInitialPosition(groundSprite) {
        return {
            x: screen.width / 2,
            y: groundSprite.position.y + (groundSprite.height * 0.3) - (sprite.height/2)
        };
    }

    function reparentTo(container) {
        sprite.removeFromParent();
        container.addChildAt(sprite, 0); // behind all other children
        
        // maintain petitMe location
        sprite.position.copyFrom(container.toLocal(sprite.position));
    }

    function jumpIntoPoint(timeline, point) {
        timeline
        // Jump to X linear
        .to(sprite, {
            pixi: { x: point.x, }, 
            duration: 0.5,
        }, '<') // animation in parallel

        // Jump to Y mimicing gravity
        .to(sprite, {
            motionPath: {
                path: [
                    {y: 2 * point.y}, // x: rc.cart.sprite.width * 0.3, 
                    {y: point.y } // x: rc.cart.sprite.width * 0.6, 
                ],
            },
            duration: 0.5,
            ease: 'slow(0.9,0.7,false)',
        }, '<')
    }

    return {
        sprite,
        positionOnGround,
        reparentTo,
        jumpIntoPoint,
    };
};