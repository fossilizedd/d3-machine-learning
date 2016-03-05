(function(angular, d3, _) {
    'use strict';

    angular.module('d3machinelearn.particleSwarm')
        .controller('particleSwarmDrawController', ParticleSwarmDrawController);

    //@ngInject
    function ParticleSwarmDrawController($interval, SwarmService) {
        var vm = this;
        var solutionIterator;
        var solution;
        var draw;

        vm.init = init;
        vm.initSeedModel = initSeedModel;
        vm.start = start;
        vm.count = 0;
        vm.bestCost = {};
        vm.bestPosition = {};

        function init() {
            vm.count = 0;
            vm.nSwarms = 3;
            vm.nParticles = 4;
            vm.immigrateRate = 0.005;
            vm.deathRate = 0.005;
            SwarmService.environment.max = 100;
            SwarmService.environment.min = -100;
            initDrawing();
        }

        function initDrawing() {
            initDrawContainer();
            swarmDrawConfig();
            swarmScales();
        }

        function swarmDrawConfig() {
            draw.swarms = {};
            draw.swarms.draw = draw.svg.draw.append('g')
                .attr('id', 'swarms');
            draw.swarms.solution = draw.svg.draw.append('g')
                .attr('id', 'solutions');
            draw.swarms.draw.radius = 3 ;
        }

        function swarmScales() {
            draw.swarms.scales = {};
            draw.swarms.scales.color = d3.scale.category10();
            draw.swarms.scales.x = d3.scale.linear()
                .domain([SwarmService.environment.min, SwarmService.environment.max])
                .range([0, draw.svg.width]);
            draw.swarms.scales.y = d3.scale.linear()
                .domain([SwarmService.environment.max, SwarmService.environment.min])
                .range([0, draw.svg.height]);
            draw.swarms.scales.cost = d3.scale.linear()
                .domain([0, 100, 1000])
                .range(['#000000', '#D3D3D3', '#EEEEEE']);
            draw.swarms.scales.velocityX = d3.scale.linear()
                .domain([SwarmService.environment.min, SwarmService.environment.max])
                .range([-15, 15]);
            draw.swarms.scales.velocityY = d3.scale.linear()
                .domain([SwarmService.environment.max, SwarmService.environment.min])
                .range([-15, 15])
        }

        function initDrawContainer() {
            draw = {};
            draw.svg = {};
            draw.svg.height = 800;
            draw.svg.width = 800;

            draw.svg.draw = d3.select('#d3')
                .append('svg')
                .attr('id', 'particleSwarm')
                .attr('class', 'multiSwarm')
                .attr('width', draw.svg.width)
                .attr('height', draw.svg.height);
        }

        function initSeedModel() {
            solution = SwarmService.generateMultiSwarm(vm.nSwarms, vm.nParticles, SwarmService.environment.min, SwarmService.environment.max);
            SwarmService.environment.deathRate = vm.deathRate;
            SwarmService.environment.immigrateRate = vm.immigrateRate;
            drawLoop();
        }

        function start() {
            vm.count = 0;
            initSeedModel();
            vm.solution = solution;
            $interval.cancel(solutionIterator);
            solutionIterator = $interval(function() {
                iterateSolution(solution);
            }, 3000);
        }

        function iterateSolution(solution) {
            SwarmService.iterateSolution(solution);
            drawLoop();
            vm.count++;
        }

        function drawLoop() {
            var drawing = draw.swarms.draw.selectAll('g .swarm')
                .data(solution.swarms)

            drawing.enter()
                .append('g')
                .attr('class', 'swarm')
                .each(function (d, i) {
                    var bestPositionDraw = d3.select(this)
                        .append('circle')
                        .attr('r', draw.swarms.draw.radius + 2)
                        .attr('cx', function(d, i) {
                            return draw.swarms.scales.x(d.bestPosition.x);
                        })
                        .attr('cy', function(d, i) {
                            return draw.swarms.scales.y(d.bestPosition.y);
                        })
                        .style('fill', function(d) {
                            return draw.swarms.scales.color(i);
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
                        return draw.swarms.scales.x(d.bestPosition.x);
                    })
                    .attr('cy', function(d) {
                        return draw.swarms.scales.y(d.bestPosition.y);
                    })
                    .delay(2000)
                    .duration(300)
                    .transition()
                    .duration(300)
                    .attr('r', 30)
                    .style('opacity', 0.1)
                    .style('fill', function(d) {
                        return draw.swarms.scales.cost(d.bestCost);
                    })
                    .transition()
                    .duration(10)
                    .attr('r', draw.swarms.draw.radius + 2)
                    .style('opacity', 0.9)
                    .style('fill', function(d) {
                        return draw.swarms.scales.color(i);
                    });
            });

            drawing.exit()
                .remove();
        }

        function drawParticles(swarm, i) {
            // drawLastSolution(swarm.particles);

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
                .attr('r', draw.swarms.draw.radius)
                .attr('cx', function(d) {
                    return draw.swarms.scales.x(d.position.x);
                })
                .attr('cy', function(d) {
                    return draw.swarms.scales.y(d.position.y);
                })
                .style('fill', function(d) {
                    return draw.swarms.scales.color(i);
                })
                .style('opacity', 0.9);

            pVelocityDraw.enter()
                .append('line')
                .attr('x1', function(d) {
                    return draw.swarms.scales.x(d.position.x);
                })
                .attr('y1', function(d) {
                    return draw.swarms.scales.y(d.position.y);
                })
                .attr('x2', function(d) {
                    return draw.swarms.scales.x(d.position.x);
                })
                .attr('y2', function(d) {
                    return draw.swarms.scales.y(d.position.y);
                })
                .attr('stroke-width', 1)
                .attr('stroke', function(d) {
                    return draw.swarms.scales.color(i);
                })
                .style('opacity', 0.9);


            particlesDraw.transition()
                .attr('cx', function(d) {
                    return draw.swarms.scales.x(d.position.x);
                })
                .attr('cy', function(d) {
                    return draw.swarms.scales.y(d.position.y);
                })
                .style('fill', function(d) {
                    return draw.swarms.scales.color(i);
                })
                .duration(1000)
                .delay(1000);

            particlesDraw.exit()
                .remove();

            pVelocityDraw
                .transition()
                .attr('x1', function(d) {
                    return draw.swarms.scales.x(d.oldPosition.x);
                })
                .attr('y1', function(d) {
                    return draw.swarms.scales.y(d.oldPosition.y);
                })
                .attr('x2', function(d) {
                    return draw.swarms.scales.x(d.position.x);
                })
                .attr('y2', function(d) {
                    return draw.swarms.scales.y(d.position.y);
                })
                .duration(1000)
                .transition()
                .attr('x1', function(d) {
                    return draw.swarms.scales.x(d.position.x);
                })
                .attr('y1', function(d) {
                    return draw.swarms.scales.y(d.position.y);
                })
                .attr('x2', function(d) {
                    return draw.swarms.scales.x(d.position.x);
                })
                .attr('y2', function(d) {
                    return draw.swarms.scales.y(d.position.y)
                })
                .duration(1000)
                .delay(1000);

            pVelocityDraw.exit()
                .remove();
        }

        function drawLastSolution(particles) {
            _.forEach(particles, function(particle) {
                draw.swarms.solution.append('circle')
                .attr('cx', draw.swarms.scales.x(particle.oldPosition.x))
                .attr('cy', draw.swarms.scales.y(particle.oldPosition.y))
                .attr('r', draw.swarms.draw.radius + 1)
                .style('fill', draw.swarms.scales.cost(particle.cost))
                .style('opacity', 0.2);
            })
        }
    }
}(angular, d3, _));
