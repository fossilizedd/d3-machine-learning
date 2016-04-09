(function(angular, _) {
    'use strict';
    angular.module('d3machinelearn.particleSwarm')
        .service('SwarmService', SwarmService);

    function SwarmService() {
        var self = this;
        var nSwarms = 0;
        var nParticles = 0;
        var environment = {
            inertia: 0.729,
            cognitiveP: 1.49445,
            socialS: 1.49445,
            multiSwarmGlobal: 0.3645
        };

        self.environment = environment;
        self.generateSwarm = generateSwarm;
        self.generateMultiSwarm = generateMultiSwarm;
        self.iterateSolution = iterateSolution;

        function generateMultiSwarm(initNSwarms, initNParticles, min, max) {
            var multiSwarm = {};
            nSwarms = initNSwarms;
            nParticles = initNParticles;
            multiSwarm.bestCost = 1000000000.0;
            multiSwarm.bestPosition = {
                x: 0,
                y: 0
            };
            multiSwarm.swarms = [];

            for(var i = 0; i < nSwarms; i++) {
                var swarm = generateSwarm(nParticles, min, max);
                multiSwarm.swarms.push(swarm);
                if(swarm.bestCost < multiSwarm.bestCost) {
                    multiSwarm.bestCost = swarm.bestCost;
                    angular.copy(swarm.bestPosition, multiSwarm.bestPosition);
                }
            }

            return multiSwarm;
        }

        function generateSwarm(nParticles, min, max) {
            var swarm = {};
            swarm.bestCost = 100000000000.0;
            swarm.bestPosition = {
                x: 0,
                y: 0
            };
            swarm.bestPosition = {};
            swarm.particles = [];
            swarm.draw = {};

            for(var i = 0; i < nParticles; i++) {
                var particle = generateParticle(min, max);
                swarm.particles.push(particle);
                if(particle.cost < swarm.bestCost) {
                    swarm.bestCost = particle.cost;
                    angular.copy(particle.position, swarm.bestPosition);
                }
            }
            return swarm;
        }

        function generateParticle(min, max) {
            var particle = {};
            particle.velocity = {
                x: randomNumber(max - min) + min,
                y: randomNumber(max - min) + min
            };
            particle.position = {
                x: randomNumber(max - min) + min,
                y: randomNumber(max - min) + min
            };

            particle.id = _.uniqueId('particle_');

            particle.oldPosition = {x: particle.position.x, y: particle.position.y};

            particle.cost = fCost(particle.position);
            particle.bestCost = particle.cost;
            particle.bestPosition = {};
            angular.copy(particle.position, particle.bestPosition);
            return particle;
        }

        function fCost(point) {
            var result = 0.0;
            result += (point.x * point.x) - (10 * Math.cos(2 * Math.PI * point.x)) + 10;
            result += (point.y * point.y) - (10 * Math.cos(2 * Math.PI * point.y)) + 10;
            return result;
        }

        function iterateSolution(multiSwarm) {
            _.forEach(multiSwarm.swarms, function(swarm) {
                iterateSwarm(swarm, multiSwarm);
            });
        }

        function iterateSwarm(swarm, multiSwarm) {
            _.forEach(swarm.particles, function(particle, index, collection) {
                iterateParticle(particle, index, collection, swarm, multiSwarm);
            });
        }

        function iterateParticle(p, index, collection, swarm, multiSwarm) {
            var isDead = randomNumber(1);
            var isImmigrant = randomNumber(1);

            if (isDead < environment.deathRate) {
                collection[index] = generateParticle(environment.min, environment.max);
            }

            if (isImmigrant < environment.immigrateRate) {
                particleSwap(p, index, collection, multiSwarm);
            }

            updateVelocity(p, swarm, multiSwarm);
            updatePosition(p);
            p.cost = fCost(p.position);

            if (p.cost < p.bestCost) {
                p.bestCost = p.cost;
                angular.copy(p.position, p.bestPosition);
            }

            if (p.cost < swarm.bestCost) {
                swarm.bestCost = p.cost;
                swarm.draw.changed = true;
                angular.copy(p.position, swarm.bestPosition);
            }

            if (p.cost < multiSwarm.bestCost) {
                multiSwarm.bestCost = p.cost;
                angular.copy(p.position, multiSwarm.bestPosition);
            }
        }

        function updateVelocity(particle, swarm, multiSwarm) {
            particle.velocity.x = updateVelocityVector(particle.velocity.x, particle.position.x, particle.bestPosition.x, swarm.bestPosition.x, multiSwarm.bestPosition.x);
            particle.velocity.y = updateVelocityVector(particle.velocity.y, particle.position.y, particle.bestPosition.y, swarm.bestPosition.y, multiSwarm.bestPosition.y);
        }

        function updatePosition(particle) {
            particle.oldPosition.x = particle.position.x;
            particle.oldPosition.y = particle.position.y;
            particle.position.x += particle.velocity.x;
            particle.position.y += particle.velocity.y;
        }

        function updateVelocityVector(velocity, pPosition, pBestPosition, sPosition, msBestPosition) {
            var r1 = randomNumber(1);
            var r2 = randomNumber(1);
            var r3 = randomNumber(1);

            var result = (environment.inertia * velocity)
            + (environment.cognitiveP * r1 * (pBestPosition - pPosition))
            + (environment.socialS * r2 * (sPosition - pPosition))
            + (environment.multiSwarmGlobal * r3 * (msBestPosition - pPosition));

            if (result > environment.max) {
                result = environment.max;
            } else if (result < environment.min) {
                result = environment.min;
            }
            return result;
        }

        function particleSwap(particle, index, collection, multiSwarm) {
            var selectSwarm = Math.floor(randomNumber(nSwarms));
            var selectParticle = Math.floor(randomNumber(nParticles));
            var temp = {};
            // var source = particle;
            // var target = multiSwarm.swarms[selectSwarm].particles[selectParticle];

            // if (source !== target) {
            //     source = _.remove(collection, function(item){
            //         return item.id = source.id;
            //     });
            //     target = _.remove(collection, function() {
            //         return item.id = target.id;
            //     });
            //     collection.push(target);
            //     multiSwarm.swarms[selectSwarm].particles.push(source);
            // }
            if (particle !== multiSwarm.swarms[selectSwarm].particles[selectParticle]) {
                angular.copy(particle, temp);
                angular.copy(multiSwarm.swarms[selectSwarm].particles[selectParticle], particle);
                angular.copy(temp, multiSwarm.swarms[selectSwarm].particles[selectParticle]);
            } else {
                particleSwap(particle);
            }
        }

        function randomNumber(magnitude) {
            return Math.random() * magnitude;
        }
    }
}(angular, _));
