(function(angular) {
    'use strict';

    angular.module('d3machinelearn', [
        'ui.router',
        'd3machinelearn.core',
        'd3machinelearn.particleSwarm',
        'd3machinelearn.antColony'
    ]).config(config);

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/fossilized');

        $stateProvider
            .state('app', {
                url: '/fossilized',
                template: '<ui-view> </ui-view>'
            })
            .state('app.home', {
                url: '/home',
                templateUrl: 'd3machine/home.html'
            });
    }
})(angular);
