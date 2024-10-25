import { Container, Assets, Sprite, MeshRope, Point } from '@pixi';
import { Bezier } from '@bezier-js';
import * as PIXI from '@pixi';

import {createTrack} from './track.js'

export async function createRollerCoaster(ground, screen) {
    const container = createContainer();
    const track = await createTrack(ground, screen);
    
    const cartTexture = await Assets.load('assets/rc_cart.png');
    const cartPoints = Array(3).fill().map(_ => new Point(0,0));
    attachCartToTrack();
    const cart = await createCart(cartPoints);
    container.addChild(track.container, cart.container);

    function addDebugLines() {
        const trackLine = renderPoints(track.points);
        track.container.addChild(trackLine);

        const cartLine = renderPoints(cartPoints);
        cart.container.addChild(cartLine);
    }

    function createContainer() {
        const container = new Container();
        container.position.x = ground.width; // just after screen x
        container.position.y = 0;
        return container;
    }
    async function createCart(points) {
        const rcCartContainer = new Container();
        const rcCartSprite = new MeshRope({
            texture: cartTexture,
            points: points,
        });
        // const rcCartSprite = Sprite.from(rcCartTexture);
        // rcCartSprite.scale = 0.7;
        // rcCartSprite.anchor.y = 1;
        // rcCartSprite.pivot.y = -33;
        rcCartContainer.addChild(rcCartSprite);

        rcCartContainer.position.x = screen.width; // just after screen x
        rcCartContainer.position.y = track.container.position.y;
        return {
            container: rcCartContainer,
            sprite: rcCartSprite,
        };
    }
    function attachCartToTrack(pointIdx=0) {

        // create bezierJS instance
        let currSlice = track.points.slice(pointIdx, pointIdx+3).map(p => ({x: p.x, y: p.y}));
        let bezier = Bezier.quadraticFromPoints(...currSlice).offset(-75);
        if (bezier.length != 1)
            console.log(`oops ${bezier.length}`);
        bezier = bezier[0];

        // for (let [i, p] of Object.entries(track.points.slice(pointIdx, pointIdx+cartPoints.length))) {
        for(let [i, p] of Object.entries(bezier.points)) {
            let cartP = cartPoints[i];
            cartP.copyFrom(p);
            
            // TODO: cartP.copyFrom(p.offset(5))
            //  where 5 is offset of base wheels from track
            //  where .offset is bezierJS offset

            // all of these dont work:
            // cartP.x = p.x + (i/cartPoints.length) * cartTexture.width;
            // cartP.y -= cartTexture.height / 2; // mimics .anchor.y = 1;
            // cartP.y += cartTexture.height * 0.56;
            // cartP.y += track.container.children[0].texture.height * 0.3;
        }
    }

    function renderPoints(points)
    {
        const g = new PIXI.Graphics();
        g.clear();
        g.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++)
        {
            g.lineTo(points[i].x, points[i].y);
            g.stroke({ width: 10, color: 0xffc2c2 });
        }

        for (let i = 1; i < points.length; i++)
        {
            g.circle(points[i].x, points[i].y, 10);
            g.fill({ color: 0xff0022 });
            g.stroke({ width: 1, color: 0xffc2c2 });
        }
        return g;
    }

    return {
        container,
        cart,
        attachCartToTrack,
        addDebugLines
    }
}