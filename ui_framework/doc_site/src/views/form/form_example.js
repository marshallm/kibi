import React from 'react';

import {
  GuideDemo,
  GuidePage,
  GuideSection,
  GuideSectionTypes,
  GuideText,
} from '../../components';

const textInputHtml = require('./text_input.html');
const searchInputHtml = require('./search_input.html');
const staticInputHtml = require('./static_input.html');
const textAreaHtml = require('./text_area.html');
const textAreaNonResizableHtml = require('./text_area_non_resizable.html');
const checkBoxHtml = require('./check_box.html');
const selectHtml = require('./select.html');

export default props => (
  <GuidePage title={props.route.name}>
    <GuideSection
      title="TextInput"
      source={[{
        type: GuideSectionTypes.HTML,
        code: textInputHtml,
      }]}
    >
      <GuideDemo
        html={textInputHtml}
      />

      <GuideDemo
        html={textInputHtml}
        isDarkTheme={true}
      />
    </GuideSection>

    <GuideSection
      title="SearchInput"
      source={[{
        type: GuideSectionTypes.HTML,
        code: searchInputHtml,
      }]}
    >
      <GuideDemo
        html={searchInputHtml}
      />

      <GuideDemo
        html={searchInputHtml}
        isDarkTheme={true}
      />
    </GuideSection>

    <GuideSection
      title="StaticInput"
      source={[{
        type: GuideSectionTypes.HTML,
        code: staticInputHtml,
      }]}
    >
      <GuideText>
        Use StaticInput to display dynamic content in a form which the user isn&rsquo;t allowed to edit.
      </GuideText>

      <GuideDemo
        html={staticInputHtml}
      />
    </GuideSection>

    <GuideSection
      title="TextArea"
      source={[{
        type: GuideSectionTypes.HTML,
        code: textAreaHtml,
      }]}
    >
      <GuideDemo
        html={textAreaHtml}
      />

      <GuideDemo
        html={textAreaHtml}
        isDarkTheme={true}
      />
    </GuideSection>

    <GuideSection
      title="TextArea, non-resizable"
      source={[{
        type: GuideSectionTypes.HTML,
        code: textAreaNonResizableHtml,
      }]}
    >
      <GuideDemo
        html={textAreaNonResizableHtml}
      />
    </GuideSection>

    <GuideSection
      title="CheckBox"
      source={[{
        type: GuideSectionTypes.HTML,
        code: checkBoxHtml,
      }]}
    >
      <GuideDemo
        html={checkBoxHtml}
      />
    </GuideSection>

    <GuideSection
      title="Select"
      source={[{
        type: GuideSectionTypes.HTML,
        code: selectHtml,
      }]}
    >
      <GuideDemo
        html={selectHtml}
      />

      <GuideDemo
        html={selectHtml}
        isDarkTheme={true}
      />
    </GuideSection>
  </GuidePage>
);
