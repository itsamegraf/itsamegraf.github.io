import { Container, Assets, Sprite, MeshRope, Point } from '@pixi';
import * as PIXI from '@pixi';

import {createPlan} from './plan.js'
import {createTrack} from './track.js'
import {createCart} from './cart.js'

export async function createRollerCoaster(ground, screen) {
    const container = createContainer();
    const plan = await createPlan(screen);
    const track = await createTrack(ground, plan);
    const cart = await createCart(plan);
    cart.container.position.copyFrom({
        x: screen.width, // just after screen x
        y: track.container.position.y});

    container.addChild(track.container, cart.container);

    function createAnimations(worldContainer) {
        return cart.iterAnimationsAlongTrack(0, {
                width: screen.width, 
                height: screen.height,
                onCutOff: (timeline, cutOffPoint) => {
                    const screenSwapDuration = 2; //seconds
                    timeline.to(worldContainer, {
                        pixi: {
                            pivotX: cutOffPoint.x,
                            pivotY: cutOffPoint.y
                        },
                        duration: screenSwapDuration,
                        ease: 'none',
                    }, `<-${screenSwapDuration}`);
                }
            });
    }

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
        track,
        renderPoints,
        addDebugLines,
        createAnimations
    }
}