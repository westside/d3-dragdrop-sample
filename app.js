/**
 * http://bl.ocks.org/rkirsling/5001347
 * http://bl.ocks.org/cjrd/6863459
 * http://www.ng-newsletter.com/posts/d3-on-angular.html
 *
 * !!! : https://www.dashingd3js.com/svg-group-element-and-d3js
 * !!!!! : https://developer.mozilla.org/en/docs/Web/SVG/Element/marker
 */

(function(angular, d3){
    angular.module("commons", []);
    angular.module("testApp", ["commons"]);
    angular.module("testApp").controller("testController", function(d3Arrow) {
        var grid = this;
        var offset = {x :0, y :0};
        var drag;
        var selectedCallback;
        var rotateBefore = [];

        var arrowStartPoint = {x: 70, y: 50};
        var arrowEndPoint = {x: 100, y: 100};

        grid.init = function() {
            var map = d3.select("#gridContainer");
            grid.container = map.append("g");
        };

        grid.addObject = function() {
            var circle = grid.container.append("g").append("circle");

            circle.classed("draggable", true)
            .attr("cx", 50)
            .attr("cy", 50)
            .attr("r", 50)
            .on("mouseover", selectedCallback)
            .call(drag);
        };

        grid.deleteObject = function() {
            d3.selectAll(".selected").remove();
        }

        grid.addArrow = function() {
            d3Arrow.append(grid.container, arrowStartPoint, arrowEndPoint, selectedCallback);
        }

        drag = d3.behavior.drag()
        .on("drag", function() {
            var x = d3.event.x - offset.x;
            var y = d3.event.y - offset.y;
            d3.select(this).attr({
                transform: "translate(" + x + "," + y + ")"
            });
        })
        .on("dragstart", function() {
            var coordinates = d3.mouse(this);
            offset.x = coordinates[0];
            offset.y = coordinates[1];
            d3.event.sourceEvent.stopPropagation();
        });


        selectedCallback = function() {
            d3.selectAll(".selected").classed("selected", false);
            d3.select(this).classed("selected", true);
        }
    });

})(angular, d3);