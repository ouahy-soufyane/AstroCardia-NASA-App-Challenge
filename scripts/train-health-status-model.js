import * as tf from '@tensorflow/tfjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const labels = ['Healthy', 'Attention', 'Critical'];
const astronauts = JSON.parse(await readFile(path.join(root, 'src', 'data', 'astronauts.json'), 'utf8'));
let seed = 20261115;
const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// These configurable example rules create synthetic labels. They are not medical standards.
function labelFor(v) {
  if (v.heartRate < 45 || v.heartRate > 120 || v.breathingFrequency < 8 || v.breathingFrequency > 30 || v.bodyTemperatureC < 35 || v.bodyTemperatureC > 39 || v.oxygenSaturation < 90 || v.systolicBloodPressure >= 160 || v.diastolicBloodPressure >= 100) return 'Critical';
  if (v.heartRate < 55 || v.heartRate > 100 || v.breathingFrequency < 10 || v.breathingFrequency > 22 || v.bodyTemperatureC < 36 || v.bodyTemperatureC > 37.8 || v.oxygenSaturation < 95 || v.systolicBloodPressure > 129 || v.diastolicBloodPressure > 84) return 'Attention';
  return 'Healthy';
}
const normalize = v => [v.heartRate / 140, v.breathingFrequency / 40, v.bodyTemperatureC / 42, v.oxygenSaturation / 100, v.systolicBloodPressure / 180, v.diastolicBloodPressure / 120];
const features = [];
const targets = [];
for (const person of astronauts) {
  for (let sample = 0; sample < 30; sample++) {
    const spread = sample === 0 ? 0 : 1;
    const variant = {
      heartRate: clamp(person.heartRate + (random() - .5) * 28 * spread, 35, 155),
      breathingFrequency: clamp(person.breathingFrequency + (random() - .5) * 12 * spread, 5, 42),
      bodyTemperatureC: clamp(person.bodyTemperatureC + (random() - .5) * 1.2 * spread, 34, 41),
      oxygenSaturation: clamp(person.oxygenSaturation + (random() - .5) * 10 * spread, 75, 100),
      systolicBloodPressure: clamp(person.systolicBloodPressure + (random() - .5) * 36 * spread, 85, 195),
      diastolicBloodPressure: clamp(person.diastolicBloodPressure + (random() - .5) * 24 * spread, 45, 125),
    };
    features.push(normalize(variant));
    const target = Array(3).fill(0);
    target[labels.indexOf(labelFor(variant))] = 1;
    targets.push(target);
  }
}

await tf.ready();
const xs = tf.tensor2d(features);
const ys = tf.tensor2d(targets);
const model = tf.sequential({ name: 'astrocardia-synthetic-health-status-demo' });
model.add(tf.layers.dense({ inputShape: [6], units: 16, activation: 'relu' }));
model.add(tf.layers.dense({ units: 10, activation: 'relu' }));
model.add(tf.layers.dense({ units: 3, activation: 'softmax' }));
model.compile({ optimizer: tf.train.adam(.01), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
const history = await model.fit(xs, ys, { epochs: 45, batchSize: 64, shuffle: true, validationSplit: .2, verbose: 0, classWeight: { 0: 1, 1: 2, 2: 2 } });
const values = history.history;
const accuracy = Number((values.val_accuracy ?? values.val_acc ?? values.accuracy ?? values.acc).at(-1));

const modelDir = path.join(root, 'public', 'models');
await mkdir(modelDir, { recursive: true });
const modelJsonPath = path.join(modelDir, 'health-status-model.json');
const weightsPath = path.join(modelDir, 'health-status-model.weights.bin');
await model.save(tf.io.withSaveHandler(async artifacts => {
  const parts = Array.isArray(artifacts.weightData) ? artifacts.weightData : [artifacts.weightData];
  const weightBytes = new Uint8Array(parts.reduce((sum, part) => sum + part.byteLength, 0));
  let offset = 0;
  for (const part of parts) { weightBytes.set(new Uint8Array(part), offset); offset += part.byteLength; }
  const modelTopology = artifacts.modelTopology;
  const weightSpecs = artifacts.weightSpecs ?? [];
  const jsonText = JSON.stringify({ format: 'layers-model', generatedBy: `TensorFlow.js ${tf.version.tfjs}`, convertedBy: null, modelTopology, weightsManifest: [{ paths: ['health-status-model.weights.bin'], weights: weightSpecs }] }, null, 2);
  await writeFile(modelJsonPath, `${jsonText}\n`, 'utf8');
  await writeFile(weightsPath, weightBytes);
  return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON', modelTopologyBytes: Buffer.byteLength(JSON.stringify(modelTopology)), weightSpecsBytes: Buffer.byteLength(JSON.stringify(weightSpecs)), weightDataBytes: weightBytes.byteLength } };
}));

const report = {
  model: 'Astrocardia synthetic health-status demo', library: `TensorFlow.js ${tf.version.tfjs}`,
  sourceRecords: astronauts.length, augmentedSyntheticRows: features.length, classes: labels,
  validationAccuracy: Number.isFinite(accuracy) ? Number(accuracy.toFixed(4)) : null, epochs: 45,
  trainingNote: 'Synthetic demonstration labels only. Not clinically validated. Not for diagnosis, medication, or treatment decisions.',
};
await writeFile(path.join(modelDir, 'training-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
xs.dispose(); ys.dispose(); model.dispose();
console.log(JSON.stringify(report, null, 2));
