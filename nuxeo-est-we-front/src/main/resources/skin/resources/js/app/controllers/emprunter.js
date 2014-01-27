'use strict';

angular.module('nuxeoBibliothequeFrontApp')
    .controller('EmprunterCtrl', function ($scope) {
        var idSize = 5;

        $scope.isIdValide = function () {
            if ($scope.docRef) {
                return $scope.docRef.length == idSize;
            }
            return false;
        }

        $scope.getCurrentDocument = function () {
            if (!$scope.isIdValide()) {
                return null;
            }
            if ($scope.docRef === "12345") {
                return {docRef: '12345', jaquette: 'images/jaquette.png', description: 'Dans le cadre de la reprise de données de MAAF, il était nécessaire de reprendre les fichiers HTML. Certains\
                    de ces fichiers HTML à importer avait été produits par Microsoft WORD et étaient frottement non conforme à\
                    la norme html. \
                    L\'objectif de cette conférence téléphonique était de "réparer" ces fichier HTML afin de pouvoir les \
                introduire dans le parser XML de l\'importer Nuxeo.' };
            }
            if ($scope.docRef === "12346") {
                return {docRef: '12346', jaquette: 'images/jaquette2.png', description: 'aaa aa askjds sdkjfbsd fksdjf skdf sdfskdjf sdkf sdfksd fkjsd fskdf sdjkf sdjf sdjfbskdjf skdjf skdj fskdjf skjdfksjd fkjsdf ksjdf' };
            }
            return null;
        }

        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];
    });
