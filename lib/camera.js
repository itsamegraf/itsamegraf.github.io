import { gsap } from '@gsap';
import * as PIXI from '@pixi';

export async function createCamera(worldContainer, cutoff) {
    let lastCutoffPoint = null;
    const cutOffDuration = 2; // seconds

    function animateToPosition(timeline, {x, y}){
        timeline.to(worldContainer, {
            pixi: {
                pivotX: x,
                pivotY: y
            },
            duration: cutOffDuration,
            ease: 'none',
        }, `<-${cutOffDuration}`);
    }

    return {

        updatePosition: (timeline, cartPosition) => {

            if (lastCutoffPoint == null) {
                lastCutoffPoint = cartPosition;
            }

            // check if cartPosition exceeds cutoff width || height
            else if ((cartPosition.x - lastCutoffPoint.x > cutoff.width) || // x increases over time
                     ((lastCutoffPoint.y - cartPosition.y) > cutoff.height)) {
                    
                    animateToPosition(timeline, cartPosition);
                    lastCutoffPoint = cartPosition;
                }

        }
    }
}