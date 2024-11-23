import { Container, Assets, MeshRope, Point } from '@pixi';
import { gsap } from '@gsap';

const Generator = Object.getPrototypeOf(function* () {});

Generator.prototype.entries = function * () {
    let i = 0;
    for (let value of this) {
        yield [i++, value];
    }
}

export async function createCart(plan) {
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
        for (let [point, normal] of plan.path.iterPointsAndNormalAtDistance(sampleDistance, offsetFromTrack)) {
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
    }

    function _computeChildPosAndAngle(idx) {
        const relCharPos = 4/6;
        const idxCharPos = idx + Math.floor(relCharPos*ropePoints.length);
        const characterPoint = pathPoints[idxCharPos];
        const normal = pathNormals[idxCharPos];
        const normalPoint = {x: characterPoint.x + normal.x, y: characterPoint.y + normal.y};
        // https://stackoverflow.com/questions/50546456
        let rotation = Math.atan2(characterPoint.y - normalPoint.y, normalPoint.x - characterPoint.x);
        let angle = -90 + (360 / (2*Math.PI)) * -rotation;
        return {characterPoint, angle};
    }

    function iterAnimationsAlongTrack(startIdx=0, onMove=null) {
        const frameDuration = 0.1;
        let timeline = gsap.timeline();
        let ropeLen = ropePoints.length;
        let endIdx = Math.ceil(pathPoints.length - ropeLen - startIdx);
        for (let [i, _] of pathPoints.slice(startIdx, endIdx).entries()) {

            let nextPointsWindow = pathPoints.slice(i, i + ropeLen);

            // construct current step timeline
            let currentStepTimeline = gsap.timeline();
            for(let [j, p] of Object.entries(ropePoints)) {
                currentStepTimeline.to(p, {
                    x: nextPointsWindow[j].x, 
                    y: nextPointsWindow[j].y,
                    duration: frameDuration,
                    ease: 'none'
                }, '<');
            }
 
            // add childrenContainer adjustment accordingly
            let {characterPoint, angle} = _computeChildPosAndAngle(i);
            currentStepTimeline.to(childrenContainer, {
                pixi: {
                    angle: `${angle}_short`,
                    x: characterPoint.x,
                    y: characterPoint.y,
                },
                duration: frameDuration,
                ease: 'none'
            }, '<');

            timeline.add(currentStepTimeline);

            // update camera
            if (onMove) {
                onMove(nextPointsWindow[0], timeline, currentStepTimeline);
            }
        }
        return timeline;
    }

    return {
        container,
        childrenContainer,
        sprite,
        points: ropePoints,
        attachToTrack,
        iterAnimationsAlongTrack
    };
};