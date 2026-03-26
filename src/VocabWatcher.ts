import moment from "moment";
import chokidar, { FSWatcher } from "chokidar";
import { clearResourceFromCache } from "./Resource.js";
import debug from "debug";
import type { ArtifactGenerator } from "./generator/ArtifactGenerator.js";

const _debug = debug("artifact-generator:VocabWatcher");

export class VocabWatcher {
  countFailedGeneration: number;
  generator: ArtifactGenerator;
  configFile: string;
  watchedResourceList: string[];
  watcher: FSWatcher;

  constructor(generator) {
    this.countFailedGeneration = 0;

    this.generator = generator;
    // The watcher overrides the configuration to be no prompt by default
    this.generator.configuration.configuration.noPrompt = true;

    this.configFile = this.generator.configuration.configuration.vocabListFile;
    _debug(`Watching local resources from [${this.configFile}]:`);

    // Filter out the HTTP resource (since Chokidar only watches files), and
    // ensure we add the configuration file itself to the list of watched
    // resources.
    let count = 0;
    const watchedResourceList = [this.configFile];
    this.generator.configuration
      .getInputResources()
      .forEach(function (element) {
        if (!element.toLowerCase().startsWith("http")) {
          watchedResourceList.push(element);
          _debug(`  ${++count}) ${element}`);
        }
      });

    this.watchedResourceList = watchedResourceList;
    this.watcher = chokidar.watch(this.watchedResourceList, {
      persistent: true,
    });
  }

  getWatchedResourceList() {
    return this.watchedResourceList;
  }

  async watch() {
    // chokidar can't watch online resources, and so we won't ever get an
    // event if an online resource changes. Therefore we need to poll online
    // resources periodically, checking their last-modified response header to
    // determine if an online vocabulary has changed.
    // TODO: Right now, online vocabs are checked only once.
    _debug(
      `Generating (if any changes, or --force option specified) from config file [${this.configFile}] into watched directory: [${this.generator.configuration.configuration.outputDirectory}]...`,
    );
    await this.generator
      .generate()
      .then((result) => {
        _debug(
          `Successfully watching [${this.watchedResourceList.length}] resources from directory: [${result.outputDirectory}] - [${result.globMatchPosition} of ${result.globMatchTotal} matched config files].`,
        );
      })
      .catch((error) => {
        const message = `Problem generating when initializing watcher: ${error}`;
        _debug(message);
        throw new Error(message);
      });

    // Add event listeners.
    this.watcher.on("change", async (eventPath) => {
      // Triggers the generation when the file changes
      _debug(`*****************************************************`);
      _debug(
        `File [${eventPath}] has changed at [${moment().format(
          "LLLL",
        )}], regenerating...`,
      );

      // If the changed file was a configuration file, then force the
      // re-generation of all resources (but make sure to restore the force flag
      // afterwards).
      const originalForce = this.generator.configuration.configuration.force;
      if (
        eventPath.toLowerCase().endsWith(".yml") ||
        eventPath.toLowerCase().endsWith(".yaml")
      ) {
        this.generator.configuration.configuration.force = true;
      }

      // We know this resource has changed, so make sure we remove it from our
      // cache first...
      clearResourceFromCache(eventPath);

      await this.generator
        .generate()
        .then(() => {
          _debug(
            `...completed regeneration after file [${eventPath}] changed at [${moment().format(
              "LLLL",
            )}].`,
          );
        })
        .catch((error) => {
          this.countFailedGeneration += 1;
          _debug(
            `Failed generation (possibly due to a typo or RDF syntax error when editing) for file [${eventPath}]. Generation fail count [${this.countFailedGeneration}]. Error: ${error}`,
          );
        })
        .finally(() => {
          _debug(`*****************************************************`);
          this.generator.configuration.configuration.force = originalForce;
        });
    });
  }

  async unwatch() {
    await this.watcher.close();
  }
}
