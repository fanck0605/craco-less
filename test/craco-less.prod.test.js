const path = require("path");
const CracoLessPlugin = require("../lib/craco-less");
const {
  applyWebpackConfigPlugins,
} = require("@craco/craco/lib/features/plugins");
const { styleRuleByName } = require("../lib/utils");
const {
  getCracoContext,
  obtainSassRule,
  obtainSassModuleRule,
} = require("./test-utils");
const { createWebpackProdConfig } = require("@craco/craco");
const { processCracoConfig } = require("@craco/craco/lib/config");
const { cloneDeep } = require("lodash");

process.env.NODE_ENV = "production";

const contexts = ["react-scripts-v4", "react-scripts-v5"].map(
  (reactScriptsVersion) => {
    const baseCracoConfig = { reactScriptsVersion };
    const cracoContext = getCracoContext(baseCracoConfig);
    const originalWebpackConfig = createWebpackProdConfig(baseCracoConfig);

    const originalSassRule = obtainSassRule(originalWebpackConfig);
    const originalSassModuleRule = obtainSassModuleRule(originalWebpackConfig);

    const overrideWebpackConfig = (callerCracoConfig, webpackConfig) => {
      return applyWebpackConfigPlugins(
        processCracoConfig({
          ...baseCracoConfig,
          ...callerCracoConfig,
        }),
        webpackConfig,
        cracoContext
      );
    };

    return {
      baseCracoConfig,
      cracoContext,
      webpackConfig: originalWebpackConfig,
      originalWebpackConfig,
      originalSassRule,
      originalSassModuleRule,
      overrideWebpackConfig,
    };
  }
);

beforeEach(() => {
  contexts.forEach((context) => {
    // deep clone the object before each test.
    context.webpackConfig = cloneDeep(context.originalWebpackConfig);
  });
});

test("the webpack config is modified correctly without any options", () => {
  contexts.forEach(
    ({
      webpackConfig,
      originalSassRule,
      originalSassModuleRule,
      overrideWebpackConfig,
    }) => {
      webpackConfig = overrideWebpackConfig(
        {
          plugins: [{ plugin: CracoLessPlugin }],
        },
        webpackConfig
      );

      const oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
      expect(oneOfRule).not.toBeUndefined();

      const lessRule = oneOfRule.oneOf.find(
        ({ test }) => test && test.toString() === "/\\.less$/"
      );
      expect(lessRule).not.toBeUndefined();

      expect(lessRule.use[0]).toEqual({
        loader: originalSassRule.use[0].loader,
        options: {
          ...originalSassRule.use[0].options,
        },
      });
      expect(lessRule.use[1]).toEqual({
        loader: originalSassRule.use[1].loader,
        options: {
          ...originalSassRule.use[1].options,
        },
      });
      expect(lessRule.use[2]).toEqual({
        loader: originalSassRule.use[2].loader,
        options: {
          ...originalSassRule.use[2].options,
        },
      });
      expect(lessRule.use[3]).toEqual({
        loader: originalSassRule.use[3].loader,
        options: {
          ...originalSassRule.use[3].options,
        },
      });

      expect(lessRule.use[4]).toEqual({
        loader: require.resolve("less-loader"),
        options: {
          sourceMap: true,
        },
      });

      const lessModuleRule = oneOfRule.oneOf.find(
        ({ test }) => test && test.toString() === "/\\.module\\.less$/"
      );
      expect(lessModuleRule).not.toBeUndefined();

      expect(lessModuleRule.use[0]).toEqual({
        loader: originalSassModuleRule.use[0].loader,
        options: {
          ...originalSassModuleRule.use[0].options,
        },
      });
      expect(lessModuleRule.use[1]).toEqual({
        loader: originalSassModuleRule.use[1].loader,
        options: {
          ...originalSassModuleRule.use[1].options,
        },
      });
      expect(lessModuleRule.use[2]).toEqual({
        loader: originalSassModuleRule.use[2].loader,
        options: {
          ...originalSassModuleRule.use[2].options,
        },
      });
      expect(lessModuleRule.use[3]).toEqual({
        loader: originalSassModuleRule.use[3].loader,
        options: {
          ...originalSassModuleRule.use[3].options,
        },
      });

      expect(lessModuleRule.use[4]).toEqual({
        loader: require.resolve("less-loader"),
        options: {
          sourceMap: true,
        },
      });
    }
  );
});

test("the webpack config is modified correctly with less-loader options", () => {
  contexts.forEach(
    ({
      webpackConfig,
      originalSassRule,
      originalSassModuleRule,
      overrideWebpackConfig,
    }) => {
      webpackConfig = overrideWebpackConfig(
        {
          plugins: [
            {
              plugin: CracoLessPlugin,
              options: {
                lessLoaderOptions: {
                  lessOptions: {
                    modifyVars: {
                      "@primary-color": "#1DA57A",
                      "@link-color": "#1DA57A",
                      "@border-radius-base": "2px",
                    },
                    javascriptEnabled: true,
                  },
                },
              },
            },
          ],
        },
        webpackConfig
      );

      const oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
      expect(oneOfRule).not.toBeUndefined();

      const lessRule = oneOfRule.oneOf.find(
        ({ test }) => test && test.toString() === "/\\.less$/"
      );
      expect(lessRule).not.toBeUndefined();

      expect(lessRule.use[0]).toEqual({
        loader: originalSassRule.use[0].loader,
        options: {
          ...originalSassRule.use[0].options,
        },
      });
      expect(lessRule.use[1]).toEqual({
        loader: originalSassRule.use[1].loader,
        options: {
          ...originalSassRule.use[1].options,
        },
      });
      expect(lessRule.use[2]).toEqual({
        loader: originalSassRule.use[2].loader,
        options: {
          ...originalSassRule.use[2].options,
        },
      });
      expect(lessRule.use[3]).toEqual({
        loader: originalSassRule.use[3].loader,
        options: {
          ...originalSassRule.use[3].options,
        },
      });

      expect(lessRule.use[4]).toEqual({
        loader: require.resolve("less-loader"),
        options: {
          lessOptions: {
            modifyVars: {
              "@primary-color": "#1DA57A",
              "@link-color": "#1DA57A",
              "@border-radius-base": "2px",
            },
            javascriptEnabled: true,
          },
          sourceMap: true,
        },
      });

      const lessModuleRule = oneOfRule.oneOf.find(
        ({ test }) => test && test.toString() === "/\\.module\\.less$/"
      );
      expect(lessModuleRule).not.toBeUndefined();

      expect(lessModuleRule.use[0]).toEqual({
        loader: originalSassModuleRule.use[0].loader,
        options: {
          ...originalSassModuleRule.use[0].options,
        },
      });
      expect(lessModuleRule.use[1]).toEqual({
        loader: originalSassModuleRule.use[1].loader,
        options: {
          ...originalSassModuleRule.use[1].options,
        },
      });
      expect(lessModuleRule.use[2]).toEqual({
        loader: originalSassModuleRule.use[2].loader,
        options: {
          ...originalSassModuleRule.use[2].options,
        },
      });
      expect(lessModuleRule.use[3]).toEqual({
        loader: originalSassModuleRule.use[3].loader,
        options: {
          ...originalSassModuleRule.use[3].options,
        },
      });

      expect(lessModuleRule.use[4]).toEqual({
        loader: require.resolve("less-loader"),
        options: {
          lessOptions: {
            modifyVars: {
              "@primary-color": "#1DA57A",
              "@link-color": "#1DA57A",
              "@border-radius-base": "2px",
            },
            javascriptEnabled: true,
          },
          sourceMap: true,
        },
      });
    }
  );
});

test("the webpack config is modified correctly with all loader options", () => {
  contexts.forEach(
    ({
      webpackConfig,
      originalSassRule,
      originalSassModuleRule,
      overrideWebpackConfig,
    }) => {
      const externalMiniCssExtractPluginOptions = {
        testOption: "MiniCssExtractPlugin",
      };
      const externalCssLoaderOptions = {
        testOption: "CssLoader",
      };
      const externalPostcssLoaderOptions = {
        testOption: "PostcssLoader",
      };
      const externalResolveUrlLoaderOptions = {
        testOption: "ResolveUrlLoader",
      };

      webpackConfig = overrideWebpackConfig(
        {
          plugins: [
            {
              plugin: CracoLessPlugin,
              options: {
                lessLoaderOptions: {
                  lessOptions: {
                    modifyVars: {
                      "@primary-color": "#1DA57A",
                      "@link-color": "#1DA57A",
                      "@border-radius-base": "2px",
                    },
                    javascriptEnabled: true,
                  },
                },
                resolveUrlLoaderOptions: externalResolveUrlLoaderOptions,
                postcssLoaderOptions: externalPostcssLoaderOptions,
                cssLoaderOptions: externalCssLoaderOptions,
                miniCssExtractPluginOptions:
                  externalMiniCssExtractPluginOptions,
              },
            },
          ],
        },
        webpackConfig
      );

      const oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
      expect(oneOfRule).not.toBeUndefined();

      const lessRule = oneOfRule.oneOf.find(
        ({ test }) => test && test.toString() === "/\\.less$/"
      );
      expect(lessRule).not.toBeUndefined();

      expect(lessRule.use[0]).toEqual({
        loader: originalSassRule.use[0].loader,
        options: {
          ...originalSassRule.use[0].options,
          ...externalMiniCssExtractPluginOptions,
        },
      });
      expect(lessRule.use[1]).toEqual({
        loader: originalSassRule.use[1].loader,
        options: {
          ...originalSassRule.use[1].options,
          ...externalCssLoaderOptions,
        },
      });
      expect(lessRule.use[2]).toEqual({
        loader: originalSassRule.use[2].loader,
        options: {
          ...originalSassRule.use[2].options,
          ...externalPostcssLoaderOptions,
        },
      });
      expect(lessRule.use[3]).toEqual({
        loader: originalSassRule.use[3].loader,
        options: {
          ...originalSassRule.use[3].options,
          ...externalResolveUrlLoaderOptions,
        },
      });

      expect(lessRule.use[4]).toEqual({
        loader: require.resolve("less-loader"),
        options: {
          lessOptions: {
            modifyVars: {
              "@primary-color": "#1DA57A",
              "@link-color": "#1DA57A",
              "@border-radius-base": "2px",
            },
            javascriptEnabled: true,
          },
          sourceMap: true,
        },
      });

      const lessModuleRule = oneOfRule.oneOf.find(
        ({ test }) => test && test.toString() === "/\\.module\\.less$/"
      );
      expect(lessModuleRule).not.toBeUndefined();

      expect(lessModuleRule.use[0]).toEqual({
        loader: originalSassModuleRule.use[0].loader,
        options: {
          ...originalSassModuleRule.use[0].options,
          ...externalMiniCssExtractPluginOptions,
        },
      });
      expect(lessModuleRule.use[1]).toEqual({
        loader: originalSassModuleRule.use[1].loader,
        options: {
          ...originalSassModuleRule.use[1].options,
          ...externalCssLoaderOptions,
        },
      });
      expect(lessModuleRule.use[2]).toEqual({
        loader: originalSassModuleRule.use[2].loader,
        options: {
          ...originalSassModuleRule.use[2].options,
          ...externalPostcssLoaderOptions,
        },
      });
      expect(lessModuleRule.use[3]).toEqual({
        loader: originalSassModuleRule.use[3].loader,
        options: {
          ...originalSassModuleRule.use[3].options,
          ...externalResolveUrlLoaderOptions,
        },
      });

      expect(lessModuleRule.use[4]).toEqual({
        loader: require.resolve("less-loader"),
        options: {
          lessOptions: {
            modifyVars: {
              "@primary-color": "#1DA57A",
              "@link-color": "#1DA57A",
              "@border-radius-base": "2px",
            },
            javascriptEnabled: true,
          },
          sourceMap: true,
        },
      });
    }
  );
});

test("the webpack config is modified correctly with the modifyLessRule option", () => {
  contexts.forEach(
    ({
      webpackConfig,
      originalSassRule,
      originalSassModuleRule,
      overrideWebpackConfig,
    }) => {
      webpackConfig = overrideWebpackConfig(
        {
          plugins: [
            {
              plugin: CracoLessPlugin,
              options: {
                modifyLessRule: (rule, context) => {
                  if (context.env === "production") {
                    rule.use[0].options.testOption = "test-value-production";
                  } else {
                    rule.use[0].options.testOption = "test-value-development";
                  }
                  return rule;
                },
              },
            },
          ],
        },
        webpackConfig
      );

      const oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
      expect(oneOfRule).not.toBeUndefined();

      const lessRule = oneOfRule.oneOf.find(
        ({ test }) => test && test.toString() === "/\\.less$/"
      );
      expect(lessRule).not.toBeUndefined();

      expect(lessRule.use[0]).toEqual({
        loader: originalSassRule.use[0].loader,
        options: {
          ...originalSassRule.use[0].options,
          testOption: "test-value-production",
        },
      });
      expect(lessRule.use[1]).toEqual({
        loader: originalSassRule.use[1].loader,
        options: {
          ...originalSassRule.use[1].options,
        },
      });
      expect(lessRule.use[2]).toEqual({
        loader: originalSassRule.use[2].loader,
        options: {
          ...originalSassRule.use[2].options,
        },
      });
      expect(lessRule.use[3]).toEqual({
        loader: originalSassRule.use[3].loader,
        options: {
          ...originalSassRule.use[3].options,
        },
      });

      expect(lessRule.use[4]).toEqual({
        loader: require.resolve("less-loader"),
        options: {
          sourceMap: true,
        },
      });

      const lessModuleRule = oneOfRule.oneOf.find(
        ({ test }) => test && test.toString() === "/\\.module\\.less$/"
      );
      expect(lessModuleRule).not.toBeUndefined();

      expect(lessModuleRule.use[0]).toEqual({
        loader: originalSassModuleRule.use[0].loader,
        options: {
          ...originalSassModuleRule.use[0].options,
        },
      });
      expect(lessModuleRule.use[1]).toEqual({
        loader: originalSassModuleRule.use[1].loader,
        options: {
          ...originalSassModuleRule.use[1].options,
        },
      });
      expect(lessModuleRule.use[2]).toEqual({
        loader: originalSassModuleRule.use[2].loader,
        options: {
          ...originalSassModuleRule.use[2].options,
        },
      });
      expect(lessModuleRule.use[3]).toEqual({
        loader: originalSassModuleRule.use[3].loader,
        options: {
          ...originalSassModuleRule.use[3].options,
        },
      });

      expect(lessModuleRule.use[4]).toEqual({
        loader: require.resolve("less-loader"),
        options: {
          sourceMap: true,
        },
      });
    }
  );
});

test("the webpack config is modified correctly with the modifyLessModuleRule option", () => {
  contexts.forEach(
    ({
      webpackConfig,
      originalSassRule,
      originalSassModuleRule,
      overrideWebpackConfig,
    }) => {
      webpackConfig = overrideWebpackConfig(
        {
          plugins: [
            {
              plugin: CracoLessPlugin,
              options: {
                modifyLessModuleRule: (rule, context) => {
                  if (context.env === "production") {
                    rule.use[0].options.testOption = "test-value-production";
                    rule.use[1].options.modules.getLocalIdent =
                      "test-deep-clone-production";
                  } else {
                    rule.use[0].options.testOption = "test-value-development";
                    rule.use[1].options.modules.getLocalIdent =
                      "test-deep-clone-development";
                  }
                  return rule;
                },
              },
            },
          ],
        },
        webpackConfig
      );

      const oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
      expect(oneOfRule).not.toBeUndefined();

      const lessRule = oneOfRule.oneOf.find(
        ({ test }) => test && test.toString() === "/\\.less$/"
      );
      expect(lessRule).not.toBeUndefined();

      expect(lessRule.use[0]).toEqual({
        loader: originalSassRule.use[0].loader,
        options: {
          ...originalSassRule.use[0].options,
        },
      });
      expect(lessRule.use[1]).toEqual({
        loader: originalSassRule.use[1].loader,
        options: {
          ...originalSassRule.use[1].options,
        },
      });
      expect(lessRule.use[2]).toEqual({
        loader: originalSassRule.use[2].loader,
        options: {
          ...originalSassRule.use[2].options,
        },
      });
      expect(lessRule.use[3]).toEqual({
        loader: originalSassRule.use[3].loader,
        options: {
          ...originalSassRule.use[3].options,
        },
      });

      expect(lessRule.use[4]).toEqual({
        loader: require.resolve("less-loader"),
        options: {
          sourceMap: true,
        },
      });

      const lessModuleRule = oneOfRule.oneOf.find(
        ({ test }) => test && test.toString() === "/\\.module\\.less$/"
      );
      expect(lessModuleRule).not.toBeUndefined();

      expect(lessModuleRule.use[0]).toEqual({
        loader: originalSassModuleRule.use[0].loader,
        options: {
          ...originalSassModuleRule.use[0].options,
          testOption: "test-value-production",
        },
      });
      expect(lessModuleRule.use[1]).toEqual({
        loader: originalSassModuleRule.use[1].loader,
        options: {
          ...originalSassModuleRule.use[1].options,
          modules: {
            ...originalSassModuleRule.use[1].options.modules,
            getLocalIdent: "test-deep-clone-production",
          },
        },
      });
      expect(lessModuleRule.use[2]).toEqual({
        loader: originalSassModuleRule.use[2].loader,
        options: {
          ...originalSassModuleRule.use[2].options,
        },
      });
      expect(lessModuleRule.use[3]).toEqual({
        loader: originalSassModuleRule.use[3].loader,
        options: {
          ...originalSassModuleRule.use[3].options,
        },
      });

      expect(lessModuleRule.use[4]).toEqual({
        loader: require.resolve("less-loader"),
        options: {
          sourceMap: true,
        },
      });

      const sassModuleRule = oneOfRule.oneOf.find(
        styleRuleByName("scss|sass", true)
      );
      expect(sassModuleRule).toEqual(originalSassModuleRule);
    }
  );
});

test('throws an error when we can\'t find "file" loader in the webpack config', () => {
  contexts.forEach(({ webpackConfig, overrideWebpackConfig }) => {
    let oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
    oneOfRule.oneOf = oneOfRule.oneOf
      .filter(({ loader }) => !(loader && loader.includes("file-loader")))
      .filter(({ type }) => type !== "asset/resource");

    const runTest = () => {
      webpackConfig = overrideWebpackConfig(
        {
          plugins: [{ plugin: CracoLessPlugin }],
        },
        webpackConfig
      );
    };

    expect(runTest).toThrowError(
      /^Can't find "file" loader in the production webpack config!/
    );
  });
});

test("throws an error when we can't find the oneOf rules in the webpack config", () => {
  contexts.forEach(({ webpackConfig, overrideWebpackConfig }) => {
    webpackConfig.module.rules = webpackConfig.module.rules.filter(
      (r) => !r.oneOf
    );

    const runTest = () => {
      webpackConfig = overrideWebpackConfig(
        {
          plugins: [{ plugin: CracoLessPlugin }],
        },
        webpackConfig
      );
    };

    expect(runTest).toThrowError(
      /^Can't find a 'oneOf' rule under module.rules in the production webpack config!/
    );
  });
});

test("throws an error when react-scripts adds an unknown webpack rule", () => {
  contexts.forEach(({ webpackConfig, overrideWebpackConfig }) => {
    const unknownLoader = path.join(
      path.sep,
      "path",
      "to",
      "unknown-loader",
      "index.js"
    );
    let oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
    const sassRule = oneOfRule.oneOf.find(styleRuleByName("scss|sass", false));
    sassRule.use.push({
      loader: unknownLoader,
    });
    const runTest = () => {
      webpackConfig = overrideWebpackConfig(
        {
          plugins: [{ plugin: CracoLessPlugin }],
        },
        webpackConfig
      );
    };
    expect(runTest).toThrowError(
      new RegExp(
        "^Found an unhandled loader in the production webpack config: " +
          unknownLoader.replace(/\\/g, "\\\\")
      )
    );
  });
});

test("throws an error when the sass rule is missing", () => {
  contexts.forEach(({ webpackConfig, overrideWebpackConfig }) => {
    let oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
    let matchSassRule = styleRuleByName("scss|sass", false);
    oneOfRule.oneOf = oneOfRule.oneOf.filter((rule) => !matchSassRule(rule));

    const runTest = () => {
      webpackConfig = overrideWebpackConfig(
        {
          plugins: [{ plugin: CracoLessPlugin }],
        },
        webpackConfig
      );
    };
    expect(runTest).toThrowError(
      /^Can't find the webpack rule to match scss\/sass files in the production webpack config!/
    );
  });
});

test("throws an error when the sass module rule is missing", () => {
  contexts.forEach(({ webpackConfig, overrideWebpackConfig }) => {
    const oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
    const matchSassModuleRule = styleRuleByName("scss|sass", true);
    oneOfRule.oneOf = oneOfRule.oneOf.filter(
      (rule) => !matchSassModuleRule(rule)
    );

    const runTest = () => {
      webpackConfig = overrideWebpackConfig(
        {
          plugins: [{ plugin: CracoLessPlugin }],
        },
        webpackConfig
      );
    };
    expect(runTest).toThrowError(
      /^Can't find the webpack rule to match scss\/sass module files in the production webpack config!/
    );
  });
});
