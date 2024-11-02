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
    const container = new Container();
    const cartPointsCount = 5;
    const points = Array(cartPointsCount).fill().map(_ => new Point(0,0));
    
    const texture = await Assets.load('assets/rc_cart.png');
    const sprite = new MeshRope({texture, points});

    // const cartPointsIter = getPointsIter();
    attachToTrack();
    container.addChild(sprite);

    function* _iterCartPoints() {
        // amount of points to sample along the cart
        const pointsDistance = texture.width / cartPointsCount;
        const offsetFromTrack = -70;

        // TODO: im assuming cartPointsIter yields more than cartPointsCount initial points
        // take ${cartPointsCount} initial points
        let cartPoints = [];
        for (let currPoint of track.path.iterPointsAtDistance(pointsDistance, offsetFromTrack)) {
            // Note: generator must not be overused for-of will close it at the end
            if (cartPoints.length < cartPointsCount) {
                // if-case for the first cartPointsCount iterations
                cartPoints.push(currPoint);
                continue;
            }

            // if-case for the rest of iterations
            cartPoints.shift();
            cartPoints.push(currPoint);
            yield cartPoints;
        }
        return;
    }

    function attachToTrack(pointIdx=0) {
        let i, currPoints;

        // skip pointIdx entries
        for ([i, currPoints] of _iterCartPoints().entries()) {
            if (i == pointIdx)
                break;
        }

        // copy points from currPoints
        for(let [i, p] of Object.entries(points)) {
            p.copyFrom(currPoints[i]);
        }
    }
    return {
        container,
        sprite,
        points,
        attachToTrack
    };
};