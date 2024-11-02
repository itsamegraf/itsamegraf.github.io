import { Container, Assets, MeshRope, Point } from '@pixi';
import { gsap } from '@gsap';

const Generator = Object.getPrototypeOf(function* () {});

Generator.prototype.entries = function * () {
    let i = 0;
    for (let value of this) {
        yield [i++, value];
    }
}

export async function createCart(track) {
    const cartPointsCount = 6;
    const offsetFromTrack = -60;

    const container = new Container();
    const childrenContainer = new Container();
    const ropePoints = Array(cartPointsCount).fill().map(_ => new Point(0,0));
    const texture = await Assets.load('assets/rc_cart.png');
    const sampleDistance = texture.width / cartPointsCount;
    const [pathPoints, pathNormals] = createPathPointsAndNormals();
    attachToTrack();
    const sprite = new MeshRope({texture, points: ropePoints});
    container.addChild(childrenContainer, sprite);

    childrenContainer.position.copyFrom(childrenPosAtIdx(0));

    function childrenPosAtIdx(idx) {
        const relCharPos = 4/6;
        const idxCharPos = idx + Math.floor(relCharPos*ropePoints.length);
        const characterPoint = pathPoints[idxCharPos];
        return characterPoint;
    }

    function createPathPointsAndNormals() {
        let pathPoints = [], pathNormals = [];
        for (let [point, normal] of track.path.iterPointsAndNormalAtDistance(sampleDistance, offsetFromTrack)) {
            pathPoints.push(point);
            pathNormals.push(normal);
        }
        return [pathPoints, pathNormals];
    }

    function attachToTrack(pointIdx=0) {
        // skip pointIdx entries
        let currPoints = pathPoints.slice(pointIdx, pointIdx + ropePoints.length);

        // copy points from currPoints
        for(let [i, p] of Object.entries(ropePoints)) {
            p.copyFrom(currPoints[i]);
        }
        
        // // match childrenContainer position to the new initial point
        // childrenContainer.position.copyFrom(currPoints[0]);
    }

    function animateAlongTrack(pointIdx=0) {
        let timeline = gsap.timeline();
        for (let [i, _] of pathPoints.slice(pointIdx, pathPoints.length - ropePoints.length)
                                            .entries()) {

            let nextPoints = pathPoints.slice(i, i + ropePoints.length);

            // construct current step timeline
            let currentStepTimeline = gsap.timeline();
            for(let [j, p] of Object.entries(ropePoints)) {
                currentStepTimeline.to(p, {
                    x: nextPoints[j].x, 
                    y: nextPoints[j].y,
                    duration: 0.1,
                    ease: 'none'
                }, '<');
            }

            // add childrenContainer adjustment accordingly
            const relCharPos = 4/6;
            const idxCharPos = i + Math.floor(relCharPos*ropePoints.length);
            const characterPoint = pathPoints[idxCharPos];
            const normal = pathNormals[idxCharPos];
            const normalPoint = {x: characterPoint.x + normal.x, y: characterPoint.y + normal.y};
            // https://stackoverflow.com/questions/50546456
            let rotation = Math.atan2(characterPoint.y - normalPoint.y, normalPoint.x - characterPoint.x);
            let angle = -90 + (360 / (2*Math.PI)) * -rotation;
            currentStepTimeline.to(childrenContainer, {
                pixi: {
                    angle:angle,
                    x: characterPoint.x,
                    y: characterPoint.y,
                },
                duration: 0.1,
                ease: 'none'
            }, '<');
            timeline.add(currentStepTimeline);
        }
        return timeline;
    }

    return {
        container,
        childrenContainer,
        sprite,
        points: ropePoints,
        attachToTrack,
        animateAlongTrack
    };
};