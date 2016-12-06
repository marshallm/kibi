define(function (require) {
  const $ = require('jquery');

  require('ui/kibi/directives/kibi_menu_template.less');
  require('ui/modules').get('app/dashboard')
  .directive('kibiMenuTemplate', function ($rootScope, $timeout, $window, $compile, $document) {
    const link = function ($scope, $el) {
      $scope.data = {
        showMenu: false,
        delay: $scope.kibiMenuTemplateHideDelay || 250
      };

      const getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      const container = $('<div class="kibi-menu-template" id="kibi-menu-template-' + getRandomInt(0, Number.MAX_SAFE_INTEGER) + '"/>');
      $('body').append(container);
      const compiled = $compile($scope.kibiMenuTemplate)($scope);
      container.append(compiled);

      const updatePosition = function () {
        const offset = $el.offset();
        let left = offset.left;
        if ($scope.kibiMenuTemplateLeftOffset) {
          left += +$scope.kibiMenuTemplateLeftOffset;
        }
        let top = offset.top + $el.outerHeight();
        if (top + container.outerHeight() > $($window).height()) {
          top = offset.top - container.outerHeight();
        }
        container.css({left, top});
      };

      // track the scroll parent to hide upon scrolling
      let scrollParent;
      const scrollHandler = () => {
        if ($scope.data.showMenu) {
          $scope.data.showMenu = false;
          $scope.$apply();
        }
      };

      const show = function () {

        // find the current scroll parent and set it to hide the dropdown when
        // the scroll position changes.
        if (scrollParent) {
          scrollParent.off('scroll', scrollHandler);
        }
        scrollParent = $el.parents().filter(function () {
          return this.scrollHeight > $(this).height();
        });
        if (scrollParent) {
          scrollParent.on('scroll', scrollHandler);
        }

        $rootScope.$broadcast('kibiMenuTemplate:show', $el);

        if ($scope.kibiMenuTemplateOnShowFn) {
          $scope.kibiMenuTemplateOnShowFn();
        }
        updatePosition();
        container.addClass('visible');
      };

      const hide = function () {
        if ($scope.kibiMenuTemplateOnHideFn) {
          $scope.kibiMenuTemplateOnHideFn();
        }
        container.removeClass('visible');
      };

      $scope.$watch('data.showMenu', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          if ($scope.data.showMenu) {
            show();
          } else {
            hide();
          }
        }
      });

      // watch the position of the element and update position of the menu if needed
      $scope.$watch(function () {
        return $el.offset().left + '-' +  $el.offset().top;
      }, function () {
        updatePosition();
      });

      $el.on('click', function (event) {
        event.stopPropagation();
        if ($scope.kibiMenuTemplateOnFocusFn) {
          $scope.kibiMenuTemplateOnFocusFn();
        }
        $scope.$apply(function () {
          $scope.data.showMenu = !$scope.data.showMenu;
        });
      });

      // hide when clicking elsewhere in the document
      const clickOutsideHandler = function (event) {
        const isChild = $el[0].contains(event.target);
        const isSelf = $el[0] === event.target;
        const isMenu = container[0].contains(event.target);
        const isInsideElement = isChild || isSelf;

        if (!isInsideElement && !isMenu && $scope.kibiMenuTemplateOnBlurFn) {
          $scope.kibiMenuTemplateOnBlurFn();
        }

        if (!isInsideElement) {
          $scope.$apply(function () {
            $scope.data.showMenu = false;
          });
        }
      };

      $document.bind('click', clickOutsideHandler);

      let timerPromise;
      if ($scope.kibiMenuTemplateShowOnHover) {
        $el.on('mouseover', function (event) {
          $timeout.cancel(timerPromise);
          $scope.$apply(function () {
            $scope.data.showMenu = true;
          });
        });
        $el.on('mouseout', function (event) {
          timerPromise = $timeout(function () {
            $scope.data.showMenu = false;
          }, $scope.data.delay);
        });
        container.on('mouseover', function (event) {
          $timeout.cancel(timerPromise);
          $scope.$apply(function () {
            $scope.data.showMenu = true;
          });
        });
        container.on('mouseout', function (event) {
          timerPromise = $timeout (function () {
            $scope.data.showMenu = false;
          }, $scope.data.delay);
        });
      }

      // hide when clicking on another kibi dropdown
      const cancelOnShow = $rootScope.$on('kibiMenuTemplate:show', (event, element) => {
        if (element !== $el) {
          $scope.data.showMenu = false;
        }
      });

      $scope.$on('$destroy', function () {
        if (scrollParent) {
          scrollParent.off('scroll', scrollHandler);
        }
        cancelOnShow();
        $document.unbind('click', clickOutsideHandler);
        if (timerPromise) {
          $timeout.cancel(timerPromise);
        }
        container.remove();
      });

    };

    return {
      restrict: 'A',
      link: link,
      scope: {
        kibiMenuTemplate: '=',            // string - html template to be used to create the menu
        kibiMenuTemplateData: '=',        // array - data used in template when creating menu items
        kibiMenuTemplateContext: '=',     // object - additional data required by the template
        kibiMenuTemplateOnShowFn: '&',    // function - executed when menu is shown
        kibiMenuTemplateOnHideFn: '&',    // function - executed when menu is closed
        kibiMenuTemplateOnFocusFn: '&',   // function - executed when element is clicked
        kibiMenuTemplateOnBlurFn: '&',    // function - executed when there is a click outside element and menu
        kibiMenuTemplateLeftOffset: '@',  // integer, default 0 - left offset in px, useful to move the displayed menu a bit left right
        kibiMenuTemplateHideDelay: '@',   // integer, default 250 - delay for the hide action in ms
        kibiMenuTemplateShowOnHover: '@'  // boolean, default false - when true menu is shown also on hover
      }
    };
  });
});