(function (angular) {
    'use strict';
    angular.module('d3machinelearn.antColony', [
        'ui.router',
        'ui.bootstrap'
    ]).config(config);

    // @ngInject
    function config($stateProvider) {
        $stateProvider.state('app.antColony', {
            url: '/antcolony',
            templateUrl: 'd3machine/features/antcolony/ant-colony.html'
        });
    }
}(angular));
