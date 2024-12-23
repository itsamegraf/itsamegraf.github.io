import { Bezier } from '@bezier-js';
import BezierSpline from '@bezier-spline'

export function createPath(controlPoints) {
    let spline = createSpline(controlPoints);

    function* iterCurveAndFractionAtDistance(sampleDistance, offset=null) {
        let pointsYielded = 0;
        let historyLen = 0;
        for (let currCurve of spline.iterCurves(offset)) {
            let currCurveLen = currCurve.length();
            let lenLeft = currCurveLen;

            // if it's the first point ever
            if (pointsYielded == 0) {
                // we yield it as the initial point
                // console.log(`Curve ${iCurve}: zero point`);
                yield [currCurve, 0];
                pointsYielded++;
            }

            // if there's history and curveLen with history is bigger than sample size
            let initialFraction = 0;
            if (historyLen > 0 && (lenLeft + historyLen > sampleDistance)) {
                // yield first point taking care of history
                const usedLength = sampleDistance - historyLen;
                initialFraction = usedLength / currCurveLen;
                
                // console.log(`Curve ${iCurve}: initial point ${initialFraction}`);
                yield [currCurve, initialFraction];
                pointsYielded++;

                // reduce usedLen from lenLeft
                lenLeft -= usedLength;
                historyLen = 0;
            }

            // (rest-of) curve is bigger than sample size
            if (lenLeft > sampleDistance) { 
                const sampleFraction = sampleDistance / currCurveLen;
                // Note: i=0 was taken care of by initialFraction
                for(let i=1; lenLeft > sampleDistance; lenLeft-=sampleDistance, i++) {
                    const currentFranction = initialFraction + i * sampleFraction;
                    // console.log(`Curve ${iCurve}: rest point ${currentFranction}`);

                    yield [currCurve, currentFranction];
                    pointsYielded++;
                }
            }
            
            // keep len residue in history
            historyLen += lenLeft;
        }
    }

    function* iterPointsAtDistance(sampleDistance, offset=null) {
        for (let [currCurve, currT] of iterCurveAndFractionAtDistance(sampleDistance, offset)) {
            yield currCurve.get(currT);
        }
    }
    // Not needed but good to still have if normal data (rotation) for given point is also needed
    // function* iterPointsAndNormalAtDistance(sampleDistance, offset=null) {
    //     for (let [currCurve, currT] of iterCurveAndFractionAtDistance(sampleDistance, offset)) {
    //         yield [currCurve.get(currT), currCurve.normal(currT)]
    //     }
    // }

    return {
        iterPointsAtDistance,
    }
}

export function createSpline(controlPoints) {

    const spline = new BezierSpline(controlPoints.map(({x,y}) => [x,y]));

    // switch to distance based sampling
    function* iterCurves(offset=null) {
        for (let currSplineCurveControlPoints of iterSplineControlPoints()) {
            let currCurve = new Bezier(...currSplineCurveControlPoints);

            if (offset != null) {
                let subCurvesAtOffset = currCurve.offset(offset);
                // console.log(`Curve ${i} has ${subCurvesAtOffset.length} subcurves`)
                yield* subCurvesAtOffset;
            } else {
                yield currCurve;
            }
        }
    }

    function* iterSplineControlPoints() {
        for (let splineCurve of spline.curves) {
            yield Array.from(splineCurve).map(([x,y]) => ({x,y}));
        }
    }

    return {
        points: controlPoints,
        iterCurves
    }
}