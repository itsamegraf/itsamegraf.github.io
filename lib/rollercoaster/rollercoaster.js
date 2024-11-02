import { Container, Assets, Sprite, MeshRope, Point } from '@pixi';
import * as PIXI from '@pixi';

import {createTrack} from './track.js'
import {createCart} from './cart.js'

export async function createRollerCoaster(ground, screen) {
    const container = createContainer();
    const track = await createTrack(ground, screen);
    const cart = await createCart(track);
    cart.container.position.copyFrom({
        x: screen.width, // just after screen x
        y: track.container.position.y});

    container.addChild(track.container, cart.container);

    function addDebugLines() {
        const trackLine = renderPoints(track.points);
        track.container.addChild(trackLine);

        const cartLine = renderPoints(cart.points);
        cart.container.addChild(cartLine);
    }

    function createContainer() {
        const container = new Container();
        container.position.x = ground.width; // just after screen x
        container.position.y = 0;
        return container;
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

        for (let i = 0; i < points.length; i++)
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
        renderPoints,
        addDebugLines
    }
}