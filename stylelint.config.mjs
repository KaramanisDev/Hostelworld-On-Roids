import sassGuidelines from 'stylelint-config-sass-guidelines'

const stylisticPrefix = '@stylistic/'
const stylisticScssPrefix = '@stylistic/scss/'

const { 'declaration-block-single-line-max-declarations': singleLineDeclarationsSetting, ...sassGuidelinesRules } =
  sassGuidelines.rules

const scssRules = Object.fromEntries(
  Object.entries(sassGuidelinesRules).map(([name, setting]) => [
    name.replace(stylisticPrefix, stylisticScssPrefix),
    setting
  ])
)

export default {
  ...sassGuidelines,
  plugins: ['stylelint-scss', '@stylistic/stylelint-plugin'],
  rules: {
    ...scssRules,
    [`${stylisticScssPrefix}declaration-block-single-line-max-declarations`]: singleLineDeclarationsSetting,
    'max-nesting-depth': null,
    'selector-max-compound-selectors': null
  }
}
