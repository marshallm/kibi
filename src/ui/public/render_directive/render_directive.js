import { isPlainObject } from 'lodash';
import uiModules from 'ui/modules';
import applyScopeBindingsProvider from './apply_scope_bindings';

/**
 * The <render-directive> directive is useful for programaticaly modifying or
 * extending a view. It allows defining the majority of the directives behavior
 * using a "definition" object, which the implementer can obtain from plugins (for instance).
 *
 * The definition object supports the parts of a directive definition that are
 * easy enough to implement without having to hack angular, and does it's best to
 * make sure standard directive life-cycle timing is respected.
 *
 * @param [Object] definition - the external configuration for this directive to assume
 * @param [Function] definition.controller - a constructor used to create the controller for this directive
 * @param [String] definition.controllerAs - a name where the controller should be stored on scope
 * @param [Object] definition.scope - an object defining the binding properties for values read from
 *                                  attributes and bound to $scope. The keys of this object are the
 *                                  local names of $scope properties, and the values are a combination
 *                                  of the binding style (=, @, or &) and the external attribute name.
 *                                  See [the Angular docs]
 *                                  (https://code.angularjs.org/1.4.9/docs/api/ng/service/$compile#-scope-)
 *                                  for more info
 * @param [Object|Function] definition.link - either a post link function or an object with pre and/or
 *                                          post link functions.
 */
uiModules
.get('kibana')
.directive('renderDirective', function (Private) {
  const applyScopeBindings = Private(applyScopeBindingsProvider);

  return {
    restrict: 'E',
    scope: {
      'definition': '='
    },
    template: function ($el) {
      return $el.html();
    },
    controller: function ($scope, $element, $attrs, $transclude, $injector) {
      if (!$scope.definition) throw new Error('render-directive must have a definition attribute');

      const { controller, controllerAs, scope } = $scope.definition;

      applyScopeBindings(scope, $scope, $attrs);

      if (controller) {
        if (controllerAs) {
          $scope[controllerAs] = this;
        }

        const locals = { $scope, $element, $attrs, $transclude };
        const controllerInstance = $injector.invoke(controller, this, locals) || this;

        if (controllerAs) {
          $scope[controllerAs] = controllerInstance;
        }
      }
    },
    link: {
      pre($scope, $el, $attrs, controller) {
        const { link } = $scope.definition;
        const preLink = isPlainObject(link) ? link.pre : null;
        if (preLink) preLink($scope, $el, $attrs, controller);
      },
      post($scope, $el, $attrs, controller) {
        const { link } = $scope.definition;
        const postLink = isPlainObject(link) ? link.post : link;
        if (postLink) postLink($scope, $el, $attrs, controller);
      },
    }
  };
});
