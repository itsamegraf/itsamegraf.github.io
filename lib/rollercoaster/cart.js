import { Container, Assets, MeshRope, Point } from '@pixi';
import { gsap, MotionPathPlugin } from '@gsap';

export async function createCart(plan) {
    const cartPointsCount = 6;
    const relCharIdx = 4; // Character is positioned at 4/6 cart
    const offsetFromTrack = -60; // Cart is placed 60px above track

    const container = new Container();
    const childrenContainer = new Container();
    const texture = await Assets.load('assets/rc_cart.png');
    const sampleDistance = texture.width / cartPointsCount;
    const cartPathPoints = Array.from(plan.path.iterPointsAtDistance(sampleDistance, offsetFromTrack));
    const ropePoints = Array(cartPointsCount).fill().map(_ => new Point(0,0));
    ropePoints.forEach((ropePoint, i) => {ropePoint.copyFrom(cartPathPoints[i])});
    const sprite = new MeshRope({texture, points: ropePoints});

    container.addChild(childrenContainer, sprite);
    childrenContainer.position.copyFrom(ropePoints[relCharIdx]);

    function generatePointTimelines(totalDuration, onMove) {
        const ropeLen = ropePoints.length;
        const ease = 'power1.InOut';
        let endIdx = cartPathPoints.length - ropeLen;

        let pointsTimeline = gsap.timeline();
        for (let [i, currPoint] of ropePoints.entries()) {
            let currPathArr = cartPathPoints.slice(i, endIdx + i);

            let currTimeline = gsap.timeline();
            currTimeline.to(currPoint, {
                motionPath: currPathArr,
                ease,
            });
            pointsTimeline.add(currTimeline, '<');
        }

        // slice [charPos, endIdx], to match length well add the final position
        let charPathArr = cartPathPoints.slice(relCharIdx, endIdx + relCharIdx);
        let childrenTween = gsap.to(childrenContainer, {
            motionPath: {
                path: charPathArr,
                autoRotate: true,
                useRadians: true,
            },
            ease,
        });
        // charPathArr.push(...Array(relCharIdx).fill(pathPoints[pathPoints.length-1]));
        let pathRawArr = MotionPathPlugin.arrayToRawPath(cartPathPoints.slice(0, endIdx));
        let currTimeline = gsap.timeline({
            data: {}, // container for context between onUpdate calls
            onUpdate: onMove,
            onUpdateParams: [childrenTween, pathRawArr, childrenContainer],
        });
        currTimeline.add(childrenTween);
        pointsTimeline.add(currTimeline, '<');
        pointsTimeline.duration(totalDuration);

        return pointsTimeline;
    }

    return {
        container,
        childrenContainer,
        sprite,
        points: ropePoints,
        generatePointTimelines
    };
};