import { createPath } from './utils/path.js';

export const CameraSetting = Object.freeze({
    CutOff: 0, Follow: 1,
});

export async function createPlan(screen) {
    // Plan resembles RC plan, used by Track and Camera
    const blueprint = [
        {camera: CameraSetting.CutOff,
            path: [[0, 0], [1, 0]]},
        {camera: CameraSetting.Follow,
            path: [[0.1, 0], [0.4, 0], [0.8, -0.5], [0.6, -0.8], [0.4, -0.5], [0.9, 0]], },
        {camera: CameraSetting.CutOff,
            path: [[0.1, -0.5], [0.5 , -1], [1, -1.5]]},
    ]
    const controlPoints = Array.from(iterPlanCoordinates(blueprint));
    const path = createPath(controlPoints);

    function* iterPlanCoordinates(blueprint) {
        // blueprint: {camera: CameraSetting, path: #screenBlueprint}
        //      #screenBlueprint: Array[Array[2]]
        //      where Array[2] are [X, Y] relative to screen.width and screen.height
        for (let [i, screenBlueprint] of blueprint.entries()) {
            for (let [xRel, yRel] of screenBlueprint.path) {
                yield [(i + xRel) * screen.height * (16/9), (yRel) * screen.height];
            }
        }
    }

    return {
        path,
        blueprint
    };
}