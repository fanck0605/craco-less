const path = require("path");
const CracoLessPlugin = require("./craco-less");
const {
  applyWebpackConfigPlugins,
} = require("@craco/craco/lib/features/plugins");
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");
const { styleRuleByName } = require("./utils");
const { getCracoContext } = require("./test-utils");
const { createWebpackDevConfig } = require("@craco/craco");
const { processCracoConfig } = require("@craco/craco/lib/config");
const { cloneDeep } = require("lodash");

process.env.NODE_ENV = "development";

const reactScriptsVersion = "react-scripts-v4";
const baseCracoConfig = { reactScriptsVersion };
const cracoContext = getCracoContext(baseCracoConfig);
const originalWebpackConfig = createWebpackDevConfig(baseCracoConfig);

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

let webpackConfig;
beforeEach(() => {
  // deep clone the object before each test.
  webpackConfig = cloneDeep(originalWebpackConfig);
});

test("the webpack config is modified correctly without any options", () => {
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
  expect(lessRule.use[0].loader).toContain(`${path.sep}style-loader`);
  expect(lessRule.use[0].options).toEqual({});

  expect(lessRule.use[1].loader).toContain(`${path.sep}css-loader`);
  expect(lessRule.use[1].options).toEqual({
    importLoaders: 3,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessRule.use[2].options.ident).toEqual("postcss");
  expect(lessRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessRule.use[3].loader).toContain(`${path.sep}resolve-url-loader`);
  expect(lessRule.use[3].options).toEqual({
    root: lessRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessRule.use[4].options).toEqual({ sourceMap: true });

  const lessModuleRule = oneOfRule.oneOf.find(
    ({ test }) => test && test.toString() === "/\\.module\\.less$/"
  );
  expect(lessModuleRule).not.toBeUndefined();
  expect(lessModuleRule.use[0].loader).toContain(`${path.sep}style-loader`);
  expect(lessModuleRule.use[0].options).toEqual({});

  expect(lessModuleRule.use[1].loader).toContain(`${path.sep}css-loader`);
  expect(lessModuleRule.use[1].options).toEqual({
    importLoaders: 3,
    sourceMap: webpackConfig.devtool !== false,
    modules: {
      getLocalIdent: getCSSModuleLocalIdent,
    },
  });

  expect(lessModuleRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessModuleRule.use[2].options.ident).toEqual("postcss");
  expect(lessModuleRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessModuleRule.use[3].loader).toContain(
    `${path.sep}resolve-url-loader`
  );
  expect(lessModuleRule.use[3].options).toEqual({
    root: lessModuleRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessModuleRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessModuleRule.use[4].options).toEqual({ sourceMap: true });
});

test("the webpack config is modified correctly with less-loader options", () => {
  webpackConfig = overrideWebpackConfig(
    {
      plugins: [
        {
          plugin: CracoLessPlugin,
          options: {
            lessLoaderOptions: {
              modifyVars: {
                "@less-variable": "#fff",
              },
              javascriptEnabled: true,
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

  expect(lessRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessRule.use[2].options.ident).toEqual("postcss");
  expect(lessRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessRule.use[3].loader).toContain(`${path.sep}resolve-url-loader`);
  expect(lessRule.use[3].options).toEqual({
    root: lessRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessRule.use[4].options).toEqual({
    sourceMap: true,
    javascriptEnabled: true,
    modifyVars: {
      "@less-variable": "#fff",
    },
  });

  const lessModuleRule = oneOfRule.oneOf.find(
    ({ test }) => test && test.toString() === "/\\.module\\.less$/"
  );
  expect(lessModuleRule).not.toBeUndefined();

  expect(lessModuleRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessModuleRule.use[2].options.ident).toEqual("postcss");
  expect(lessModuleRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessModuleRule.use[3].loader).toContain(
    `${path.sep}resolve-url-loader`
  );
  expect(lessModuleRule.use[3].options).toEqual({
    root: lessModuleRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessModuleRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessModuleRule.use[4].options).toEqual({
    sourceMap: true,
    javascriptEnabled: true,
    modifyVars: {
      "@less-variable": "#fff",
    },
  });
});

test("the webpack config is modified correctly with all loader options", () => {
  webpackConfig = overrideWebpackConfig(
    {
      plugins: [
        {
          plugin: CracoLessPlugin,
          options: {
            lessLoaderOptions: {
              modifyVars: {
                "@less-variable": "#fff",
              },
              javascriptEnabled: true,
            },
            cssLoaderOptions: {
              modules: true,
              localIdentName: "[local]_[hash:base64:5]",
            },
            postcssLoaderOptions: {
              ident: "test-ident",
            },
            styleLoaderOptions: {
              sourceMaps: true,
            },
            miniCssExtractPluginOptions: {
              testOption: "test-value",
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
  expect(lessRule.use[0].loader).toContain(`${path.sep}style-loader`);
  expect(lessRule.use[0].options).toEqual({
    sourceMaps: true,
  });

  expect(lessRule.use[1].loader).toContain(`${path.sep}css-loader`);
  expect(lessRule.use[1].options).toEqual({
    modules: true,
    importLoaders: 3,
    localIdentName: "[local]_[hash:base64:5]",
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessRule.use[2].options.ident).toEqual("test-ident");
  expect(lessRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessRule.use[3].loader).toContain(`${path.sep}resolve-url-loader`);
  expect(lessRule.use[3].options).toEqual({
    root: lessRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessRule.use[4].options).toEqual({
    sourceMap: true,
    javascriptEnabled: true,
    modifyVars: {
      "@less-variable": "#fff",
    },
  });

  const lessModuleRule = oneOfRule.oneOf.find(
    ({ test }) => test && test.toString() === "/\\.module\\.less$/"
  );
  expect(lessModuleRule).not.toBeUndefined();
  expect(lessModuleRule.use[0].loader).toContain(`${path.sep}style-loader`);
  expect(lessModuleRule.use[0].options).toEqual({
    sourceMaps: true,
  });

  expect(lessModuleRule.use[1].loader).toContain(`${path.sep}css-loader`);
  expect(lessModuleRule.use[1].options).toEqual({
    modules: true,
    importLoaders: 3,
    localIdentName: "[local]_[hash:base64:5]",
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessModuleRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessModuleRule.use[2].options.ident).toEqual("test-ident");
  expect(lessModuleRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessModuleRule.use[3].loader).toContain(
    `${path.sep}resolve-url-loader`
  );
  expect(lessModuleRule.use[3].options).toEqual({
    root: lessModuleRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessModuleRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessModuleRule.use[4].options).toEqual({
    sourceMap: true,
    javascriptEnabled: true,
    modifyVars: {
      "@less-variable": "#fff",
    },
  });
});

test("the webpack config is modified correctly with the modifyLessRule option", () => {
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

  expect(lessRule.use[0].loader).toContain(`${path.sep}style-loader`);
  expect(lessRule.use[0].options.testOption).toEqual("test-value-development");

  expect(lessRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessRule.use[2].options.ident).toEqual("postcss");
  expect(lessRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessRule.use[3].loader).toContain(`${path.sep}resolve-url-loader`);
  expect(lessRule.use[3].options).toEqual({
    root: lessRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessRule.use[4].options).toEqual({ sourceMap: true });
});

test("the webpack config is modified correctly with the modifyLessModuleRule option", () => {
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
  const lessModuleRule = oneOfRule.oneOf.find(
    ({ test }) => test && test.toString() === "/\\.module\\.less$/"
  );
  expect(lessModuleRule).not.toBeUndefined();

  expect(lessModuleRule.use[0].loader).toContain(`${path.sep}style-loader`);
  expect(lessModuleRule.use[0].options.testOption).toEqual(
    "test-value-development"
  );

  expect(lessModuleRule.use[1].options.modules.getLocalIdent).toEqual(
    "test-deep-clone-development"
  );

  expect(lessModuleRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessModuleRule.use[2].options.ident).toEqual("postcss");
  expect(lessModuleRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessModuleRule.use[3].loader).toContain(
    `${path.sep}resolve-url-loader`
  );
  expect(lessModuleRule.use[3].options).toEqual({
    root: lessModuleRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessModuleRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessModuleRule.use[4].options).toEqual({ sourceMap: true });

  const sassModuleRule = oneOfRule.oneOf.find(
    styleRuleByName("scss|sass", true)
  );

  expect(sassModuleRule.use[1].options.modules.getLocalIdent).toEqual(
    getCSSModuleLocalIdent
  );
});

test("throws an error when we can't find file-loader in the webpack config", () => {
  let oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
  oneOfRule.oneOf = oneOfRule.oneOf.filter(
    (r) => !(r.loader && r.loader.includes("file-loader"))
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
    /^Can't find file-loader in the development webpack config!/
  );
});

test("throws an error when we can't find the oneOf rules in the webpack config", () => {
  let oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
  oneOfRule.oneOf = null;

  const runTest = () => {
    webpackConfig = overrideWebpackConfig(
      {
        plugins: [{ plugin: CracoLessPlugin }],
      },
      webpackConfig
    );
  };

  expect(runTest).toThrowError(
    /^Can't find a 'oneOf' rule under module.rules in the development webpack config!/
  );
});

test("throws an error when react-scripts adds an unknown webpack rule", () => {
  let oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
  const sassRule = oneOfRule.oneOf.find(styleRuleByName("scss|sass", false));
  sassRule.use.push({
    loader: "/path/to/unknown-loader/index.js",
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
    /^Found an unhandled loader in the development webpack config: \/path\/to\/unknown-loader\/index.js/
  );
});

test("throws an error when the sass rule is missing", () => {
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
    /^Can't find the webpack rule to match scss\/sass files in the development webpack config!/
  );
});

test("throws an error when the sass module rule is missing", () => {
  let oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
  let matchSassModuleRule = styleRuleByName("scss|sass", true);
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
    /^Can't find the webpack rule to match scss\/sass module files in the development webpack config!/
  );
});
