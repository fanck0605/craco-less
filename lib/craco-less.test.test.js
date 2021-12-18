const { createJestConfig } = require("@craco/craco");
const { processCracoConfig } = require("@craco/craco/lib/config");
const { applyJestConfigPlugins } = require("@craco/craco/lib/features/plugins");
const clone = require("clone");
const CracoLessPlugin = require("./craco-less");
const { getCracoContext } = require("./test-utils");

process.env.NODE_ENV = "test";

const baseCracoConfig = {};
const cracoContext = getCracoContext(baseCracoConfig);
const originalJestConfig = createJestConfig(baseCracoConfig);

const overrideJestConfig = (callerCracoConfig, jestConfig) => {
  return applyJestConfigPlugins(
    processCracoConfig({
      ...baseCracoConfig,
      ...callerCracoConfig,
    }),
    jestConfig,
    cracoContext
  );
};

let jestConfig;
beforeEach(() => {
  // deep clone the object before each test.
  jestConfig = clone(originalJestConfig);
});

test("the jest config is modified correctly", () => {
  jestConfig = overrideJestConfig(
    {
      plugins: [{ plugin: CracoLessPlugin }],
    },
    jestConfig
  );

  const moduleNameMapper = jestConfig.moduleNameMapper;
  expect(moduleNameMapper["^.+\\.module\\.(css|sass|scss)$"]).toBeUndefined();
  expect(moduleNameMapper["^.+\\.module\\.(css|less|sass|scss)$"]).toEqual(
    "identity-obj-proxy"
  );

  const transformIgnorePatterns = jestConfig.transformIgnorePatterns;
  expect(transformIgnorePatterns[1]).toEqual(
    "^.+\\.module\\.(css|less|sass|scss)$"
  );
});

test("throws an error when we can't find CSS Modules pattern under moduleNameMapper in the jest config", () => {
  delete jestConfig.moduleNameMapper["^.+\\.module\\.(css|sass|scss)$"];

  const runTest = () => {
    overrideJestConfig(
      {
        plugins: [{ plugin: CracoLessPlugin }],
      },
      jestConfig
    );
  };

  expect(runTest).toThrowError(
    "Can't find CSS Modules pattern under moduleNameMapper in the test jest config!\n\n" +
      "This error probably occurred because you updated react-scripts or craco. " +
      "Please try updating craco-less to the latest version:\n\n" +
      "   $ yarn upgrade craco-less\n\n" +
      "Or:\n\n" +
      "   $ npm update craco-less\n\n" +
      "If that doesn't work, craco-less needs to be fixed to support the latest version.\n" +
      "Please check to see if there's already an issue in the DocSpring/craco-less repo:\n\n" +
      "   * https://github.com/DocSpring/craco-less/issues?q=is%3Aissue+jest+moduleNameMapper+css\n\n" +
      "If not, please open an issue and we'll take a look. (Or you can send a PR!)\n\n" +
      "You might also want to look for related issues in the " +
      "craco and create-react-app repos:\n\n" +
      "   * https://github.com/sharegate/craco/issues?q=is%3Aissue+jest+moduleNameMapper+css\n" +
      "   * https://github.com/facebook/create-react-app/issues?q=is%3Aissue+jest+moduleNameMapper+css\n"
  );
});

test("throws an error when we can't find CSS Modules pattern under transformIgnorePatterns in the jest config", () => {
  jestConfig.transformIgnorePatterns =
    jestConfig.transformIgnorePatterns.filter(
      (e) => e !== "^.+\\.module\\.(css|sass|scss)$"
    );

  const runTest = () => {
    overrideJestConfig(
      {
        plugins: [{ plugin: CracoLessPlugin }],
      },
      jestConfig
    );
  };

  expect(runTest).toThrowError(
    "Can't find CSS Modules pattern under transformIgnorePatterns in the test jest config!\n\n" +
      "This error probably occurred because you updated react-scripts or craco. " +
      "Please try updating craco-less to the latest version:\n\n" +
      "   $ yarn upgrade craco-less\n\n" +
      "Or:\n\n" +
      "   $ npm update craco-less\n\n" +
      "If that doesn't work, craco-less needs to be fixed to support the latest version.\n" +
      "Please check to see if there's already an issue in the DocSpring/craco-less repo:\n\n" +
      "   * https://github.com/DocSpring/craco-less/issues?q=is%3Aissue+jest+transformIgnorePatterns+css\n\n" +
      "If not, please open an issue and we'll take a look. (Or you can send a PR!)\n\n" +
      "You might also want to look for related issues in the " +
      "craco and create-react-app repos:\n\n" +
      "   * https://github.com/sharegate/craco/issues?q=is%3Aissue+jest+transformIgnorePatterns+css\n" +
      "   * https://github.com/facebook/create-react-app/issues?q=is%3Aissue+jest+transformIgnorePatterns+css\n"
  );
});
