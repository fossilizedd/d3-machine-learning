(function(angular) {
    'use strict';

    angular.module('d3machinelearn', [
        'ui.router',
        'd3machinelearn.core',
        'd3machinelearn.particleswarm'
    ]).config(config);

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/machine');

        $stateProvider
            .state('app', {
                url: '^/fossilized',
                templateUrl: '../index.html'
            });
    }
})(angular);
