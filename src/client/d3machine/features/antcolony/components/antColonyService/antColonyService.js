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

        self.GenerateAnts = generateAnts;
        self.GenerateCitiesGraph = generateCitiesGraph;
        self.GeneratePheromones = generatePheromones;
        self.FindBestTrail = findBestTrail;
        self.TrailLength = trailLength;
        self.UpdateAnts = updateAnts;
        self.UpdatePheromones = updatePheromones;

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
            var citiesGraph = {}
            var i, j;
            var distanceCost;
            var maxRange = 9;
            var minRange = 1;
            citiesGraph = _.times(nCities, function() {
                return generateCity()
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

        function nextCity(ant, city, visited, pheromones, distances) {
            var probabilities = moveProbability(ant, city, visited, pheromones, distances);
            var pickCity;
            var rouletteWheelSelection = _.reduce(probabilities, function(probWheel, current, index, collection) {
                probWheel[index + 1] = probWheel[index] + probabilities[index];
                return probWheel;
            }, [0]);
            rouletteWheelSelection[rouletteWheelSelection.length - 1] = 1.00;
            pickCity = _.random(0, 1 ,true);
            return _.findIndex(rouletteWheelSelection, function(item, index, wheelSelect) {
                return pickCity >= item && pickCity < wheelSelect[index + 1];
            });
        }

        function moveProbability(ant, city, visited, pheromones, distances) {
            var nCities = distances.length;
            var taueta = [];
            var sum = 0.0;

            _.times(nCities, function(i) {
                if (i == city) {
                    taueta[i] = 0.0;
                } else if (visited[i] == true) {
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
                        if (edgeInTrail(i, j, ant.trail) == true) {
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
            if (iSrc + iDest == trail.length - 1) {
                res = true;
            }
            else if(Math.abs(iSrc - iDest) == 1) {
                res = true;
            }
            return res;
        }

        function updateAnts(ants, pheromones, distances) {
            var nCities = distances.length;
            _.forEach(ants, function(ant, index) {
                var start = _.random(nCities -1);
                ant.trail = buildTrail(index, start, pheromones, distances);
            });
        }

        function buildTrail(iAnt, start, pheromones, distances) {
            var nCities = distances.length;
            var pathFinding = {
                trail: [],
                visited: [],
                prev: null
            };

            pathFinding = _.reduce(_.range(nCities), function(accum, current) {
                var next;
                if (accum.prev === null) {
                    next = start;
                } else {
                    next = nextCity(iAnt, accum.prev, accum.visited, pheromones, distances);
                }
                accum.prev = next;
                accum.trail.push(next);
                accum.visited[next] = true;
                return accum;
            }, pathFinding);

            return pathFinding.trail;
        }


        function findBestTrail(ants, costs) {
            var bestAntSearch = {
                cost: trailLength(ants[0].trail, costs),
                index: 0
            };
            var bestAntSearch = _.reduce(ants, function(bestAnt, currentAnt, index) {
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
                return item == target;
            };
        }
    }
}(angular, _));
