const { processCracoConfig } = require("@craco/craco/lib/config");
const { getCraPaths } = require("@craco/craco/lib/cra");
const { styleRuleByName } = require("../lib/utils");

const getCracoContext = (callerCracoConfig, env = process.env.NODE_ENV) => {
  const context = { env };
  const cracoConfig = processCracoConfig(callerCracoConfig, { env });
  context.paths = getCraPaths(cracoConfig);
  return context;
};

const obtainSassRule = (webpackConfig) => {
  return webpackConfig.module.rules
    .find((rule) => rule.oneOf)
    .oneOf.find(styleRuleByName("scss|sass", false));
};

const obtainSassModuleRule = (webpackConfig) => {
  return webpackConfig.module.rules
    .find((rule) => rule.oneOf)
    .oneOf.find(styleRuleByName("scss|sass", true));
};

module.exports = {
  getCracoContext,
  obtainSassRule,
  obtainSassModuleRule,
};
