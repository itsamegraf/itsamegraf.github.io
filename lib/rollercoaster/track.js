import { Assets, MeshRope } from '@pixi';
import * as PIXI from '@pixi';

import { createPath } from '../utils/path.js';

export async function createTrack(ground, screen) {
    const container = new PIXI.Container();
    const trackPlan = [
        [[0, 0], [1, 0]],
        [[0.1, 0], [0.4, 0], [0.8, -0.5], [0.6, -0.8], [0.4, -0.5], [0.9, 0]],
        [[0.1, -0.5], [0.5 , -1], [1, -1.5]],
    ]
    const initialPosition = {x: 0, y: ground.position.y - 10};

    const controlPoints = Array.from(parseTrackPlan(trackPlan));
    const path = createPath(controlPoints);

    const rcTrackTexture = await Assets.load('assets/rollercoaster_track.png');
    const trackPoints = Array.from(path.iterPointsAtDistance(rcTrackTexture.width));

    const trackRope = new MeshRope({
        texture: rcTrackTexture,
        points: trackPoints,
        textureScale: 1,
    });
    container.position.copyFrom(initialPosition);
    container.addChild(trackRope);

    function* parseTrackPlan(trackPlan) {
        // trackPlan: Array[Array[2]]
        //  where Array[2] are [X, Y] relative to screen.width and screen.height
        for (let [i, screenPlan] of trackPlan.entries()) {
            for (let [xRel, yRel] of screenPlan) {
                yield [(i + xRel) * screen.width, (yRel) * screen.height];
            }
        }
    }

    return {
        container,
        path,
        points: trackPoints,
    };
}