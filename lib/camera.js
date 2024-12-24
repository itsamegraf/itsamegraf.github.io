import { CameraModes } from "./plan.js";
import { gsap, MotionPathPlugin } from "@gsap";

export async function createCamera(plan, worldContainer, cutoff) {
    const cutOffDuration = 2; // seconds

    function animateToPosition({x, y}, setting){
        gsap.to(worldContainer, {
            pixi: {
                x: -x,
                y: -y,
                ...setting?.animation,
            },
            ease: 'none',
            duration: 0.2,
        })
    }

    function isPointExceedingCutoff(currPoint, lastCutoffPoint) {
        return (
            // x increases over time -->
            (currPoint.x - lastCutoffPoint.x > cutoff.width) || 
            // y decreases over time --^
            ((lastCutoffPoint.y - currPoint.y) > cutoff.height)) 
    }

    function computeCenterizedPosition(currPoint, container) {
        let globalPos = container.getGlobalPosition();
        return {
            x: currPoint.x - Math.abs(globalPos.x - 0.5 * cutoff.width),
            y: currPoint.y + (globalPos.y - 0.5 * cutoff.height),
        };
    }

    return {

        // Note: this cannot be an arrow function as it will be scoped to the timeline
        // https://gsap.com/community/forums/topic/22181-onupdateparams-how-to-get-tween-itself-gsap-v3/
        updatePosition(currTween, tweenPath, cartContainer) {
            // this: Timeline (hosting currTween)
            const currPosition = MotionPathPlugin.getPositionOnPath(tweenPath, currTween.ratio);
            const centerizedPosition = computeCenterizedPosition(currPosition, cartContainer);
            const [_, currSetting] = plan.getPointAndScreenSettingAtPosition(currPosition);
            const currCameraSetting = currSetting.camera;

            // Follow: every movement
            if (currCameraSetting.mode == CameraModes.Follow) {
                animateToPosition(centerizedPosition, currCameraSetting);
            }

            // Cutoff: check if cartPosition exceeds cutoff width || height
            else if (currCameraSetting.mode == CameraModes.CutOff) {
                let lastCutoffPoint = this.data?.lastCutoffPoint;

                if (lastCutoffPoint == null || 
                    isPointExceedingCutoff(currPosition, lastCutoffPoint)) {

                    lastCutoffPoint = currPosition;
                    animateToPosition(centerizedPosition, currCameraSetting);
                }

                this.data.lastCutoffPoint = lastCutoffPoint;
            }

        }
    }
}