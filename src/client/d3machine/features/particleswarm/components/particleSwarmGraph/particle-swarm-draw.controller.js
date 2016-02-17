(function(angular, d3, _) {
    'use strict';

    angular.module('d3machinelearn.particleSwarm')
        .controller('particleSwarmDrawController', ParticleSwarmDrawController);

    //@ngInject
    function ParticleSwarmDrawController($interval, SwarmService) {
        var vm = this;
        var solutionIterator;

        vm.init = init;
        vm.initSeedModel = initSeedModel;
        vm.startIteration = startIteration
        vm.junk = 'eqls='
        vm.count = 0;

        function init() {
            vm.count = 0;
            vm.nSwarms = 3;
            vm.nParticles = 4;
            initDrawContainer();
            swarmDrawConfig();
            swarmScales();
        }

        function swarmDrawConfig() {
            vm.draw.swarms = {};
            vm.draw.swarms.draw = vm.draw.svg.draw.append('g')
                .attr('id', 'swarms');
            vm.draw.swarms.draw.radius = 3 ;
        }

        function swarmScales() {
            vm.draw.swarms.scales = {};
            vm.draw.swarms.scales.color = d3.scale.category20();
            vm.draw.swarms.scales.x = d3.scale.linear()
                .domain([SwarmService.min, SwarmService.max])
                .range([0, vm.draw.svg.width]);
            vm.draw.swarms.scales.y = d3.scale.linear()
                .domain([SwarmService.max, SwarmService.min])
                .range([0, vm.draw.svg.height]);
            vm.draw.swarms.scales.cost = d3.scale.linear()
                .domain([0, 100, 1000])
                .range(['green', 'yellow', 'red']);
            vm.draw.swarms.scales.velocityX = d3.scale.linear()
                .domain([SwarmService.min, SwarmService.max])
                .range([-15, 15]);
            vm.draw.swarms.scales.velocityY = d3.scale.linear()
                .domain([SwarmService.max, SwarmService.min])
                .range([-15, 15])
        }

        function initDrawContainer() {
            vm.draw = {};
            vm.draw.svg = {};
            vm.draw.svg.height = 800;
            vm.draw.svg.width = 800;

            vm.draw.svg.draw = d3.select('#d3')
                .append('svg')
                .attr('id', 'particleSwarm')
                .attr('width', vm.draw.svg.width)
                .attr('height', vm.draw.svg.height);
        }

        function initSeedModel() {
            SwarmService.multiSwarm = SwarmService.generateMultiSwarm(vm.nSwarms, vm.nParticles, SwarmService.min, SwarmService.max);
            vm.solution = SwarmService.multiSwarm;
            drawLoop();
        }

        function startIteration() {
            // d3.select("svg").selectAll("*").remove();
            vm.count = 0;
            initSeedModel();
            $interval.cancel(solutionIterator);
            solutionIterator = $interval(function() {
                iterateSolution();
            }, 3000);
        }

        function iterateSolution() {
            vm.count++;
            SwarmService.iterateSolution();
            drawLoop();
        }

        function drawLoop() {
            var drawing = vm.draw.swarms.draw.selectAll('g .swarm')
                .data(SwarmService.multiSwarm.swarms)

            drawing.enter()
                .append('g')
                .attr('class', 'swarm')
                .each(function (d, i) {
                    var bestPositionDraw = d3.select(this)
                        .append('circle')
                        .attr('r', vm.draw.swarms.draw.radius + 2)
                        .attr('cx', function(d, i) {
                            return vm.draw.swarms.scales.x(d.bestPosition.x)
                        })
                        .attr('cy', function(d, i) {
                            return vm.draw.swarms.scales.y(d.bestPosition.y)
                        })
                        .style('fill', function(d) {
                            return vm.draw.swarms.scales.color.range()[i]
                        });
                })
                .append('g')
                .attr('class', 'particles')
                .each(drawParticles);

            drawing.each(drawParticles)
                .each(function(d, i) {
                var bestPositionDraw = d3.select(this)
                    .select('circle')

                bestPositionDraw
                    .filter(function(d) {
                        return d.draw.changed;
                    })
                    .each(function(d) {
                        d.draw.changed = false;
                    })
                    .transition()
                    .attr('cx', function(d) {
                        return vm.draw.swarms.scales.x(d.bestPosition.x);
                    })
                    .attr('cy', function(d) {
                        return vm.draw.swarms.scales.y(d.bestPosition.y);
                    })
                    .delay(2000)
                    .duration(300)
                    .transition()
                    .duration(300)
                    .attr('r', 30)
                    .style('opacity', 0.1)
                    .style('fill', function(d) {
                        return vm.draw.swarms.scales.cost(d.bestCost);
                    })
                    .transition()
                    .duration(10)
                    .attr('r', vm.draw.swarms.draw.radius + 2)
                    .style('opacity', 0.9)
                    .style('fill', function(d) {
                        return vm.draw.swarms.scales.color.range()[i]
                    });
            });

            drawing.exit()
                .remove();
        }

        function drawParticles(swarm, i) {
            var particlesDraw = d3.select(this)
                .select('g')
                .selectAll('circle')
                .data(swarm.particles, function(d) {
                    return d.id;
                });

            var pVelocityDraw = d3.select(this)
                .select('g')
                .selectAll('line')
                .data(swarm.particles, function(d) {
                    return d.id;
                });

            particlesDraw.enter()
                .append('circle')
                .attr('r', vm.draw.swarms.draw.radius)
                .attr('cx', function(d) {
                    return vm.draw.swarms.scales.x(d.position.x);
                })
                .attr('cy', function(d) {
                    return vm.draw.swarms.scales.y(d.position.y);
                })
                .style('fill', function(d) {
                    return vm.draw.swarms.scales.color.range()[i];
                })
                .style('opacity', 0.9);

            pVelocityDraw.enter()
                .append('line')
                .attr('x1', function(d) {
                    return vm.draw.swarms.scales.x(d.position.x);
                })
                .attr('y1', function(d) {
                    return vm.draw.swarms.scales.y(d.position.y);
                })
                .attr('x2', function(d) {
                    return vm.draw.swarms.scales.x(d.position.x);
                })
                .attr('y2', function(d) {
                    return vm.draw.swarms.scales.y(d.position.y);
                })
                .attr('stroke-width', 1)
                .attr('stroke', function(d) {
                    return vm.draw.swarms.scales.color.range()[i];
                })
                .style('opacity', 0.9);

            particlesDraw.transition()
                .attr('cx', function(d) {
                    return vm.draw.swarms.scales.x(d.position.x);
                })
                .attr('cy', function(d) {
                    return vm.draw.swarms.scales.y(d.position.y);
                })
                .style('fill', function(d) {
                    return vm.draw.swarms.scales.color.range()[i];
                })
                .duration(1000)
                .delay(1000);

            particlesDraw.exit()
                .remove();


            pVelocityDraw
                .transition()
                .attr('x1', function(d) {
                    return vm.draw.swarms.scales.x(d.oldPosition.x);
                })
                .attr('y1', function(d) {
                    return vm.draw.swarms.scales.y(d.oldPosition.y);
                })
                .attr('x2', function(d) {
                    return vm.draw.swarms.scales.x(d.position.x);
                })
                .attr('y2', function(d) {
                    return vm.draw.swarms.scales.y(d.position.y);
                })
                .duration(1000)
                .transition()
                .attr('x1', function(d) {
                    return vm.draw.swarms.scales.x(d.position.x);
                })
                .attr('y1', function(d) {
                    return vm.draw.swarms.scales.y(d.position.y);
                })
                .attr('x2', function(d) {
                    return vm.draw.swarms.scales.x(d.position.x);
                })
                .attr('y2', function(d) {
                    return vm.draw.swarms.scales.y(d.position.y)
                })
                .duration(1000)
                .delay(1000);

            pVelocityDraw.exit()
                .remove();
        }
    }
}(angular, d3, _));
