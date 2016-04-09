(function(angular, _) {
    'use strict';

    angular.module('d3machinelearn.antColony')
        .service('AntColonyService', AntColonyService);

    function AntColonyService() {
        var self = this;
        var colony = {
            alpha: 3,
            beta: 2,
            rho: 0.01,
            Q: 2.0
        };

        self.generateAnts = generateAnts;
        self.generateCitiesGraph = generateCitiesGraph;
        self.generatePheromones = generatePheromones;
        self.findBestTrail = findBestTrail;
        self.trailLength = trailLength;
        self.updateAnts = updateAnts;
        self.updatePheromones = updatePheromones;

        //Small
        self.moveProbability = moveProbability;
        self.buildWheelSelection = buildWheelSelection;
        self.nextCity = nextCity;

        function initializeAnt(nCities) {
            var ant = generateAnt();
            var startCity = _.random(0, nCities - 1);
            ant.trail = randomTrail(startCity, nCities);
            return ant;
        }

        function generateAnts(nAnts, nCities) {
            return _.times(nAnts, function() {
                return initializeAnt(nCities);
            });
        }

        function generateAnt() {
            var ant = {
                id: _.uniqueId('ant'),
                trail: []
            };
            return ant;
        }

        function generatePheromones(nCities) {
            var pheromones = {};
            _.times(nCities, function(i) {
                pheromones[i] = {};
                _.times(nCities, function(j) {
                    pheromones[i][j] = 0.01;
                });
            });
            return pheromones;
        }

        function generateCity() {
            var city = {
                travelcost: {}
            };
            return city;
        }

        function generateCitiesGraph(nCities) {
            var citiesGraph = {};
            citiesGraph = _.times(nCities, function() {
                return generateCity();
            });

            _.times(nCities, function(source) {
                _.times(nCities - source - 1, function(destOffset) {
                    var dest = source + destOffset + 1;
                    var distanceCost = _.random(1, 8);
                    citiesGraph[source].travelcost[dest] = distanceCost;
                    citiesGraph[dest].travelcost[source] = distanceCost;
                });
            });
            return citiesGraph;
        }

        function nextCity(rouletteWheelSelection) {
            var pickCity = _.random(0, 1, true);
            // var rouletteWheelSelection = buildWheelSelection(probabilities);
            return _.findIndex(rouletteWheelSelection, function(item, index, wheelSelect) {
                return pickCity >= item && pickCity < wheelSelect[index + 1];
            });
        }

        function buildWheelSelection(probabilities) {
            var rouletteWheelSelection = _.reduce(probabilities, function(probWheel, current, index) {
                probWheel[index + 1] = probWheel[index] + probabilities[index];
                return probWheel;
            }, [0]);
            rouletteWheelSelection[rouletteWheelSelection.length - 1] = 1.00;
            return rouletteWheelSelection;
        }

        function moveProbability(city, visited, pheromones, distances) {
            var nCities = distances.length;
            var taueta = [];
            var sum = 0.0;

            _.times(nCities, function(i) {
                if (i === city) {
                    taueta[i] = 0.0;
                } else if (visited[i] === true) {
                    taueta[i] = 0.0;
                } else {
                    taueta[i] = Math.pow(pheromones[city][i], colony.alpha) * Math.pow((1.0 / distance(city, i, distances)), colony.beta);
                    taueta[i] = _.clamp(taueta[i], 0.0001, (Number.MAX_VALUE / (nCities * 100)));
                }
                sum += taueta[i];
            });

            return _.map(taueta, function(item) {
                return item / sum;
            });
        }

        function updatePheromones(pheromones, ants, distances) {
            var iterations = distances.length;
            _.times(iterations, function(i) {
                _.times(iterations - i - 1, function(k) {
                    var j = i + k + 1;
                    _.forEach(ants, function(ant) {
                        var length = trailLength(ant.trail, distances);
                        var decrease = (1.0 - colony.rho) * pheromones[i][j];
                        var increase = 0.0;
                        var delta;
                        if (edgeInTrail(i, j, ant.trail) === true) {
                            increase = colony.Q / length;
                        }
                        delta = _.clamp(decrease + increase, 0.0001, 100000.0);
                        pheromones[i][j] = delta;
                        pheromones[j][i] = delta;
                    });
                });
            });
        }

        function edgeInTrail(src, dest, trail) {
            var res = false;
            var iSrc = _.findIndex(trail, findInteger(src));
            var iDest = _.findIndex(trail, findInteger(dest));
            if (iSrc + iDest === trail.length - 1) {
                res = true;
            }
            else if(Math.abs(iSrc - iDest) === 1) {
                res = true;
            }
            return res;
        }

        function updateAnts(ants, pheromones, distances) {
            var nCities = distances.length;
            _.forEach(ants, function(ant, index) {
                var start = _.random(nCities - 1);
                ant.trail = buildTrail(start, pheromones, distances);
            });
        }

        function buildTrail(start, pheromones, distances) {
            var nCities = distances.length;
            var pathFinding = {
                trail: [],
                visited: [],
                prev: start
            };
            pathFinding = generatePaths(nCities, pathFinding);
            return pathFinding.trail;

            function generatePaths (count, accumulator) {
                if (count === 0) {
                    return accumulator;
                }
                else {
                    var probabilities = moveProbability(accumulator.prev , accumulator.visited, pheromones, distances);
                    var rouletteWheelSelection = buildWheelSelection(probabilities);
                    var next = nextCity(rouletteWheelSelection);

                    accumulator.prev = next;
                    accumulator.trail.push(next);
                    accumulator.visited[next] = true;
                    return accumulator(count--, accumulator);
                }
            }
        }

        function findBestTrail(ants, costs) {
            var bestAntSearch = {
                cost: trailLength(ants[0].trail, costs),
                index: 0
            };
            bestAntSearch = _.reduce(ants, function(bestAnt, currentAnt, index) {
                var currentCost = trailLength(currentAnt.trail, costs);
                if (currentCost < bestAnt.cost) {
                    bestAnt.cost = currentCost;
                    bestAnt.index = index;
                }
                return bestAnt;
            }, bestAntSearch);

            return angular.copy(ants[bestAntSearch.index].trail);
        }

        function randomTrail(startCity, nCities) {
            var startIndex;
            var temp;
            var trail = _.times(nCities, function(n) {
                return n;
            });

            trail = _.shuffle(trail);
            startIndex = _.findIndex(trail, findInteger(startCity));
            temp = trail[0];
            trail[0] = startIndex;
            trail[startIndex] = temp;
            return trail;
        }

        function trailLength(trail, costs) {
            return _.reduce(trail, function(prev, curr, index, array) {
                if (index + 1 < array.length) {
                    prev += distance(curr, array[index + 1 ], costs);
                }
                return prev;
            }, 0.0);
        }

        function distance(start, end, distances) {
            return distances[start].travelcost[end];
        }

        function findInteger(target) {
            return function(item) {
                return item === target;
            };
        }
    }
}(angular, _));
