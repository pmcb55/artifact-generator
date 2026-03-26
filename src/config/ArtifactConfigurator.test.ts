import "mock-local-storage";
import { jest } from "@jest/globals";
import inquirer from "inquirer";
import path from "path";
import { fileURLToPath } from "url";
import { ArtifactConfigurator } from "./ArtifactConfigurator.js";
import {
  JavaArtifactConfigurator,
  LANGUAGE as JAVA,
} from "./artifact/JavaArtifactConfigurator.js";
import {
  NodeArtifactConfigurator,
  LANGUAGE as JAVASCRIPT,
} from "./artifact/NodeArtifactConfigurator.js";

jest.mock("inquirer", () => ({
  __esModule: true,
  default: { prompt: jest.fn() },
}));

const _dirname = path.dirname(fileURLToPath(import.meta.url));

const DUMMY_JAVA_ARTIFACT = {
  artifactVersion: "0.0.1",
  solidCommonVocabVersion: "0.1.0-SNAPSHOT",
  javaPackageName: "com.example.dummy.packagename",
};

const DUMMY_JS_ARTIFACT = {
  artifactVersion: "1.0.1",
  npmModuleScope: "@example",
};

const DUMMY_MAVEN_ARTIFACT = {
  ...DUMMY_JAVA_ARTIFACT,
  groupId: "org.some.groupId",
  publishCommand: "mvn install",
  template: path.join(
    _dirname,
    "..",
    "template",
    "solidCommonVocabDependent",
    "java",
    "rdf4j",
    "pom.hbs",
  ),
};

const UNSUPPORTED_CONFIG_PROMPT = jest.fn().mockReturnValue(
  Promise.resolve({
    ...DUMMY_MAVEN_ARTIFACT,
    packagingToInit: ["someSystem"],
  }),
);

describe("Artifact Configurator tests", () => {
  it("should throw when calling prompt from base class", async () => {
    expect(new ArtifactConfigurator().prompt()).rejects.toThrow(
      "Unspecified artifact generator",
    );

    await expect(
      new ArtifactConfigurator().promptPackaging([]),
    ).resolves.toBeUndefined();
  });

  it("should use the values provided by the user", async () => {
    jest
      .mocked(inquirer.prompt)
      .mockImplementation(
        jest.fn().mockReturnValue(Promise.resolve(DUMMY_JAVA_ARTIFACT)),
      );
    const artifact = await new JavaArtifactConfigurator().prompt();
    expect(artifact.javaPackageName).toEqual(
      DUMMY_JAVA_ARTIFACT.javaPackageName,
    );
  });

  it("should use default values provided by the implementations", async () => {
    jest
      .mocked(inquirer.prompt)
      .mockImplementation(
        jest.fn().mockReturnValue(Promise.resolve(DUMMY_JAVA_ARTIFACT)),
      );
    const javaArtifact = new JavaArtifactConfigurator();
    await javaArtifact.prompt();
    expect(javaArtifact.language).toEqual(JAVA);
    expect(javaArtifact.config.artifactVersion).toEqual(
      DUMMY_JAVA_ARTIFACT.artifactVersion,
    );
    jest
      .mocked(inquirer.prompt)
      .mockImplementation(
        jest.fn().mockReturnValue(Promise.resolve(DUMMY_JS_ARTIFACT)),
      );

    const jsArtifact = new NodeArtifactConfigurator();
    await jsArtifact.prompt();
    expect(jsArtifact.language).toEqual(JAVASCRIPT);
    expect(jsArtifact.config.artifactVersion).toEqual(
      DUMMY_JS_ARTIFACT.artifactVersion,
    );
  });
});

export { UNSUPPORTED_CONFIG_PROMPT };
