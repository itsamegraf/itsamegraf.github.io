
import { CameraSetting } from "./plan.js";

export async function createCamera(plan, worldContainer, cutoff) {
    let lastCutoffPoint = null;
    const cutOffDuration = 2; // seconds
    let currentSetting = CameraSetting.Follow;

    function animateToPosition(timeline, {x, y}, duration){
        timeline.to(worldContainer, {
            pixi: {
                pivotX: x,
                pivotY: y
            },
            duration: duration,
            ease: 'none',
        }, `<-${duration}`);
    }

    return {

        updatePosition: (cartPosition, timeline, lastAnimation) => {

            // Follow: every movement with offset (give )
            if (currentSetting == CameraSetting.Follow) {
                animateToPosition(timeline, cartPosition, lastAnimation.duration());
            }

            // Cutoff: check if cartPosition exceeds cutoff width || height
            else if (currentSetting == CameraSetting.CutOff) {

                if (lastCutoffPoint == null) {
                    lastCutoffPoint = cartPosition;
                }

                else if ((cartPosition.x - lastCutoffPoint.x > cutoff.width) || // x increases over time -->
                         ((lastCutoffPoint.y - cartPosition.y) > cutoff.height)) { // y decreases over time --^
                    
                    animateToPosition(timeline, cartPosition, cutOffDuration);
                    lastCutoffPoint = cartPosition;
                }
            }

        }
    }
}