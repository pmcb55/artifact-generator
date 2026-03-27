import path from "path";
import type { DatasetCore, Quad } from "@rdfjs/types";
import rdf from "rdf-ext";

import {
  INRUPT_BEST_PRACTICE_NAMESPACE,
  INRUPT_BEST_PRACTICE_NAMESPACE_PREFIX,
} from "./CommonTerms.js";

// TODO: Consider moving these functions into 'GeneratorConfiguration.js'
//  instead. The code was put here due to cyclic dependency problems when it was
//  in'ArtifactGenerator.js', but 'GeneratorConfiguration.js' seems like it
//  might be a cleaner place for these.
export const DEFAULT_DIRECTORY_ROOT = "/Generated";
export const DEFAULT_DIRECTORY_SOURCE_CODE = "SourceCodeArtifacts";

export function getArtifactDirectoryRoot(options?: {
  artifactDirectoryRootOverride?: string;
}): string {
  return options && options.artifactDirectoryRootOverride
    ? options.artifactDirectoryRootOverride
    : DEFAULT_DIRECTORY_ROOT;
}

export function getArtifactDirectorySourceCode(options?: {
  artifactDirectoryRootOverride?: string;
}): string {
  return path.join(
    getArtifactDirectoryRoot(options),
    DEFAULT_DIRECTORY_SOURCE_CODE,
  );
}

// Normalizes the specified resource location if it's a file path (e.g.,
// '/a/b/c/../../d' would be normalized to '/a/d'), but if it refers to an
// HTTP resource, we just return the value as-is.
function normalizeIfFilePath(resource: string): string {
  return resource && !resource.startsWith("http")
    ? path.normalize(resource)
    : resource;
}

export function describeInput(artifactInfo) {
  return artifactInfo.vocabListFile
    ? `vocab list file: [${artifactInfo.vocabListFile}]`
    : `input${
        artifactInfo.inputResources.length === 1 ? "" : "s"
      }: [${artifactInfo.inputResources.join(", ")}]`;
}

export function describeTemplateVocab(artifactInfo) {
  return artifactInfo.artifactToGenerate
    ? `Source code template file: [${artifactInfo.artifactToGenerate[0].sourceCodeTemplate}].`
    : `No artifact to generate`;
}

// Build a DatasetCore from one or more Quad iterables (arrays, datasets, etc.).
export function datasetFrom(...iterables: Iterable<Quad>[]): DatasetCore<Quad> {
  const ds = rdf.dataset();
  for (const iter of iterables) {
    for (const quad of iter) {
      ds.add(quad);
    }
  }
  return ds;
}

export function mergeDatasets(
  dataSetArray: DatasetCore<Quad>[],
): DatasetCore<Quad> {
  const fullData = rdf.dataset();
  dataSetArray.forEach((dataset: DatasetCore<Quad>) => {
    for (const quad of dataset) {
      fullData.add(quad);
    }
  });

  return fullData;
}

export function curie(iri: string): string {
  if (iri.startsWith(INRUPT_BEST_PRACTICE_NAMESPACE)) {
    return `${INRUPT_BEST_PRACTICE_NAMESPACE_PREFIX}:${iri.substring(
      INRUPT_BEST_PRACTICE_NAMESPACE.length,
    )}`;
  }

  return iri;
}

export const normalizePath = normalizeIfFilePath;
