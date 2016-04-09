(function (angular) {
    'use strict';

    angular.module('d3machinelearn.antColony')
        .directive('antColonyDraw', antColonyDraw);

    function antColonyDraw() {
        return {
            restrict: 'E',
            controller: 'antColonyDrawController',
            controllerAs: 'vm',
            bindToController: true,
            templateUrl: 'd3machine/features/antcolony/components/antColonyDraw/ant-colony-draw.html',
            link: function(scope, attrs) {
            }
        };
    }
}(angular));
