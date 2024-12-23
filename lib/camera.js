import { CameraSetting } from "./plan.js";
import { gsap, MotionPathPlugin } from "@gsap"

export async function createCamera(plan, worldContainer, cutoff) {
    const cutOffDuration = 2; // seconds

    function animateToPosition({x, y}, duration=1){
        gsap.to(worldContainer, {
            pixi: {
                pivotX: x,
                pivotY: y
            },
            ease: 'none',
        })
    }

    return {

        // Note: this cannot be an arrow function as it will be scoped to the timeline
        // https://gsap.com/community/forums/topic/22181-onupdateparams-how-to-get-tween-itself-gsap-v3/
        updatePosition(currTween, tweenPath) {
            // this: Timeline (hosting currTween)
            const currPosition = MotionPathPlugin.getPositionOnPath(tweenPath, currTween.ratio);
            const [_, currSetting] = plan.getPointAndScreenSettingAtPosition(currPosition);
            const currCameraSetting = currSetting.cameraSetting;

            // Follow: every movement with offset (give )
            if (currCameraSetting == CameraSetting.Follow) {
                animateToPosition(currPosition);
            }

            // Cutoff: check if cartPosition exceeds cutoff width || height
            else if (currCameraSetting == CameraSetting.CutOff) {
                let cartPosition = currPosition;
                let lastCutoffPoint = this.data?.lastCutoffPoint;

                if (lastCutoffPoint == null) {
                    lastCutoffPoint = cartPosition;
                }

                else if ((cartPosition.x - lastCutoffPoint.x > cutoff.width) || // x increases over time -->
                         ((lastCutoffPoint.y - cartPosition.y) > cutoff.height)) { // y decreases over time --^
                    
                    animateToPosition(timeline, cartPosition, cutOffDuration);
                    lastCutoffPoint = cartPosition;
                }

                this.data.lastCutoffPoint = lastCutoffPoint;
            }

        }
    }
}