/**
 *
 */
(function (angular, d3) {
    'use strict';
    angular.module("commons").service("d3Arrow", function () {
        var arrowEndPointDrag, arrowStartPointDrag, arrowLineDrag, savedStatus = {};
		var genTrianglePointsAndTransformAttr, calculateDegree;

        savedStatus.dragStartPoint = {x : 0, y : 0};
        savedStatus.dragEndPoint = {x : 0, y : 0};
        savedStatus.startPoint = {x : 0, y : 0};
        savedStatus.endPoint = {x : 0, y : 0};
        savedStatus.trianglePoints = [{x : 0, y : 0}, {x : 0, y : 0}, {x : 0, y : 0}];
        savedStatus.offset = {x : 0, y : 0};

        function drawArrow(d3Obj, startPoint, endPoint) {
			var arrowGroup, calAttrs;
			
            arrowGroup = d3Obj.append("g");
            arrowGroup.append("line")
                .attr("x1", startPoint.x)
                .attr("y1", startPoint.y)
                .attr("x2", endPoint.x)
                .attr("y2", endPoint.y)
                .attr("stroke-width", "5px");

            arrowGroup.append("circle")
                .attr("cx", startPoint.x)
                .attr("cy", startPoint.y)
                .attr("r", 10);

            calAttrs = genTrianglePointsAndTransformAttr(startPoint, endPoint);

            arrowGroup.append("polygon").attr("points", calAttrs.points).attr("transform", calAttrs.transform);

            return arrowGroup;
        }

        function getTrianglePoint(d3Obj) {
			var triangleObj, prevTrianglePoint;
			
            triangleObj = d3Obj.select("polygon");
            prevTrianglePoint = [{x : 0, y : 0}, {x : 0, y : 0}, {x : 0, y : 0}];


            triangleObj.attr("points").split(" ").forEach(function (value, index) {
                var list = value.split(",");
                prevTrianglePoint[index].x = parseInt(list[0], 10);
                prevTrianglePoint[index].y = parseInt(list[1], 10);
            });

            return prevTrianglePoint;
        }


        function transformStartPoint(d3Obj, x, y) {
            return transformArrow(d3Obj, x, y, "start");
        }

        function transformEndPoint(d3Obj, x, y) {
            return transformArrow(d3Obj, x, y, "end");
        }

        function transformArrow(arrowGroup, movX, movY, type) {
            var points = "", movStartX = 0, movStartY = 0, movEndX = 0, movEndY = 0, calAttrs, startPoint, endPoint;

            if (type === "start") {
                movStartX = movX;
                movStartY =  movY;
            } else if (type === "end") {
                movEndX = movX;
                movEndY = movY;
            } else {
                movStartX = movX;
                movStartY =  movY;
                movEndX = movX;
                movEndY = movY;
            }

            startPoint = { x: savedStatus.dragStartPoint.x + movStartX, y : savedStatus.dragStartPoint.y + movStartY};
            endPoint = {x : savedStatus.dragEndPoint.x + movEndX, y : savedStatus.dragEndPoint.y + movEndY};
            // line
            arrowGroup.select("line").attr("x1", startPoint.x).attr("y1", startPoint.y).attr("x2", endPoint.x).attr("y2", endPoint.y);

            // start point
            arrowGroup.select("circle").attr("cx", startPoint.x).attr("cy", startPoint.y);

            // end point
            savedStatus.trianglePoints.forEach(function (value, j) {
				var newX, newY;
                newX = savedStatus.trianglePoints[j].x + movEndX;
                newY = savedStatus.trianglePoints[j].y + movEndY;
                points += newX + ",";

                points += newY + (j === 2 ? "" : " ");
            });



            calAttrs = genTrianglePointsAndTransformAttr(startPoint, endPoint);

            arrowGroup.select("polygon").attr("transform", "rotate(360," + savedStatus.endPoint.x + "," + savedStatus.endPoint.y + ")")
            .attr("points", calAttrs.points)
            .attr("transform", calAttrs.transform);

            // SAVE PREV POINT
            savedStatus.startPoint =  startPoint;
            savedStatus.endPoint =  endPoint;


            return arrowGroup;
        }

        calculateDegree = function(startPoint, endPoint) {
            var offset = 45;

            // argument check;
            if (startPoint === undefined || endPoint === undefined) {
                console.log("undefined paramter");
                return -1;
            }

            var deltaX = endPoint.x - startPoint.x;
            var deltaY = endPoint.y - startPoint.y;
            var degree;
            if (deltaX === 0) {
                if (deltaY === 0) {
                    degree = 0;
                } else if (deltaY >= 0) {
                    degree = 90;
                } else {
                    degree = -90;
                }
            } else {
                // 2 quadrant, 3 quadrant
                if (deltaX < 0) {
                    degree = 180 - Math.atan(-deltaY / deltaX) * 180 / Math.PI;
                } else {
                    degree = Math.atan(deltaY / deltaX) * 180 / Math.PI;
                }

            }
            degree += offset;

            return degree;
        };

        genTrianglePointsAndTransformAttr = function(arrowStartPoint, arrowEndPoint) {
            // argument check;
            if (arrowStartPoint === undefined || arrowEndPoint == undefined) {
                console.log("undefined paramter");
                return;
            }
            var degree = calculateDegree(arrowStartPoint, arrowEndPoint);

            var offset = 20;
            var points = (arrowEndPoint.x - offset / 2) + "," + (arrowEndPoint.y - offset / 2) + " "
                + (arrowEndPoint.x + offset / 2) + "," + (arrowEndPoint.y - offset / 2) + " "
                + (arrowEndPoint.x + offset / 2) + "," + (arrowEndPoint.y + offset / 2);

            var rotate = "rotate(" + degree + "," + arrowEndPoint.x + "," + arrowEndPoint.y + ")";


            return {points : points, transform : rotate};
        };

        var appendArrow = function (d3Obj, arrowStartPoint, arrowEndPoint, selectedCallback) {
            var arrowGroup = drawArrow(d3Obj, arrowStartPoint, arrowEndPoint);
            arrowGroup.select("line").call(arrowLineDrag);
            arrowGroup.select("circle").call(arrowStartPointDrag);
            arrowGroup.select("polygon").call(arrowEndPointDrag);

            arrowGroup.classed('draggable', true).on("mouseover", selectedCallback);
        }

        // DRAG EVENT HANDLING
        function dragStart() {
            d3.event.sourceEvent.stopPropagation();
            var arrowGroup =d3.select(this.parentNode);

            savedStatus.dragStartPoint =  {
                    x : parseInt(arrowGroup.select("line").attr("x1")),
                    y: parseInt(arrowGroup.select("line").attr("y1"))
                };
            savedStatus.dragEndPoint =  {
                    x : parseInt(arrowGroup.select("line").attr("x2")),
                    y: parseInt(arrowGroup.select("line").attr("y2"))
                };
            savedStatus.trianglePoints = getTrianglePoint(arrowGroup);
            savedStatus.startPoint = savedStatus.dragStartPoint;
            savedStatus.endPoint = savedStatus.dragEndPoint;

            var coordinates = d3.mouse(this);
            savedStatus.offset.x = coordinates[0];
            savedStatus.offset.y = coordinates[1];
        }

        function savePrevPoint() {

        }

        arrowLineDrag = d3.behavior.drag()
        .on("drag", function() {
            transformArrow(d3.select(this.parentNode),
                    d3.event.x - savedStatus.offset.x,
                    d3.event.y - savedStatus.offset.y);
        }).on("dragstart", dragStart);

        arrowStartPointDrag = d3.behavior.drag()
        .on("drag", function() {
            transformStartPoint(d3.select(this.parentNode),
                    d3.event.x - savedStatus.offset.x,
                    d3.event.y - savedStatus.offset.y);
        }).on("dragstart", dragStart);

        arrowEndPointDrag = d3.behavior.drag()
        .on("drag", function () {
            var x = d3.event.x - savedStatus.offset.x;
            var y = d3.event.y - savedStatus.offset.y;

            var arrowGroup = d3.select(this.parentNode);

            transformEndPoint(arrowGroup, x, y);
        }).on("dragstart", dragStart);


        // PUBLIC FUNCTION
        this.append  = appendArrow;
    });
})(angular, d3);