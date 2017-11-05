/*
 * Simple SystemJS hook for Istanbul
 */
import istanbul = require('istanbul');
import remapIstanbul = require('remap-istanbul/lib/remap.js');
import fs = require('fs');
import path = require('path');

let istanbulGlobal;

let _originalSources = {};
exports.originalSources = _originalSources;

let filePrefixRExp;
if (/^win/.test(process.platform)) {
  // Windows adds the drive letter, so we must strip that too
  filePrefixRExp = /file:\/\/\/\w:\//;
}
else {
  filePrefixRExp = /file:\/\/\//;
}
function fromFileURL(url) {
  return url.replace(filePrefixRExp);
}

export function addCoverage(loader, exclude, coverageGlobal) {
  if (loader.translate.coverageAttached)
    return;

  if (coverageGlobal)
    istanbulGlobal = coverageGlobal;

  // attach istanbul coverage creation
  if (typeof global !== 'undefined' && !istanbulGlobal)
    for (let g in global) {
      if (g.match(/\$\$cov_\d+\$\$/)) {
        istanbulGlobal = g;
        break;
      }
    }
  istanbulGlobal = istanbulGlobal || '__coverage__';

  let instrumenter = new istanbul.Instrumenter({
    coverageletiable: istanbulGlobal
  });
  let esInstrumenter = new istanbul.Instrumenter({
    coverageletiable: istanbulGlobal,
    esModules: true
  });

  let loaderTranslate = loader.translate;
  loader.translate = function (load) {
    let originalSource = load.source;
    return loaderTranslate.apply(this, arguments)
      .then(function (source) {
        if (load.metadata.format === 'json' || load.metadata.format === 'defined' || load.metadata.loader && load.metadata.loaderModule.build === false)
          return source;

        // excludes
        if (exclude && exclude(load.address))
          return source;

        // automatically exclude sources outside the baseURL
        if (load.address.substr(0, SystemJS.baseURL!.length) !== SystemJS.baseURL)
          return source;

        let name = path.normalize(load.address.substr(SystemJS.baseURL!.length));

        _originalSources[name] = {
          source: originalSource,
          sourceMap: load.metadata.sourceMap
        };

        try {
          if (load.metadata.format === 'esm')
            return esInstrumenter.instrumentSync(source, name);
          else
            return instrumenter.instrumentSync(source, name);
        }
        catch (e) {
          let newErr = new Error('Unable to instrument "' + name + '" for istanbul.\n\t' + e.message);
          newErr.stack = 'Unable to instrument "' + name + '" for istanbul.\n\t' + e.stack;
          newErr['originalErr'] = e.originalErr || e;
          throw newErr;
        }
      });
  };
  loader.translate.coverageAttached = true;
}

export function remapCoverage(coverage, originalSources) {
  coverage = coverage || global[istanbulGlobal];
  originalSources = originalSources || _originalSources;
  let collector = remapIstanbul(coverage, {
    readFile: function (name) {
      return originalSources[name].source +
        (originalSources[name] && originalSources[name].sourceMap ? '\n//# sourceMappingURL=' + name.split(path.sep).pop() + '.map' : '');
    },
    readJSON: function (name) {
      let sourceFileName = name.substr(0, name.length - 4);
      let originalSourcesObj = originalSources[sourceFileName];
      // non transpilation-created source map -> load the source map file directly
      if (!originalSourcesObj || !originalSourcesObj.sourceMap)
        return JSON.parse(fs.readFileSync(fromFileURL(sourceFileName), 'utf8'));

      let sourceMap = originalSourcesObj.sourceMap;
      if (typeof sourceMap === 'string')
        sourceMap = JSON.parse(sourceMap);

      sourceMap.sourcesContent = sourceMap.sourcesContent || [];

      sourceMap.sources = sourceMap.sources.map((src, index) => {
        let sourcePath = path.relative(process.cwd(), path.resolve(path.dirname(name), sourceMap.sourceRoot || '.', src));
        if (originalSources[sourcePath] && !sourceMap.sourcesContent[index])
          sourceMap.sourcesContent[index] = originalSources[sourcePath].source;
        return sourcePath;
      });

      return sourceMap;
    },
    warn: function (msg) {
      if (msg.toString().indexOf('Could not find source map for') !== -1)
        return;
    }
  });
  coverage = collector.getFinalCoverage();
  Object.keys(coverage).forEach(function (key) {
    coverage[key].code = [coverage[key].code || originalSources[key].source];
  });
  return coverage;
};
