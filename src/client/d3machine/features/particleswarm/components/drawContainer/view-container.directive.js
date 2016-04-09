(function (angular) {
    'use strict';

    angular.module('d3machinelearn.particleSwarm')
        .directive('viewContainer', viewContainer);

    function viewContainer() {
        return {
            require: '^particleSwarmDraw',
            restrict: 'E',
            templateUrl: 'd3machine/features/particleswarm/components/drawContainer/view-container-template.html',
            controller: 'ViewContainerController',
            link: function(scope, element, attrs, particleSwarmDrawController) {
                particleSwarmDrawController.init();
            }
        };
    }
}(angular));
