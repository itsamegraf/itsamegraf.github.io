import { Container, Assets, MeshRope, Point } from '@pixi';
import { Bezier } from '@bezier-js';

const Generator = Object.getPrototypeOf(function* () {});

Generator.prototype.entries = function * () {
    let i = 0;
    for (let value of this) {
        yield [i++, value];
    }
}

export async function createCart(track) {
    const cartPointsCount = 5;
    const offsetFromTrack = -60;

    const container = new Container();
    const ropePoints = Array(cartPointsCount).fill().map(_ => new Point(0,0));
    const texture = await Assets.load('assets/rc_cart.png');
    const pathPoints = Array.from(computeCartPathPoints(track, offsetFromTrack));
    attachToTrack();
    const sprite = new MeshRope({texture, points: ropePoints});
    container.addChild(sprite);

    function* computeCartPathPoints(track, offsetFromTrack) {
        // amount of points to sample along the cart
        const pointsDistance = texture.width / cartPointsCount;
        yield* track.path.iterPointsAtDistance(pointsDistance, offsetFromTrack);
    }

    function attachToTrack(pointIdx=0) {
        // skip pointIdx entries
        let currPoints = pathPoints.slice(pointIdx, pointIdx + ropePoints.length);

        // copy points from currPoints
        for(let [i, p] of Object.entries(ropePoints)) {
            p.copyFrom(currPoints[i]);
        }
    }
    return {
        container,
        sprite,
        points: ropePoints,
        attachToTrack
    };
};