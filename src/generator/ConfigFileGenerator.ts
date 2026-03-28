import path from "path";
import moment from "moment";
import { FileGenerator } from "./FileGenerator.js";
import packageDotJson from "../../package.json" with { type: "json" };

import { fileURLToPath } from "url";
const _dirname = path.dirname(fileURLToPath(import.meta.url));

// Templates
const CONFIG_TEMPLATE_PATH = path.join(
  _dirname,
  "..",
  "..",
  "template",
  "empty-config.hbs",
);
export const DEFAULT_CONFIG_TEMPLATE_PATH = path.join(
  _dirname,
  "..",
  "..",
  "template",
  "initial-config.hbs",
);

export class ConfigFileGenerator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;

  constructor(initialConfig?) {
    this.config = {
      generatedTimestamp: moment().format("LLLL"),
      ...initialConfig,
      generatorName: packageDotJson.name,
      artifactGeneratorVersion: packageDotJson.version,
    };
  }

  /**
   * This function directly initializes the config object, and can be used
   * to generate the config file without prompting values.
   * @param {*} config
   */
  setConfig(config) {
    ConfigFileGenerator.validateConfig(config);
    this.config = config;
  }

  /**
   * Validates the specified configuration.
   */
  static validateConfig(config) {
    // Currently, we only check that some properties have been set
    if (Object.entries(config).length === 0) {
      throw new Error(
        `Invalid configuration: [${config}] cannot be used to generate the configuration YAML file.`,
      );
    }
  }

  /**
   * Generates a config file using the data in the config attribute of the current object.
   * This attribute should previously have been set directly by the application.

   * @param {string} targetPath the path to the generated file
   */
  generateConfigFile(targetPath) {
    ConfigFileGenerator.validateConfig(this.config);
    FileGenerator.createFileFromTemplate(
      CONFIG_TEMPLATE_PATH,
      this.config,
      targetPath,
    );
  }

  /**
   * Generates a default config file, relying on no input from the user.

   * @param {string} targetPath the path to the generated file
   */
  generateDefaultConfigFile(targetPath) {
    // 'this.config' is required here because it contains contextual information
    // provided by the global app context, such as time of generation or app version.
    FileGenerator.createFileFromTemplate(
      DEFAULT_CONFIG_TEMPLATE_PATH,
      this.config,
      targetPath,
    );
  }
}
