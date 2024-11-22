import {Assets, Sprite, Point} from '@pixi';
import { gsap } from '@gsap';

export async function createPetitMe(screen) {
    const sprite = await createSprite();

    async function createSprite() {
        const petitMeTexture = await Assets.load('assets/petit_graf.png');
        let petitMeSprite = Sprite.from(petitMeTexture);
        petitMeSprite.scale = 0.7;
        petitMeSprite.anchor = (0.5, 0.9);
        return petitMeSprite;
    }

    function positionOnGround(groundSprite) {
        return sprite.position.copyFrom(getInitialPosition(groundSprite));
    }

    function getInitialPosition(groundSprite) {
        return {
            x: screen.width / 2,
            y: groundSprite.position.y
        };
    }

    function reparentTo(container) {
        sprite.removeFromParent();
        container.addChildAt(sprite, 0); // behind all other children
        
        // maintain petitMe location
        sprite.position.copyFrom(container.toLocal(sprite.position));
    }

    function setOffset(offsetPoint) {
        offset.copyFrom(offsetPoint);
    }

    function jump(height) {
        let timeline = gsap.timeline();

        // Jump to X linear
        timeline
        .to(sprite, {
            pixi: {x: 0},
            duration: 0.5
        })
        // Jump to Y mimicing gravity
        .to(sprite, {
            motionPath: {
                path: [
                    {y: -height}, // x: rc.cart.sprite.width * 0.3, 
                    {y: 0 } // x: rc.cart.sprite.width * 0.6, 
                ],
            },
            duration: 0.5,
            ease: 'slow(0.9,0.7,false)',
        }, '<')
        return timeline;
    }

    return {
        sprite,
        positionOnGround,
        reparentTo,
        setOffset,
        jump,
    };
};