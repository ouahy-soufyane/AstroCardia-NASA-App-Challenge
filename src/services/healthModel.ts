import * as tf from '@tensorflow/tfjs';

export type DemoHealthStatus = 'Healthy' | 'Attention' | 'Critical';
export type ModelInput = {
  heartRate: number;
  breathing: number;
  temperature: number;
  oxygen: number;
  systolic: number;
  diastolic: number;
};

const labels: DemoHealthStatus[] = ['Healthy', 'Attention', 'Critical'];
let modelPromise: Promise<tf.LayersModel> | undefined;

function getModel() {
  if (!modelPromise) modelPromise = tf.loadLayersModel(`${import.meta.env.BASE_URL}models/health-status-model.json`);
  return modelPromise;
}

export async function predictDemoHealthStatus(values: ModelInput): Promise<DemoHealthStatus> {
  const model = await getModel();
  const input = tf.tensor2d([[
    values.heartRate / 140,
    values.breathing / 40,
    values.temperature / 42,
    values.oxygen / 100,
    values.systolic / 180,
    values.diastolic / 120,
  ]]);
  const output = model.predict(input) as tf.Tensor;
  try {
    const probabilities = output.dataSync();
    let best = 0;
    for (let index = 1; index < probabilities.length; index++) if (probabilities[index] > probabilities[best]) best = index;
    return labels[best];
  } finally {
    input.dispose();
    output.dispose();
  }
}
