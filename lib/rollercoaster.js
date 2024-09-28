import { Container, Assets, Sprite, TilingSprite } from '../bin/pixi.mjs';

export async function createRollerCoaster(ground, screen) {
    const container = createContainer();
    const trackSprite = await createTrack();
    const cart = await createCart();

    container.addChild(trackSprite, cart.container);

    function createContainer() {
        const container = new Container();
        container.position.x = ground.width; // just after screen x
        container.position.y = 0;
        return container;
    }
    async function createCart() {
        const rcCartContainer = new Container();
        
        const rcCartTexture = await Assets.load('assets/rc_cart.png');
        const rcCartSprite = Sprite.from(rcCartTexture);
        rcCartSprite.scale = 0.7;
        rcCartSprite.anchor.y = 1;
        rcCartSprite.pivot.y = -33;
        rcCartContainer.addChild(rcCartSprite);

        rcCartContainer.position.x = 0; // just after screen x
        rcCartContainer.position.y = trackSprite.position.y;
        return {
            container: rcCartContainer,
            sprite: rcCartSprite,
        };
    }
    async function createTrack() {
        const rcTrackTexture = await Assets.load('assets/rollercoaster_track.png');
        const rcTrackSprite = new TilingSprite({
            texture: rcTrackTexture, width: ground.width
        });
        rcTrackSprite.position.x = 0; // just after screen x
        rcTrackSprite.position.y = ground.position.y - 10 - rcTrackSprite.height;
        return rcTrackSprite;
    }

    return {
        container,
        cart
    }
}