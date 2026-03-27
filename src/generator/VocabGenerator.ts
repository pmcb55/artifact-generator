import debug from "debug";
import rdf from "rdf-ext";
import type { DatasetCore, Quad } from "@rdfjs/types";

import { FileGenerator } from "./FileGenerator.js";
import { Resource } from "../Resource.js";
import { DatasetHandler } from "../DatasetHandler.js";
import { mergeDatasets } from "../Util.js";

const _debug = debug("artifact-generator:VocabGenerator");

export class VocabGenerator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vocabData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  artifactDetails: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  completeResource: any;

  constructor(artifactData, artifactDetails) {
    // Make sure we clone our input data (to keep it specific to our
    // instance!).
    this.vocabData = { ...artifactData };
    this.artifactDetails = artifactDetails;
  }

  generateFiles(vocabGenerationData) {
    _debug(
      `Generating source code for vocabulary: [${
        vocabGenerationData.vocabName
      }]${
        this.vocabData.nameAndPrefixOverride
          ? " (from name and prefix override)"
          : ""
      }...`,
    );

    if (
      vocabGenerationData.classes.length === 0 &&
      vocabGenerationData.properties.length === 0 &&
      vocabGenerationData.literals.length === 0 &&
      vocabGenerationData.constantIris.length === 0 &&
      vocabGenerationData.constantStrings.length === 0
    ) {
      // In this case, the resource was unreachable, and the source file
      // cannot be generated.
      if (
        FileGenerator.previouslyGeneratedFileExists(
          this.artifactDetails,
          vocabGenerationData,
        )
      ) {
        _debug(
          `A previously generated source file is being reused for resource [${this.vocabData.inputResources.toString()}], as its currently either unreachable or empty of recognisable terms for classes, properties, constants, etc. (e.g., no RDFS:Class, or RDF:Property, or SKOSXL:Label, etc. terms) from the namespace [${
            vocabGenerationData.namespaceIri
          }].`,
        );

        return vocabGenerationData;
      }

      throw new Error(
        `Resource [${this.vocabData.inputResources.toString()}] is unreachable or is empty of recognisable terms for classes, properties, constants, etc. (e.g., no RDFS:Class, or RDF:Property, or SKOSXL:Label, etc. terms) from the namespace [${
          vocabGenerationData.namespaceIri
        }], and no previously generated file is available.`,
      );
    }

    FileGenerator.createSourceCodeFile(
      this.vocabData,
      this.artifactDetails,
      vocabGenerationData,
    );

    return vocabGenerationData;
  }

  async generateVocab() {
    // A 'complete resource' can be made up from multiple input vocabularies,
    // with terms selectively chosen, and with various other configuration
    // settings.
    this.completeResource = new Resource(
      this.vocabData.inputResources,
      this.vocabData.termSelectionResource,
      this.vocabData.vocabAcceptHeaderOverride,
      this.vocabData.vocabContentTypeHeaderOverride,
      this.vocabData.vocabContentTypeHeaderFallback,
    );

    try {
      const plural = this.vocabData.inputResources.length !== 1;
      _debug(
        `Create [${
          this.artifactDetails.programmingLanguage
        }] resource using template [${
          this.artifactDetails.sourceCodeTemplate
        }] from input${
          plural ? "s" : ""
        }: [${this.vocabData.inputResources.join(", ")}]${
          this.vocabData.termSelectionResource
            ? " (with term selection from [" +
              this.vocabData.termSelectionResource +
              "])"
            : ""
        }`,
      );

      const vocabGenerationData = await this.generateData();

      this.generateFiles(vocabGenerationData);

      return vocabGenerationData;
    } catch (error) {
      const message = `Data generation for vocabs failed: [${error}].`;
      _debug(message);
      throw new Error(message);
    }
  }

  async generateData() {
    try {
      const { datasets, termsSelectionDataset } =
        await this.completeResource.processInputs(this.vocabData);

      return await this.parseDatasets(datasets, termsSelectionDataset);
    } catch (error) {
      const termSelection = this.vocabData.termSelectionResource
        ? ` and term selection input [${this.vocabData.termSelectionResource}]`
        : "";

      const result = `Failed to generate from input [${this.vocabData.inputResources.join(
        ", ",
      )}]${termSelection}: [${
        error.message
      }].\n\nStack: ${error.stack.toString()}`;
      throw new Error(result);
    }
  }

  parseDatasets(
    fullDatasetsArray: DatasetCore<Quad>[],
    termSelectionDataset: DatasetCore<Quad>,
  ) {
    return this.buildTemplateInput(
      mergeDatasets(fullDatasetsArray),
      termSelectionDataset || rdf.dataset(),
    );
  }

  buildTemplateInput(
    fullData: DatasetCore<Quad>,
    termSelectionDataset: DatasetCore<Quad>,
  ) {
    const datasetHandler = new DatasetHandler(
      fullData,
      termSelectionDataset,
      this.vocabData,
    );

    return datasetHandler.buildTemplateInput();
  }
}
