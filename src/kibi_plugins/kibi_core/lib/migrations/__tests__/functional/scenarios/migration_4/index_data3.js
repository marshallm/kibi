/*eslint max-len: 0*/
import requirefrom from 'requirefrom';

const packageJson = requirefrom('src/utils')('package_json');

/**
 * Defines the following objects:
 *
 * - a configuration with a kibi:relations of version 1 without the field relationsDashboardsSerialized
 */
module.exports = [
  {
    index: {
      _index: '.kibi3',
      _type: 'config',
      _id: packageJson.kibi_version
    }
  },
  {
    buildNum: packageJson.build.number,
    'dateFormat:tz': 'UTC',
    'kibi:relations': '{\"relationsDashboards\":[],\"relationsIndices\":[{\"id\":\"investment/investors/investor/id\",\"indices\":[{\"indexPatternId\":\"investor\",\"path\":\"id\"},{\"indexPatternId\":\"investment\",\"path\":\"investors\"}],\"label\":\"by\"},{\"id\":\"company/id/investment/companies\",\"indices\":[{\"indexPatternId\":\"investment\",\"path\":\"companies\"},{\"indexPatternId\":\"company\",\"path\":\"id\"}],\"label\":\"funded\"},{\"id\":\"article/companies/company/id\",\"indices\":[{\"indexPatternId\":\"article\",\"path\":\"companies\"},{\"indexPatternId\":\"company\",\"path\":\"id\"}],\"label\":\"mentions\"},{\"id\":\"company/id/company/one_competitor\",\"indices\":[{\"indexPatternId\":\"company\",\"path\":\"id\"},{\"indexPatternId\":\"company\",\"path\":\"one_competitor\"}],\"label\":\"has competitor\"}],\"relationsIndicesSerialized\":{\"links\":[{\"data\":{},\"id\":\"eegid-investor-eegid-investment-by-0\",\"linkType\":\"by\",\"size\":1,\"source\":\"eegid-investor\",\"target\":\"eegid-investment\",\"undirected\":true},{\"data\":{},\"id\":\"eegid-investment-eegid-company-funded-0\",\"linkType\":\"funded\",\"size\":1,\"source\":\"eegid-investment\",\"target\":\"eegid-company\",\"undirected\":true},{\"data\":{},\"id\":\"eegid-article-eegid-company-mentions-0\",\"linkType\":\"mentions\",\"size\":1,\"source\":\"eegid-article\",\"target\":\"eegid-company\",\"undirected\":true},{\"data\":{},\"id\":\"eegid-company-eegid-company-has competitor-0\",\"linkType\":\"has competitor\",\"size\":1,\"source\":\"eegid-company\",\"target\":\"eegid-company\",\"undirected\":true}],\"nodes\":[{\"fixed\":1,\"id\":\"eegid-investor\",\"index\":0,\"label\":\"investor\",\"nodeType\":\"investor\",\"px\":368.6104732279718,\"py\":45,\"size\":20,\"weight\":1,\"x\":368.6104732279718,\"y\":45},{\"fixed\":1,\"id\":\"eegid-investment\",\"index\":1,\"label\":\"investment\",\"nodeType\":\"investment\",\"px\":191.46076310442646,\"py\":33,\"size\":20,\"weight\":2,\"x\":191.46076310442646,\"y\":33},{\"fixed\":1,\"id\":\"eegid-company\",\"index\":2,\"label\":\"company\",\"nodeType\":\"company\",\"px\":122.50534242756831,\"py\":147,\"size\":20,\"weight\":4,\"x\":122.50534242756831,\"y\":147},{\"fixed\":1,\"id\":\"eegid-article\",\"index\":3,\"label\":\"article\",\"nodeType\":\"article\",\"px\":333.88767552450673,\"py\":176,\"size\":20,\"weight\":1,\"x\":333.88767552450673,\"y\":176}],\"options\":{\"alwaysShowLinksLabels\":true,\"autostart\":true,\"baseURL\":\"\",\"colors\":{\"article\":\"#bc52bc\",\"company\":\"#663db8\",\"investment\":\"#6f87d8\",\"investor\":\"#006e8a\"},\"debug\":false,\"draggable\":true,\"fontSize\":10,\"forceDistance\":200,\"forceGravity\":0.01,\"groupingForce\":{},\"linkColor\":\"#dedede\",\"linkHoverColor\":\"#444\",\"linkSize\":1,\"maxLinkSize\":3,\"maxNodeSize\":30,\"minLinkSize\":0.8,\"minNodeSize\":20,\"monitorContainerSize\":true,\"nodeIcons\":{},\"nodeR\":10,\"showLegend\":false,\"title\":null}}}'
  }
];
