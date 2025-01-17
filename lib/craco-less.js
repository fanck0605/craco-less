const path = require("path");
const { deepClone, styleRuleByName, toStandardLoaderRule } = require("./utils");
const { loaderByName, throwUnexpectedConfigError } = require("@craco/craco");

const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

const pathSep = path.sep;

const throwError = (message, githubIssueQuery) =>
  throwUnexpectedConfigError({
    packageName: "craco-less",
    githubRepo: "DocSpring/craco-less",
    message,
    githubIssueQuery,
  });

const overrideWebpackConfig = ({ context, webpackConfig, pluginOptions }) => {
  pluginOptions = pluginOptions || {};

  const createLessRule = ({ baseRule, overrideRule }) => {
    baseRule = deepClone(baseRule);
    let lessRule = {
      ...baseRule,
      ...overrideRule,
      use: [],
    };

    const loaders = baseRule.use;
    loaders.map(toStandardLoaderRule).forEach((rule) => {
      if (
        (context.env === "development" || context.env === "test") &&
        rule.loader.includes(`${pathSep}style-loader${pathSep}`)
      ) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.styleLoaderOptions || {}),
          },
        });
      } else if (rule.loader.includes(`${pathSep}css-loader${pathSep}`)) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.cssLoaderOptions || {}),
          },
        });
      } else if (rule.loader.includes(`${pathSep}postcss-loader${pathSep}`)) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.postcssLoaderOptions || {}),
          },
        });
      } else if (
        rule.loader.includes(`${pathSep}resolve-url-loader${pathSep}`)
      ) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.resolveUrlLoaderOptions || {}),
          },
        });
      } else if (
        context.env === "production" &&
        rule.loader.includes(`${pathSep}mini-css-extract-plugin${pathSep}`)
      ) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.miniCssExtractPluginOptions || {}),
          },
        });
      } else if (rule.loader.includes(`${pathSep}sass-loader${pathSep}`)) {
        lessRule.use.push({
          loader: require.resolve("less-loader"),
          options: {
            ...rule.options,
            ...pluginOptions.lessLoaderOptions,
          },
        });
      } else {
        throwError(
          `Found an unhandled loader in the ${context.env} webpack config: ${rule.loader}`,
          "webpack+unknown+rule"
        );
      }
    });

    return lessRule;
  };

  const oneOfRule = webpackConfig.module.rules.find((rule) => rule.oneOf);
  if (!oneOfRule) {
    throwError(
      "Can't find a 'oneOf' rule under module.rules in the " +
        `${context.env} webpack config!`,
      "webpack+rules+oneOf"
    );
  }

  const sassRule = oneOfRule.oneOf.find(styleRuleByName("scss|sass", false));
  if (!sassRule) {
    throwError(
      "Can't find the webpack rule to match scss/sass files in the " +
        `${context.env} webpack config!`,
      "webpack+rules+scss+sass"
    );
  }
  let lessRule = createLessRule({
    baseRule: sassRule,
    overrideRule: {
      test: lessRegex,
      exclude: lessModuleRegex,
    },
  });

  if (pluginOptions.modifyLessRule) {
    lessRule = pluginOptions.modifyLessRule(lessRule, context);
  }

  const sassModuleRule = oneOfRule.oneOf.find(
    styleRuleByName("scss|sass", true)
  );
  if (!sassModuleRule) {
    throwError(
      "Can't find the webpack rule to match scss/sass module files in the " +
        `${context.env} webpack config!`,
      "webpack+rules+scss+sass"
    );
  }
  let lessModuleRule = createLessRule({
    baseRule: sassModuleRule,
    overrideRule: {
      test: lessModuleRegex,
    },
  });

  if (pluginOptions.modifyLessModuleRule) {
    lessModuleRule = pluginOptions.modifyLessModuleRule(
      lessModuleRule,
      context
    );
  }

  // insert less loader before "file" loader
  // https://webpack.js.org/guides/asset-modules/
  // https://github.com/facebook/create-react-app/blob/v5.0.0/packages/react-scripts/config/webpack.config.js#L590-L597
  let fileLoaderIndex = oneOfRule.oneOf.findIndex(
    ({ type }) => type === "asset/resource"
  );
  if (fileLoaderIndex === -1) {
    // https://github.com/facebook/create-react-app/blob/v4.0.3/packages/react-scripts/config/webpack.config.js#L583-L593
    fileLoaderIndex = oneOfRule.oneOf.findIndex(loaderByName("file-loader"));
    if (fileLoaderIndex === -1) {
      throwError(
        `Can't find "file" loader in the ${context.env} webpack config!`,
        "webpack+file+loader"
      );
    }
  }

  oneOfRule.oneOf.splice(fileLoaderIndex, 0, lessRule, lessModuleRule);

  return webpackConfig;
};

const overrideJestConfig = ({ context, jestConfig }) => {
  const moduleNameMapper = jestConfig.moduleNameMapper;
  const cssModulesPattern = Object.keys(moduleNameMapper).find((p) =>
    p.match(/\\\.module\\\.\(.*?css.*?\)/)
  );

  if (!cssModulesPattern) {
    throwError(
      `Can't find CSS Modules pattern under moduleNameMapper in the ${context.env} jest config!`,
      "jest+moduleNameMapper+css"
    );
  }

  moduleNameMapper[cssModulesPattern.replace("css", "css|less")] =
    moduleNameMapper[cssModulesPattern];
  delete moduleNameMapper[cssModulesPattern];

  const transformIgnorePatterns = jestConfig.transformIgnorePatterns;
  const cssModulesPatternIndex = transformIgnorePatterns.findIndex((p) =>
    p.match(/\\\.module\\\.\(.*?css.*?\)/)
  );
  if (cssModulesPatternIndex === -1) {
    throwError(
      `Can't find CSS Modules pattern under transformIgnorePatterns in the ${context.env} jest config!`,
      "jest+transformIgnorePatterns+css"
    );
  }

  transformIgnorePatterns[cssModulesPatternIndex] = transformIgnorePatterns[
    cssModulesPatternIndex
  ].replace("css", "css|less");

  return jestConfig;
};

module.exports = {
  overrideWebpackConfig,
  overrideJestConfig,
};
