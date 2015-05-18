function bezFunction(){

    var easingFunctions = [];
    var len = 0;
    var storedBezierCurves = {};
    var math = Math;

    function pointOnLine2D(x1,y1, x2,y2, x3,y3){
        return math.abs(((x2 - x1) * (y3 - y1)) - ((x3 - x1) * (y2 - y1))) < 0.00001;
    }

    function getEasingCurveByIndex(index){
        return easingFunctions[index].fnc;
    }

    function getEasingCurve(aa,bb,cc,dd,encodedFuncName) {
        if(!encodedFuncName){
            encodedFuncName = ('bez_' + aa+'_'+bb+'_'+cc+'_'+dd).replace(/\./g, 'p');
        }
        if(easingFunctions[encodedFuncName]){
            return easingFunctions[encodedFuncName];
        }
        var A0, B0, C0;
        var A1, B1, C1;
        easingFunctions[encodedFuncName] = function(x, t, b, c, d) {
            var tt = t/d;
            x = tt;
            var i = 0, z;
            while (++i < 14) {
                C0 = 3 * aa;
                B0 = 3 * (cc - aa) - C0;
                A0 = 1 - C0 - B0;
                z = (x * (C0 + x * (B0 + x * A0))) - tt;
                if (Math.abs(z) < 1e-3) break;
                x -= z / (C0 + x * (2 * B0 + 3 * A0 * x));
            }
            C1 = 3 * bb;
            B1 = 3 * (dd - bb) - C1;
            A1 = 1 - C1 - B1;
            var polyB = x * (C1 + x * (B1 + x * A1));
            return c * polyB + b;
        };
        return easingFunctions[encodedFuncName];
    }

    function drawBezierCurve(pt1,pt2,pt3,pt4){
        ///return 0;
        var bezierName = (pt1.join('_')+'_'+pt2.join('_')+'_'+pt3.join('_')+'_'+pt4.join('_')).replace(/\./g, 'p');
        if(storedBezierCurves[bezierName]){
            return storedBezierCurves[bezierName];
        }
        var curveSegments = 500;
        var k;
        var i, len;
        var triCoord1,triCoord2,triCoord3,liCoord1,liCoord2,ptCoord,perc,addedLength = 0;
        var ptDistance;
        var point,lastPoint = null;
        var bezierData = {
            points :[],
            segmentLength: 0
        };
        if(pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt3[0],pt3[1]) && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt4[0],pt4[1])){
            curveSegments = 2;
        }
        len = pt3.length;
        for(k=0;k<curveSegments;k+=1){
            point = [];
            perc = k/(curveSegments-1);
            ptDistance = 0;
            for(i=0;i<len;i+=1){
                triCoord1 = pt1[i] + (pt3[i] - pt1[i])*perc;
                triCoord2 = pt3[i] + (pt4[i] - pt3[i])*perc;
                triCoord3 = pt4[i] + (pt2[i] - pt4[i])*perc;

                liCoord1 = triCoord1 + (triCoord2 - triCoord1)*perc;
                liCoord2 = triCoord2 + (triCoord3 - triCoord2)*perc;
                ptCoord = liCoord1 + (liCoord2 - liCoord1)*perc;
                point.push(ptCoord);
                if(lastPoint !== null){
                    ptDistance += Math.pow(point[i] - lastPoint[i],2);
                }
            }
            ptDistance = Math.sqrt(ptDistance);
            addedLength += ptDistance;
            bezierData.points.push({partialLength: ptDistance,cumulatedLength:addedLength, point: point});
            lastPoint = point;
        }
        bezierData.segmentLength = addedLength;
        storedBezierCurves[bezierName] = bezierData;
        return bezierData;
    }

    function createBezierPath(pt1,pt2,pt3,pt4){
        var curveStr = 'M'+pt1[0]+','+pt1[1];
        curveStr += 'C'+(pt1[0]+pt3[0])+','+(pt1[1]+pt3[1]);
        curveStr += ' '+(pt2[0]+pt4[0])+','+(pt2[1]+pt4[1]);
        curveStr += ' '+pt2[0]+','+pt2[1];
        return curveStr;
    }

    function buildBezierData(keyData){
        var pt1 = keyData.s;
        var pt2 = keyData.e;
        var pt3 = keyData.to;
        var pt4 = keyData.ti;
        var curveSegments = 500;
        var k;
        var i, len;
        var triCoord1,triCoord2,triCoord3,liCoord1,liCoord2,ptCoord,perc,addedLength = 0;
        var ptDistance;
        var point,lastPoint = null;
        var bezierData = {
            points :[],
            segmentLength: 0
        };
        if((pt1[0] != pt2[0] || pt1[1] != pt2[1]) && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt1[0]+pt3[0],pt1[1]+pt3[1]) && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt2[0]+pt4[0],pt2[1]+pt4[1])){
            curveSegments = 2;
        }
        len = pt3.length;
        for(k=0;k<curveSegments;k+=1){
            point = [];
            perc = k/(curveSegments-1);
            ptDistance = 0;
            for(i=0;i<len;i+=1){
                // DON'T ERASE. MIGHT BE USEDFUL FOR DRAWING PARTIAL BEZIER CURVES.
                triCoord1 = pt1[i] + (pt3[i])*perc;
                triCoord2 = pt1[i] + pt3[i] + (pt2[i] + pt4[i] - (pt1[i] + pt3[i]))*perc;
                triCoord3 = pt2[i] + pt4[i] + -pt4[i]*perc;
                liCoord1 = triCoord1 + (triCoord2 - triCoord1)*perc;
                liCoord2 = triCoord2 + (triCoord3 - triCoord2)*perc;
                ptCoord = liCoord1 + (liCoord2 - liCoord1)*perc;
                //ptCoord = Math.pow(1-perc,3)*pt1[i]+3*Math.pow(1-perc,2)*perc*pt3[i]+3*(1-perc)*Math.pow(perc,2)*pt4[i]+Math.pow(perc,3)*pt2[i];
                point.push(ptCoord);
                if(lastPoint !== null){
                    ptDistance += Math.pow(point[i] - lastPoint[i],2);
                }
            }
            ptDistance = Math.sqrt(ptDistance);
            addedLength += ptDistance;
            bezierData.points.push({partialLength: ptDistance,cumulatedLength:addedLength, point: point});
            lastPoint = point;
        }
        bezierData.segmentLength = addedLength;
        keyData.bezierData = bezierData;
    }

    var ob = {
        getEasingCurve : getEasingCurve,
        getEasingCurveByIndex : getEasingCurveByIndex,
        drawBezierCurve : drawBezierCurve,
        buildBezierData : buildBezierData
    };

    return ob;
}

var bez = bezFunction();