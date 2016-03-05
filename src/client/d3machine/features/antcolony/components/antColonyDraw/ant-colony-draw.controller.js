(function(angular, d3, _) {
    'use strict';

    angular.module('d3machinelearn.antColony')
        .controller('antColonyDrawController', AntColonyDrawController);

        // @ngInject
    function AntColonyDrawController($interval, AntColonyService){
        var vm = this;
        var nCities;
        var nAnts;
        var bestTrail;
        var iterations;
        var solutions = [];
        var solutionIntervalIterator;
        var ants;
        var trailgraph;
        var pheromones;

        var draw = {};

        vm.nCities = nCities;
        vm.nAnts = nAnts;
        vm.solutions = solutions;
        vm.iterateFullSolution = iterateFullSolution

        nAnts = 4;
        nCities = 60;

        init(nAnts, nCities);
        initDrawing();
        // iterateFull(ants, pheromones, trailgraph);

        function init(nAnts, nCities) {
            ants = AntColonyService.GenerateAnts(nAnts, nCities);
            trailgraph = AntColonyService.GenerateCitiesGraph(nCities);
            pheromones = AntColonyService.GeneratePheromones(nCities);
            bestTrail = ants[0].trail;
            iterations = 0;
            solutions = [];
        }

        function initDrawing() {
            draw.bestTrail = initbestTrailDrawing();
        }

        function initbestTrailDrawing(draw) {
            var vis = {};
            vis.svg = {};
            vis.svg.height = 100;
            vis.svg.width = 1000;
            vis.draw = d3.select('#d3-ants-bestsolution')
                .append('svg')
                .attr('id', 'bestCurrentSolution')
                .attr('width', vis.svg.width)
                .attr('height', vis.svg.height)
                .attr('class', 'nothing')
                .append('g')
                .attr('transform', 'translate(32,' + (vis.svg.height / 2 + ')'));

            vis.scales = {};
            vis.scales.cities = d3.scale.linear()
                .domain([0, nCities])
                .range([0, vis.svg.width]);
            vis.gridSize = Math.floor(vis.svg.width / nCities);
            // vis.scales.yRow = d3.scale.linear()
            //     .domain([0, 40, 80])
            //     .rangeRound([0, 1, 2]);
            return vis;
        }

        function iterateFullSolution() {
            $interval.cancel(solutionIntervalIterator);
            solutionIntervalIterator = $interval(function() {
                if(iterations > 200) {
                    $interval.cancel(solutionIntervalIterator);
                }
                iterate(ants, pheromones, trailgraph);
                drawBestTrail(draw.bestTrail, bestTrail);
                console.log(iterations);
                iterations++;
            }, 1000);
        }

        function drawLoop() {
            drawBestTrail(bestTrailDraw, bestTrail);
        }

        function drawBestTrail(vis, trail) {
            var draw = vis.draw.selectAll('text')
                .data(trail, function (d) {
                    return d;
                });

            draw.enter()
                .append('text')
                .attr('x', function(d, i) {
                    return i * vis.gridSize;
                })
                .style('text-anchor', 'middle')
                // .attr('dy', '.35em')
                .attr('class', 'best-trail-text')
                .text(function(d) {
                    return d;
                });

            draw.transition()
                .duration(500)
                .attr('x', function(d, i) {
                    return i * vis.gridSize;
                })

            draw.exit()
                .remove();
        }

        function iterate(ants, pheromones, trailGraph) {
            var currBestTrail = AntColonyService.FindBestTrail(ants, trailGraph);
            var currBestLength = AntColonyService.TrailLength(currBestTrail, trailGraph)
            AntColonyService.UpdateAnts(ants, pheromones, trailGraph);
            AntColonyService.UpdatePheromones(pheromones, ants, trailGraph);
            if (currBestLength < bestTrailCost()) {
                bestTrail = currBestTrail;
                console.log('New Best Length of ' + bestTrailCost() + ' found at iteration: ' + iterations);
                pushSolution(bestTrail, pheromones);
            }
        }

        function pushSolution(trail, pheromones) {
            vm.solutions.push({
                length: bestTrailCost(),
                iteration: iterations,
                trail: trail,
                pheromones: angular.copy(pheromones)
            });
        };

        function bestTrailCost() {
            return AntColonyService.TrailLength(bestTrail, trailgraph);
        }
    }
}(angular, d3));
