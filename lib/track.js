import { Assets, MeshRope } from '@pixi';
import * as PIXI from '@pixi';

export async function createTrack(ground, screen) {
    const container = new PIXI.Container();
    const points = createRopePoints();
    const trackRope = await createTrackRope(points);

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
        // const rcTrackSprite = new TilingSprite({
        //     texture: rcTrackTexture, width: ground.width
        // });

        return rcTrackMeshRope;
    }
    function createRopePoints() {
        const w = screen.width, h = screen.height;
        let pointsXY = [
            [0,0], [0.4 * w,0], [0.8 * w, -0.5 * h], [0.5 * w, -0.8 * h],  [0.4 * w, -0.5 * h], [0.6 * w,0], 
            [0.9 * w, 0], [1.1 * w, -100], [screen.width * 1.5 , -500], [screen.width * 2, -1000]];
        // .map(([x,y]) => [x * 120, //cart.sprite.width, 
                        //  y * 100]); //cart.sprite.height]);

        // historySize determines how long the trail will be.
        const historySize = pointsXY.length*3;
        // ropeSize determines how smooth the trail will be.
        const ropeSize = historySize*5;

        // Inspired by pixiJS examples https://pixijs.io/examples-v5/#/demos-advanced/mouse-trail.js  
        const pointsX = [], pointsY = []; 
        for (let i = 0; i < historySize; i++) {
            pointsX.push(0);
            pointsY.push(0);
        }

        // Create rope points.
        const points = [];
        const [lastPointX, lastPointY] = pointsXY[pointsXY.length-1];
        for (let i = 0; i < ropeSize; i++) {
            points.push(new PIXI.Point(lastPointX, lastPointY));
        }

        // fill pointsXY with the last point repeated
        for(const [x,y] of pointsXY.reverse()) {
            pointsX.pop();
            pointsX.unshift(x);
            pointsY.pop();
            pointsY.unshift(y);
        }
        
        // Update the points to correspond with history.
        for (let i = 0; i < historySize; i++) {
            const p = points[i];

            // Smooth the curve with cubic interpolation to prevent sharp edges.
            const ix = cubicInterpolation(pointsX, i / ropeSize * historySize);
            const iy = cubicInterpolation(pointsY, i / ropeSize * historySize);

            p.x = ix;
            p.y = iy;
        }
        return points;
    }

    /**
     * Copied from pixiJS examples https://pixijs.io/examples-v5/#/demos-advanced/mouse-trail.js
     * Cubic interpolation based on https://github.com/osuushi/Smooth.js
     */
    function clipInput(k, arr) {
        if (k < 0) k = 0;
        if (k > arr.length - 1) k = arr.length - 1;
        return arr[k];
    }

    function getTangent(k, factor, array) {
        return factor * (clipInput(k + 1, array) - clipInput(k - 1, array)) / 2;
    }

    function cubicInterpolation(array, t, tangentFactor) {
        if (tangentFactor == null) tangentFactor = 1;

        const k = Math.floor(t);
        const m = [getTangent(k, tangentFactor, array), getTangent(k + 1, tangentFactor, array)];
        const p = [clipInput(k, array), clipInput(k + 1, array)];
        t -= k;
        const t2 = t * t;
        const t3 = t * t2;
        return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
    }


    return {
        container,
        points,
    };
}