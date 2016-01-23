(function(angular) {
    'use strict';

    angular.module('d3machinelearn', [
        'ui.router',
        // 'd3machinelearn.core',
        'd3machinelearn.particleSwarm'
    ]).config(config);

    function config($stateProvider, $urlRouterProvider) {
        // $urlRouterProvider.otherwise('/fossilized');

        $stateProvider
            .state('app', {
                url: '/fossilized',
                templateUrl: '../index.html',
                resolve: {
                    called: function() {
                        debugger;
                        return "why";
                    }
                }
            });
    }
})(angular);
