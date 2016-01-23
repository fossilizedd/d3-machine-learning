(function(angular, _) {
    'use strict';
    angular.module('d3machinelearn.particleSwarm')
        .service('SwarmService', SwarmService);

    function SwarmService() {
        var self = this;

        self.swarm = {};
        self.multiSwarm = {};
        self.death = 0.005;
        self.immigrate = 0.005;
        self.inertia = 0.729;
        self.cognitiveP = 1.49445;
        self.socialS = 1.49445;
        self.multiSwarmGlobal = 0.3645;
        self.max = 100;
        self.min = -100;
        self.nSwarms = 3;
        self.nParticles = 5;

        self.generateSwarm = generateSwarm;
        self.generateMultiSwarm = generateMultiSwarm;
        self.iterateSolution = iterateSolution;

        // Solution
        self.solution = {
            x: 0,
            y: 0
        };

        function generateMultiSwarm(nSwarms, nParticles, min, max) {
            var multiSwarm = {};
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

        function iterateSolution() {
            _.forEach(self.multiSwarm.swarms, iterateSwarm);
        }

        function iterateSwarm(swarm) {
            _.forEach(swarm.particles, iterateParticle, swarm);
        }

        function iterateParticle(n, index, collection) {
            var isDead = randomNumber(1);
            var isImmigrant = randomNumber(1);
            var swarm = this;

            if (isDead < self.death) {
                collection[index] = generateParticle(self.min, self.max);
            }

            if(isImmigrant < self.immigrate) {
                particleSwap(n);
            }

            updateVelocity(n, swarm, self.multiSwarm);
            updatePosition(n);
            n.cost = fCost(n.position);

            if (n.cost < n.bestCost) {
                n.bestCost = n.cost;
                angular.copy(n.position, n.bestPosition);
            }

            if (n.cost < swarm.bestCost) {
                swarm.bestCost = n.cost;
                swarm.draw.changed = true;
                angular.copy(n.position, swarm.bestPosition);
            }

            if (n.cost < self.multiSwarm.bestCost) {
                self.multiSwarm.bestCost = n.cost;
                angular.copy(n.position, self.multiSwarm.bestPosition);
            }
        }

        function updateVelocity(particle, swarm, multiSwarm) {
            particle.velocity.x = updateVelocityVector(particle.velocity.x, particle.position.x, particle.bestPosition.x, swarm.bestPosition.x, multiSwarm.bestPosition.x);
            particle.velocity.y = updateVelocityVector(particle.velocity.y, particle.position.y, particle.bestPosition.y, swarm.bestPosition.y, multiSwarm.bestPosition.y);
        }

        function updatePosition(particle) {
            particle.position.x += particle.velocity.x;
            particle.position.y += particle.velocity.y;
        }

        function updateVelocityVector(velocity, pPosition, pBestPosition, sPosition, msBestPosition) {
            var r1 = randomNumber(1);
            var r2 = randomNumber(1);
            var r3 = randomNumber(1);

            var result = (self.inertia * velocity)
            + (self.cognitiveP * r1 * (pBestPosition - pPosition))
            + (self.socialS * r2 * (sPosition - pPosition));
            + (self.multiSwarmGlobal * r3 * (msBestPosition - pPosition));

            if (result > self.max) {
                result = self.max;
            } else if (result < self.min) {
                result = self.min;
            }
            return result;
        }

        function particleSwap(particle) {
            var selectSwarm = Math.floor(randomNumber(self.nSwarms));
            var selectParticle = Math.floor(randomNumber(self.nParticles));
            var temp = {};

            if (particle !== self.multiSwarm.swarms[selectSwarm].particles[selectParticle]) {
                angular.copy(particle, temp);
                angular.copy(self.multiSwarm.swarms[selectSwarm].particles[selectParticle], particle);
                angular.copy(temp, self.multiSwarm.swarms[selectSwarm].particles[selectParticle]);
            }
            else {
                particleSwap(particle);
            }
        }

        function randomNumber(magnitude) {
            return Math.random() * magnitude;
        }
    }
}(angular, _));
