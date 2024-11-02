import * as PIXI from '@pixi';
import { Bezier } from '@bezier-js';
import BezierSpline from '@bezier-spline'

const Generator = Object.getPrototypeOf(function* () {});

Generator.prototype.entries = function * () {
    let i = 0;
    for (let value of this) {
        yield [i++, value];
    }
}

export function createPath(controlPoints) {

    const spline = new BezierSpline(controlPoints);

    // switch to distance based sampling
    function* iterCurves(offset=null) {
        // point-triplets window generator
        // A-B-C + C-D-E - we advance iterator -1 to have one common point each time
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

    function* iterPointsAtDistance(sampleDistance, offset=null) {
        for (let [currCurve, currT] of iterCurveAndFractionAtDistance(sampleDistance, offset)) {
            yield currCurve.get(currT);
        }
    }
    
    function* iterPointsAndNormalAtDistance(sampleDistance, offset=null) {
        for (let [currCurve, currT] of iterCurveAndFractionAtDistance(sampleDistance, offset)) {
            yield [currCurve.get(currT), currCurve.normal(currT)]
        }
    }

    function* iterCurveAndFractionAtDistance(sampleDistance, offset=null) {
        let pointsYielded = 0
        let historyLen = 0;
        for (let [iCurve, currCurve] of iterCurves(offset).entries()) {
            let currCurveLen = currCurve.length();
            let lenLeft=currCurveLen;

            // if it's the first point ever
            if (pointsYielded == 0) {
                // we yield it as the initial point
                // console.log(`Curve ${iCurve}: zero point`);
                yield [currCurve, 0]
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
                for(let i=1; lenLeft > sampleDistance; lenLeft-=sampleDistance, i++) {
                    // Note: i==0 is the initial fraction part
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

    return {
        points: controlPoints,
        iterSplineControlPoints,
        iterPointsAtDistance,
        iterPointsAndNormalAtDistance,
    }
}