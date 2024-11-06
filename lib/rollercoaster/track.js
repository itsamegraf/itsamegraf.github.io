import { Assets, MeshRope } from '@pixi';
import * as PIXI from '@pixi';

export async function createTrack(ground, plan) {
    const container = new PIXI.Container();
    const initialPosition = {x: 0, y: ground.position.y - 10};

    const rcTrackTexture = await Assets.load('assets/rollercoaster_track.png');
    const trackPoints = Array.from(plan.path.iterPointsAtDistance(rcTrackTexture.width));

    const trackRope = new MeshRope({
        texture: rcTrackTexture,
        points: trackPoints,
        textureScale: 1,
    });
    container.position.copyFrom(initialPosition);
    container.addChild(trackRope);

    return {
        container,
        points: trackPoints,

        getBuiltTrackWidth(screen) {
            const screenCount = plan.blueprint.length-1;
            const lastScreenRow = plan.blueprint[screenCount]; // row
            const lastScreenCol = lastScreenRow[lastScreenRow.length-1] // column
            const totalWidth = (screenCount - 1 + lastScreenCol[0]) * screen.width;
            return totalWidth;
        },

    };
}