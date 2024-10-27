import * as PIXI from '@pixi';
import { Bezier } from '@bezier-js';

const Generator = Object.getPrototypeOf(function* () {});

Generator.prototype.entries = function * () {
    let i = 0;
    for (let value of this) {
        yield [i++, value];
    }
}

export function createPath(controlPoints) {

    const points = createPoints();

    // switch to distance based sampling
    function* _iterCurves(windowSize=3) {
        // point-triplets window generator
        // A-B-C + C-D-E - we advance iterator -1 to have one common point each time
        for (let i = 0; i + windowSize < points.length; i += (windowSize - 1)) {
            let currWindow = points.slice(i, i + windowSize);
            let currSlice = currWindow.map(p => ({x: p.x, y: p.y}));
            yield Bezier.quadraticFromPoints(...currSlice);   
        }
    }

    function* iterPointsAtDistance(sampleDistance) {
        let pointsYielded = 0
        let historyLen = 0;
        for (let [iCurve, currCurve] of _iterCurves().entries()) {
            let currCurveLen = currCurve.length();
            let lenLeft=currCurveLen;

            // if it's the first point ever
            if (pointsYielded == 0) {
                // we yield it as the initial point
                console.log(`Curve ${iCurve}: zero point`);
                yield currCurve.get(0);
                pointsYielded++;
            }

            // if there's history and curveLen with history is bigger than sample size
            let initialFraction = 0;
            if (historyLen > 0 && (lenLeft + historyLen > sampleDistance)) {
                // yield first point taking care of history
                const usedLength = sampleDistance - historyLen;
                initialFraction = usedLength / currCurveLen;
                
                console.log(`Curve ${iCurve}: initial point ${initialFraction}`);
                yield currCurve.get(initialFraction);
                pointsYielded++;

                // reduce usedLen from lenLeft
                lenLeft -= usedLength;
                historyLen = 0;
            }

            // (rest-of) curve is bigger than sample size
            if (lenLeft > sampleDistance) { 
                const sampleFraction = sampleDistance / currCurveLen;
                for(let i=1; lenLeft > sampleDistance; lenLeft-=sampleDistance, i++) {
                    // Note: i==0 is the initial fraction part
                    const currentFranction = initialFraction + i * sampleFraction;
                    console.log(`Curve ${iCurve}: rest point ${currentFranction}`);

                    yield currCurve.get(currentFranction);
                    pointsYielded++;
                }
            }
            
            // keep len residue in history
            historyLen += lenLeft;

        }
    }

    function createPoints() {
        let pointsXY = controlPoints;
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
        points,
        iterPointsAtDistance
    }
}