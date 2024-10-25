import { Container, Assets, MeshRope, Point } from '@pixi';
import { Bezier } from '@bezier-js';

export async function createCart(track) {
    const container = new Container();
    const points = Array(3).fill().map(_ => new Point(0,0));
    
    const texture = await Assets.load('assets/rc_cart.png');
    const sprite = new MeshRope({texture, points});

    attachToTrack();
    container.addChild(sprite);

    function* _iterTrack() {
        let history = [];
        let historyLen = 0;

        // point-triplets window generator
        const windowSize = 3;
        const pointsWindowIter = Array.from(
            {length: track.points.length - (windowSize - 1)}, //get the appropriate length
            (_, index) => track.points.slice(index, index + windowSize) //create the windows
          );

        for (let pWindow of pointsWindowIter) {
            let currSlice = pWindow.map(p => ({x: p.x, y: p.y}));
            let currCurve = Bezier.quadraticFromPoints(...currSlice);

            history.push(currCurve);
            historyLen += currCurve.length();
            
            if (historyLen < texture.width) {
                console.log(`oops ${lutPointsCount}`);
                continue;
            }
            console.log(`yay ${lutPointsCount}`);

            yield history;
        }
    }

    function attachToTrack(pointIdx=0) {

        // create bezierJS instance
        let currSlice = track.points.slice(pointIdx, pointIdx+3).map(p => ({x: p.x, y: p.y}));
        let bezier = Bezier.quadraticFromPoints(...currSlice).offset(-75);
        
        // if (bezier.length != 1)
        //     console.log(`oops ${bezier.length}`);
        bezier = bezier[0];

        // check how many times cart fits into curve
        let curveLen = bezier.length();
        let lutPointsCount = texture.width/curveLen
        // let subcurves = bezier.getLUT(cartTexture.width/)
        console.log(`oops ${lutPointsCount}`);

        // for (let [i, p] of Object.entries(track.points.slice(pointIdx, pointIdx+cartPoints.length))) {
        for(let [i, p] of Object.entries(bezier.points)) {
            let cartP = points[i];
            cartP.copyFrom(p);
            
            // TODO: cartP.copyFrom(p.offset(5))
            //  where 5 is offset of base wheels from track
            //  where .offset is bezierJS offset

            // all of these dont work:
            // cartP.x = p.x + (i/cartPoints.length) * cartTexture.width;
            // cartP.y -= cartTexture.height / 2; // mimics .anchor.y = 1;
            // cartP.y += cartTexture.height * 0.56;
            // cartP.y += track.container.children[0].texture.height * 0.3;
        }
    }
    return {
        container,
        sprite,
        points,
        attachToTrack
    };
};