/**
 * @license Copyright 2019 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert/strict';

import esbuild from 'esbuild';

import * as plugins from './esbuild-plugins.js';
import {LH_ROOT} from '../root.js';

const distDir = path.join(LH_ROOT, 'dist', 'dt-report-resources');
const bundleOutFile = `${distDir}/report-generator.mjs`;

/**
 * @param {string} name
 * @param {string} content
 */
function writeFile(name, content) {
  assert(content);
  fs.writeFileSync(`${distDir}/${name}`, content);
}

fs.rmSync(distDir, {recursive: true, force: true});
fs.mkdirSync(distDir, {recursive: true});

writeFile('report-generator.mjs.d.ts', 'export {}');

async function buildReportGenerator() {
  await esbuild.build({
    entryPoints: ['report/generator/report-generator.js'],
    outfile: bundleOutFile,
    bundle: true,
    minify: false,
    plugins: [
      plugins.umd('Lighthouse.ReportGenerator'),
      plugins.replaceModules({
        [`${LH_ROOT}/report/generator/flow-report-assets.js`]: 'export const flowReportAssets = {}',
      }),
      plugins.bulkLoader([
        plugins.partialLoaders.inlineFs({verbose: Boolean(process.env.DEBUG)}),
        plugins.partialLoaders.rmGetModuleDirectory,
      ]),
      plugins.ignoreBuiltins(),
    ],
  });
}

await buildReportGenerator();
