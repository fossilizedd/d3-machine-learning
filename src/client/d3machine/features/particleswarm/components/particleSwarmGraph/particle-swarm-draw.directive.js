(function (angular) {
    'use strict';

    angular.module('d3machinelearn.particleSwarm')
        .directive('particleSwarmDraw', particleSwarmDraw);

    function particleSwarmDraw() {
        return {
            restrict: 'E',
            controller: 'particleSwarmDrawController',
            controllerAs: 'vm',
            bindToController: true,
            transclude: true,
            templateUrl: 'features/particleswarm/components/particleSwarmGraph/particle-swarm-draw.html'
        };
    }
}(angular));
