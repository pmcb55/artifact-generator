import "mock-local-storage";
import fs from "fs";
import path from "path";
import { ConfigFileGenerator } from "./ConfigFileGenerator.js";
import packageDotJson from "../../package.json" with { type: "json" };

const OUTPUT_DIR = "test/Generated/UNIT_TEST/ConfigFileGenerator/";
const REFERENCE_YAML_PROMPTED =
  "./test/resources/expectedOutput/sample-vocab.yml";
const REFERENCE_YAML_DEFAULT =
  "./test/resources/expectedOutput/default-sample-vocab.yml";

// Config components
const ARTIFACT_NAME = "myNewArtifact";
const COMPLETE_JAVA_ARTIFACT = {
  languageKeywordsToUnderscore: ["class", "abstract", "default", "this"],
  templateInternal: path.join(
    "solidCommonVocabDependent",
    "java",
    "rdf4j",
    "vocab.hbs",
  ),
  sourceFileExtension: "java",
  artifactDirectoryName: "Java",
  programmingLanguage: "Java",
  artifactVersion: "0.1.0",
  artifactNamePrefix: "",
  artifactNameSuffix: "",
  solidCommonVocabVersion: "0.1.0-SNAPSHOT",
  javaPackageName: "com.example.java.packagename",
};

const COMPLETE_VOCAB = {
  inputResources: ["./test/resources/vocab/schema-snippet.ttl"],
  nameAndPrefixOverride: "schema",
  descriptionFallback: "An example vocabulary",
  termSelectionFile: "",
};

const COMPLETE_CONFIG = {
  artifactName: ARTIFACT_NAME,
  generatorName: "@inrupt/artifact-generator",
  artifactGeneratorVersion: packageDotJson.version,
  generatedTimestamp: "January 1, 2000 00:00 AM",
  artifactToGenerate: [COMPLETE_JAVA_ARTIFACT],
  vocabList: [COMPLETE_VOCAB],
};

const SAMPLE_CONFIG = {
  artifactName: ARTIFACT_NAME,
  artifactToGenerate: [],
  vocabList: [],
};

const INVALID_CONFIG = {};

describe("ConfigFile Generator", () => {
  it("should not validate empty configs", () => {
    expect(() => {
      ConfigFileGenerator.validateConfig(INVALID_CONFIG);
    }).toThrow("Invalid configuration");
    expect(() => {
      ConfigFileGenerator.validateConfig(SAMPLE_CONFIG);
    }).not.toThrow();
  });

  it("should fail when trying to set an invalid config", () => {
    const configGenerator = new ConfigFileGenerator();
    expect(() => {
      configGenerator.setConfig(INVALID_CONFIG);
    }).toThrow("Invalid configuration");
  });

  it("should fail when using an invalid config at generation time", () => {
    const targetPath = path.join(OUTPUT_DIR, "vocab-list.yml");
    const configGenerator = new ConfigFileGenerator();
    configGenerator.config = INVALID_CONFIG;
    expect(() => {
      configGenerator.generateConfigFile(targetPath);
    }).toThrow("Invalid configuration");
  });

  it("should use the provided config", () => {
    const configGenerator = new ConfigFileGenerator();
    configGenerator.setConfig(SAMPLE_CONFIG);
    expect(configGenerator.config).toEqual(SAMPLE_CONFIG);
  });

  it("should generate a complete file when directly setting the config", () => {
    const targetPath = path.join(OUTPUT_DIR, "vocab-list-set.yml");
    const configGenerator = new ConfigFileGenerator();
    configGenerator.setConfig(COMPLETE_CONFIG);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    configGenerator.generateConfigFile(targetPath);
    expect(fs.existsSync(targetPath)).toEqual(true);
    expect(fs.readFileSync(targetPath).toString()).toContain(
      fs.readFileSync(REFERENCE_YAML_PROMPTED).toString(),
    );
  });

  it("should generate a default file even with an empty config", () => {
    const targetPath = path.join(OUTPUT_DIR, "vocab-list-empty.yml");
    const configGenerator = new ConfigFileGenerator({});
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    configGenerator.generateDefaultConfigFile(targetPath);
    expect(fs.existsSync(targetPath)).toEqual(true);
    expect(fs.readFileSync(targetPath).toString()).toContain(
      fs.readFileSync(REFERENCE_YAML_DEFAULT).toString(),
    );
  });
});
