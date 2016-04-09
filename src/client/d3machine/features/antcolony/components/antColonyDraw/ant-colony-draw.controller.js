(function(angular, d3, _) {
    'use strict';

    angular.module('d3machinelearn.antColony')
        .controller('antColonyDrawController', AntColonyDrawController);

        // @ngInject
    function AntColonyDrawController($interval, $timeout, AntColonyService){
        var vm = this;
        var nCities;
        var nAnts;
        var bestTrail;
        var iterations;
        var solutions = [];
        var ants;
        var trailgraph;
        var pheromones;
        var pheromonesStates = [];
        var draw = {};

        var player = {};

        // Playing best trail
        var idxPlaySolution = 0;
        vm.solutionIteration = undefined;
        vm.solutionLength = undefined;
        vm.solutionFinished = false;
        vm.playSolution = playSolution;

        // Playing pheromone History
        var idxPlayPheromone = 0;
        vm.playPheromones = playPheromones;

        vm.nCities = nCities;
        vm.nAnts = nAnts;
        vm.solutions = solutions;


        nAnts = 4;
        nCities = 60;

        runSolution();

        init(nAnts, nCities);
        initDrawing();
        // iterateFull(ants, pheromones, trailgraph);

        function init(nAnts, nCities) {
            ants = AntColonyService.generateAnts(nAnts, nCities);
            trailgraph = AntColonyService.generateCitiesGraph(nCities);
            pheromones = AntColonyService.generatePheromones(nCities);
            bestTrail = ants[0].trail;
            iterations = 0;
            solutions = [];
            pushSolution(bestTrail, pheromones);
        }

        function initDrawing() {
            draw.bestTrail = initbestTrailDrawing();
            draw.pheromones = initPheromoneDrawing();
        }

        function initPheromoneDrawing() {
            var vis = {};
            vis.svg = {};
            vis.svg.height = 800;
            vis.svg.width = 800;
            vis.draw = d3.select('#d3-ants-pheromones')
                .append('svg')
                .attr('id', 'pheromoneTraversal')
                .attr('width', vis.svg.width)
                .attr('height', vis.svg.height)
                .attr('class', 'd3-bordered-center')
                .append('g');

            vis.scales = {};
            vis.scales.row = d3.scale.linear()
                .domain([0, nCities])
                .range([0, vis.svg.height]);
            vis.scales.column = d3.scale.linear()
                .domain([0, nCities])
                .range([0, vis.svg.width]);

            vis.rect = {};
            vis.rect.roundcorners = 2;
            vis.rect.size = vis.svg.height / nCities;
            // vis.rect.color = d3.scale.linear()
            //     .domain([0.001, 0.1, 0.5])
            //     .range(['#FFFFFF', '#808080', '#000000']);

            vis.rect.color = d3.scale.linear()
                .domain([0.005, 0.15, 1.5])
                .range(['#FFFFFF', '#808080', '#000000']);

            // vis.rect.color = d3.scale.linear()
            //     .domain([0.001, 2.0])
            //     .range(['#FFFFFF', '#000000']);

            return vis;
        }

        function initbestTrailDrawing() {
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
            return vis;
        }



        function runSolution() {
            $timeout(iterateFullSolution, 500);
        }

        function playSolution() {
            idxPlaySolution = 0;
            player.best = $interval(function () {
                if (idxPlaySolution > vm.solutions.length) {
                    $interval.cancel(player.best);
                }
                var solution = vm.solutions[idxPlaySolution];
                drawBestTrail(draw.bestTrail, solution.trail);
                vm.solutionIteration = solution.iteration;
                vm.solutionLength = solution.length;
                idxPlaySolution++;
            }, 5000);
        }

        function playPheromones() {
            idxPlayPheromone = 0;
            player.pheromones = $interval(function () {
                if (idxPlayPheromone >= 199) {
                    $interval.cancel(player.pheromones);
                }
                var pheromoneState = pheromonesStates[idxPlayPheromone];
                vm.pheromoneState = pheromoneState;
                vm.playPheromoneIteration = idxPlayPheromone;
                drawPheromones(draw.pheromones, pheromoneState);
                idxPlayPheromone++;
            }, 500);
        }

        // function playAntTrailBuild() {
        //     var iAnt = 0;
        //     var iTrail = 0;
        //     idxPlayAntTrail = 0;
        //     player.antTrailBuild = $interval(function {
        //         if (currentTrailDecision < antTrail[iAnt].trail[iTrail].length) {
        //
        //         }
        //         drawTrailBuilding(draw.trailBuild, antTrail[iAnt].trail[iTrail])
        //         idxPlayAntTrail++;
        //     }, 2000)
        // }

        function iterateFullSolution() {
            while (iterations < 200) {
                iterate(ants, pheromones, trailgraph);
                iterations++;
            }
            vm.solutionFinished = true;
            console.log('done');
        }

        function drawPheromones(vis, pheromones) {
            var draw = vis.draw.selectAll('g')
                .data(pheromones);

            draw.enter()
                .append('g')
                .each(drawPheromonesRow);

            draw.each(drawPheromonesRow);

            function drawPheromonesRow(row, y) {
                var max = _.max(row);
                var min = _.min(row);
                var rowScale = d3.scale.linear()
                    .domain([min, max])
                    .range(['#FFFFFF', '#4682B4']);
                    // .range(['#0000FF', '#FF0000']);




                var rowDraw = d3.select(this)
                    .selectAll('rect')
                    .data(row);

                rowDraw.enter()
                    .append("rect")
                    .attr("x", function(d, x) {
                        return vis.scales.column(x);
                    })
                    .attr("y", function() {
                        return vis.scales.row(y);
                    })
                    .attr("rx", vis.rect.roundcorners)
                    .attr("ry", vis.rect.roundcorners)
                    .attr("width", vis.rect.size)
                    .attr("height", vis.rect.size)
                    .style("fill", function(d) {
                        return rowScale(d);
                        // return vis.rect.color(d);
                    });

                rowDraw.transition(1000)
                  .style("fill", function(d) {
                    //   debugger;
                    //   console.log('d: ' + d);
                    //   console.log('fill: ' + vis.rect.color(d));
                    //   return vis.rect.color(d);
                    return rowScale(d);
                  });
            }
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
                .attr('class', 'best-trail-text')
                .text(function(d) {
                    return d;
                });

            draw.transition()
                .duration(4000)
                .attr('x', function(d, i) {
                    return i * vis.gridSize;
                });

            draw.exit()
                .remove();
        }

        function iterate(ants, pheromones, trailGraph) {
            var currBestTrail = AntColonyService.findBestTrail(ants, trailGraph);
            var currBestLength = AntColonyService.trailLength(currBestTrail, trailGraph)
            AntColonyService.updateAnts(ants, pheromones, trailGraph);
            AntColonyService.updatePheromones(pheromones, ants, trailGraph);
            pheromonesStates.push(getPheromoneState(angular.copy(pheromones)));
            if (currBestLength < bestTrailCost()) {
                bestTrail = currBestTrail;
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
        }

        function getPheromoneState(pheromoneState) {
            return _(_.values(pheromoneState))
                .map(function(item) {
                    return _.values(item);
                })
                .value();
        }

        function bestTrailCost() {
            return AntColonyService.trailLength(bestTrail, trailgraph);
        }
    }
}(angular, d3, _));
