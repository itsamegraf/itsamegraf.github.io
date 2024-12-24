import { createPath } from './utils/path.js';
import { gsap } from "@gsap"

export const CameraModes = Object.freeze({
    CutOff: 0, Follow: 1,
});

export function createScreenPlan(setting, screen, screenIdx) {

    // ScreenSetting:
    const {camera, points} = setting;

    return {
        camera,
        iterScreenPoints: function* () {
            for (let [xRel, yRel] of points) {
                yield {x: (screenIdx + xRel) * screen.height * (16/9), y: (yRel) * screen.height};
            }
        }
    };
}

export async function createPlan(screen) {
    // Plan resembles RC plan, used by Track and Camera
    const blueprint = [
        // ScreenSetting
        {
            camera: {
                mode: CameraModes.Follow,
            },
            points: [[0, 0], [1, 0]]
        }, {
            camera: {
                mode: CameraModes.CutOff,
                animation: {scale: 0.8,},
            },
            points: [[0.1, 0], [0.4, 0], [0.8, -0.5], [0.6, -0.8], [0.4, -0.5], [0.9, 0]], 
        }, {
            camera: {
                mode: CameraModes.Follow,
                animation: {scale: 1,},
            },
            points: [[0.1, -0.5], [0.5 , -1], [1, -1.5]]
        }, {
            camera: {
                mode: CameraModes.Follow,
            },
            points: [[0.3, -2], [0.7 , -1.8], [1, -1.5]],
        }, {
            camera: {
                mode: CameraModes.Follow,
            },
            points: [[0.5, 0]],
        },
    ]
    const [allControlPoints, contextByCPMap] = computePointsAndContext(blueprint);
    const path = createPath(allControlPoints);
    const snapPointFunc = gsap.utils.snap({values: allControlPoints});

    function computePointsAndContext(blueprint) {
        let allPoints = [];
        let contextByCP = new Map();
        for (let [i, screenSetting] of blueprint.entries()) {
            const screenPlan = createScreenPlan(screenSetting, screen, i);
            const currScreenPoints = Array.from(screenPlan.iterScreenPoints());
            allPoints.push(...currScreenPoints);
            currScreenPoints.forEach(cp => {
                contextByCP.set(cp, screenPlan);
            });
        }
        return [allPoints, contextByCP];
    }

    function getPointAndScreenSettingAtPosition(pos) {
        let currCP = snapPointFunc(pos);
        let currContext = contextByCPMap.get(currCP);
        return [currCP, currContext];
    }

    return {
        path,
        blueprint,
        getPointAndScreenSettingAtPosition
    };
}