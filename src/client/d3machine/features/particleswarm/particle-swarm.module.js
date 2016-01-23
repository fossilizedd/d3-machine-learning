(function (angular) {
    'use strict';
    angular.module('d3machinelearn.particleSwarm', [
        'ui.router',
        'ui.bootstrap'
    ]).config(config);

    // @ngInject
    function config($stateProvider) {
        $stateProvider.state('app.particleSwarm', {
            url: '/particleswarm',
            templateUrl: 'features/particleswarm/particleswarm.html'
        });
    }
}(angular));
