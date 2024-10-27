import { Assets, MeshRope } from '@pixi';
import * as PIXI from '@pixi';

import { createPath } from './path.js';

export async function createTrack(ground, screen) {
    const container = new PIXI.Container();
    
    const w = screen.width, h = screen.height;
    const controlPoints = [
        [0,0], [0.4 * w,0], [0.8 * w, -0.5 * h], [0.5 * w, -0.8 * h],  [0.4 * w, -0.5 * h], [0.6 * w,0], 
        [0.9 * w, 0], [1.1 * w, -100], [w * 1.5 , -500], [w * 2, -1000]];
    const path = createPath(controlPoints);
    const trackRope = await createTrackRope(path.points);

    const initialPosition = {x: 0, y: ground.position.y - 10};
    container.position.copyFrom(initialPosition);
     
    container.addChild(trackRope);

    async function createTrackRope(points) {
        const rcTrackTexture = await Assets.load('assets/rollercoaster_track.png');
        const rcTrackMeshRope = new MeshRope({
            texture: rcTrackTexture,
            points: points,
            textureScale: 1,
        });
        return rcTrackMeshRope;
    }

    return {
        container,
        path,
        points: path.points,
    };
}