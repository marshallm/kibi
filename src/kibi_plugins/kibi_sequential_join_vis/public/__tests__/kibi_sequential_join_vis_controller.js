import chrome from 'ui/chrome';
import Notifier from 'ui/notify/notifier';
import mockSavedObjects from 'fixtures/kibi/mock_saved_objects';
import sinon from 'auto-release-sinon';
import noDigestPromises from 'test_utils/no_digest_promises';
import Promise from 'bluebird';
import MockState from 'fixtures/mock_state';
import ngMock from 'ng_mock';
import expect from 'expect.js';
import $ from 'jquery';

describe('Kibi Sequential Join Visualization Controller', function () {
  let $scope;
  let $rootScope;
  let kibiState;

  const fakeSavedDashboards = [
    {
      id: 'myCurrentDashboard',
      title: 'myCurrentDashboard',
      savedSearchId: 'Articles'
    },
    {
      id: 'dashboard saved search missing',
      title: 'dashboard saved search missing',
      savedSearchId: 'missing'
    },
    {
      id: 'Companies',
      title: 'Companies',
      savedSearchId: 'Companies'
    },
    {
      id: 'Test',
      title: 'Test',
      savedSearchId: 'Companies'
    }
  ];
  const fakeSavedSearches = [
    {
      id: 'Companies',
      kibanaSavedObjectMeta: {
        searchSourceJSON: JSON.stringify(
          {
            index: 'company',
            filter: [],
            query: {}
          }
        )
      }
    },
    {
      id: 'Articles',
      kibanaSavedObjectMeta: {
        searchSourceJSON: JSON.stringify(
          {
            index: 'article',
            filter: [],
            query: {}
          }
        )
      }
    }
  ];

  function init({ enableAcl = true, currentDashboardId = 'myCurrentDashboard' } = {}) {
    ngMock.module('kibana/kibi_sequential_join_vis', $provide => {
      $provide.constant('kacConfiguration', { acl: { enabled: enableAcl } });

      $provide.service('getAppState', function () {
        return () => new MockState({ filters: [] });
      });
    });

    chrome.getInjected = function () {
      return {
        acl: {
          enabled: enableAcl
        }
      };
    };

    ngMock.module('app/dashboard', function ($provide) {
      $provide.service('savedDashboards', (Promise, Private) => mockSavedObjects(Promise, Private)('savedDashboard', fakeSavedDashboards));
    });

    ngMock.module('discover/saved_searches', function ($provide) {
      $provide.service('savedSearches', (Promise, Private) => mockSavedObjects(Promise, Private)('savedSearches', fakeSavedSearches));
    });

    ngMock.inject(function (_kibiState_, _$rootScope_, $controller) {
      kibiState = _kibiState_;
      kibiState._getCurrentDashboardId = sinon.stub().returns(currentDashboardId);
      kibiState.isSirenJoinPluginInstalled = sinon.stub().returns(true);

      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      $scope.vis = {
        params: {
          buttons: []
        }
      };

      const $element = $('<div>');
      $controller('KibiSequentialJoinVisController', { $scope, $element });
    });
  }

  noDigestPromises.activateForSuite();

  afterEach(() => {
    Notifier.prototype._notifs.length = 0;
  });

  describe('_constructButtons', function () {
    it('should reject if a button definition is incorrect', function () {
      const relations = {
        relationsIndices: [
          {
            id: 'indexa//patha/indexb//pathb',
            label: 'myrel',
            indices: [
              { indexPatternId: 'indexa', indexPatternType: '', path: 'patha' },
              { indexPatternId: 'indexb', indexPatternType: '', path: 'pathb' }
            ]
          }
        ]
      };

      init();
      kibiState._getDashboardAndSavedSearchMetas = sinon.stub().returns(Promise.resolve([]));
      $rootScope.$emit('change:config.kibi:relations', relations);
      $scope.vis.params.buttons = [
        {
          filterLabel:  '..mentioned in $COUNT Articles',
          indexRelationId:  'article//companies/company//id',
          label:  'Companies -->',
          sourceDashboardId:  '',
          targetDashboardId:  'Companies'
        }
      ];

      return $scope._constructButtons()
      .then(() => expect().fail(new Error('should fail')))
      .catch(err => {
        expect(err).to.be('Invalid configuration of the Kibi relational filter visualization');
      });
    });

    it('should remove the definition of buttons based on forbidden dashboards', function () {
      const relations = {
        relationsIndices: [
          {
            id: 'indexa//patha/indexb//pathb',
            label: 'myrel',
            indices: [
              { indexPatternId: 'indexa', indexPatternType: '', path: 'patha' },
              { indexPatternId: 'indexb', indexPatternType: '', path: 'pathb' }
            ]
          },
          {
            id: 'article//companies/company//id',
            label: 'mentions',
            indices: [
              { indexPatternId: 'article', indexPatternType: '', path: 'companies' },
              { indexPatternId: 'company', indexPatternType: '', path: 'id' }
            ]
          }
        ]
      };

      init();
      kibiState._getDashboardAndSavedSearchMetas = sinon.stub().returns(Promise.resolve([]));
      $rootScope.$emit('change:config.kibi:relations', relations);
      $scope.vis.params.buttons = [
        {
          filterLabel:  'something',
          indexRelationId:  'indexa//patha/indexb//pathb',
          label:  'to b',
          sourceDashboardId:  '',
          targetDashboardId:  'DashboardB'
        },
        {
          filterLabel:  '..mentioned in $COUNT Articles',
          indexRelationId:  'article//companies/company//id',
          label:  'Companies -->',
          sourceDashboardId:  '',
          targetDashboardId:  'Companies'
        }
      ];

      return $scope._constructButtons()
      .then(() => {
        sinon.assert.calledWith(kibiState._getDashboardAndSavedSearchMetas, [ 'myCurrentDashboard', 'Companies' ]);
      });
    });

    it('should not remove the definition of buttons based on missing dashboards if ACL is disabled', function () {
      const relations = {
        relationsIndices: [
          {
            id: 'indexa//patha/indexb//pathb',
            label: 'myrel',
            indices: [
              { indexPatternId: 'indexa', indexPatternType: '', path: 'patha' },
              { indexPatternId: 'indexb', indexPatternType: '', path: 'pathb' }
            ]
          },
          {
            id: 'article//companies/company//id',
            label: 'mentions',
            indices: [
              { indexPatternId: 'article', indexPatternType: '', path: 'companies' },
              { indexPatternId: 'company', indexPatternType: '', path: 'id' }
            ]
          }
        ]
      };

      init({ enableAcl: false });
      kibiState._getDashboardAndSavedSearchMetas = sinon.stub().returns(Promise.resolve([]));
      $rootScope.$emit('change:config.kibi:relations', relations);
      $scope.vis.params.buttons = [
        {
          filterLabel:  'something',
          indexRelationId:  'indexa//patha/indexb//pathb',
          label:  'to b',
          sourceDashboardId:  '',
          targetDashboardId:  'DashboardB'
        },
        {
          filterLabel:  '..mentioned in $COUNT Articles',
          indexRelationId:  'article//companies/company//id',
          label:  'Companies -->',
          sourceDashboardId:  '',
          targetDashboardId:  'Companies'
        }
      ];

      return $scope._constructButtons()
      .then(() => {
        sinon.assert.calledWith(kibiState._getDashboardAndSavedSearchMetas, [ 'myCurrentDashboard', 'DashboardB', 'Companies' ]);
      });
    });

    it('should build the buttons', function () {
      const relations = {
        relationsIndices: [
          {
            id: 'article//companies/company//id',
            label: 'mentions',
            indices: [
              { indexPatternId: 'article', indexPatternType: '', path: 'companies' },
              { indexPatternId: 'company', indexPatternType: '', path: 'id' }
            ]
          }
        ]
      };

      init({ enableAcl: false });
      $rootScope.$emit('change:config.kibi:relations', relations);
      $scope.vis.params.buttons = [
        {
          filterLabel:  '..mentioned in $COUNT Articles',
          indexRelationId:  'article//companies/company//id',
          label:  'rel',
          sourceDashboardId:  '',
          targetDashboardId:  'Test'
        },
        {
          filterLabel:  '..mentioned in $COUNT Articles',
          indexRelationId:  'article//companies/company//id',
          label:  'Companies -->',
          sourceDashboardId:  '',
          targetDashboardId:  'Companies'
        }
      ];

      return $scope._constructButtons()
      .then(buttons => {
        expect(buttons).to.have.length(2);
      });
    });

    it('should not build the buttons if the current dashboard index is missing', function () {
      const relations = {
        relationsIndices: [
          {
            id: 'article//companies/company//id',
            label: 'mentions',
            indices: [
              { indexPatternId: 'article', indexPatternType: '', path: 'companies' },
              { indexPatternId: 'company', indexPatternType: '', path: 'id' }
            ]
          }
        ]
      };

      init({ currentDashboardId: 'dashboard saved search missing', enableAcl: false });
      $rootScope.$emit('change:config.kibi:relations', relations);
      $scope.vis.params.buttons = [
        {
          filterLabel:  '..mentioned in $COUNT Articles',
          indexRelationId:  'article//companies/company//id',
          label:  'Companies -->',
          sourceDashboardId:  '',
          targetDashboardId:  'Companies'
        }
      ];

      return $scope._constructButtons()
      .then(buttons => {
        expect(buttons).to.have.length(0);
        expect(Notifier.prototype._notifs).to.have.length(1);
        expect(Notifier.prototype._notifs[0].type).to.be('warning');
        expect(Notifier.prototype._notifs[0].content)
          .to.contain('The dashboard [dashboard saved search missing] is associated with an unknown saved search.');
      });
    });

    it('should build the buttons even if some information needed by a button is missing', function () {
      const relations = {
        relationsIndices: [
          {
            id: 'article//companies/company//id',
            label: 'mentions',
            indices: [
              { indexPatternId: 'article', indexPatternType: '', path: 'companies' },
              { indexPatternId: 'company', indexPatternType: '', path: 'id' }
            ]
          }
        ]
      };

      init({ enableAcl: false });
      $rootScope.$emit('change:config.kibi:relations', relations);
      $scope.vis.params.buttons = [
        {
          filterLabel:  '..mentioned in $COUNT Articles',
          indexRelationId:  'article//companies/company//id',
          label:  'rel',
          sourceDashboardId:  '',
          targetDashboardId:  'dashboard saved search missing'
        },
        {
          filterLabel:  '..mentioned in $COUNT Articles',
          indexRelationId:  'article//companies/company//id',
          label:  'Companies -->',
          sourceDashboardId:  '',
          targetDashboardId:  'Companies'
        }
      ];

      return $scope._constructButtons()
      .then(buttons => {
        expect(buttons).to.have.length(1);
        expect(Notifier.prototype._notifs).to.have.length(1);
        expect(Notifier.prototype._notifs[0].type).to.be('warning');
        expect(Notifier.prototype._notifs[0].content)
          .to.contain('The dashboard [dashboard saved search missing] is associated with an unknown saved search.');
      });
    });
  });
});
