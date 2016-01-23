(function (angular) {
    'use strict';

    angular.module('d3machinelearn.particleSwarm')
        .directive('viewContainer', viewContainer);

    function viewContainer($interval) {
        return {
            require: '^particleSwarmDraw',
            restrict: 'E',
            templateUrl: 'features/particleswarm/components/drawContainer/view-container-template.html',
            controller: 'ViewContainerController',
            controllerAs: 'vm',
            bindToController: true,
            link: function(scope, element, attrs, particleSwarmDrawController) {
                particleSwarmDrawController.init();
                particleSwarmDrawController.initSeedModel();
                scope.vm.iterateSolution = particleSwarmDrawController.iterateSolution;
                scope.vm.solution = particleSwarmDrawController.solution;
                scope.vm.count = 0;

                $interval(function() {
                    scope.vm.iterateSolution();
                    scope.vm.count++;
                }, 2000);
            }
        };
    }
}(angular));
