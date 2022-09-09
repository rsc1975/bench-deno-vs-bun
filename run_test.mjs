
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

if (!process.env.PLATFORM) {
  console.error('A "PLATFORM" var env should be specified');
  process.exit(-1);
}

const getHardware = () => {
  const cpus = os.cpus();
  const cores = cpus.length;
  const model = cpus[0].model;
  const arch = os.arch();
  const mem = `${(os.totalmem() / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  const opsys = `${os.platform()} ${os.release()}`;
  return { mem, arch, model, cores, os: opsys };
}

const savePlatformData = () => {
  const hw = getHardware();
  let newData = {};
  const filepath = path.join('.', 'public', `platform.json`);
  try {
    const existingPlatform = fs.readFileSync(filepath, { encoding: 'utf8' });
    newData = JSON.parse(existingPlatform);
  } catch (e) {
    // Ignored
  }
  newData.hardware = hw;
  newData[process.env.PLATFORM.toLowerCase()] = process.env.VERSION;
  newData.timestamp = new Date().toISOString();
  fs.writeFileSync(filepath, JSON.stringify(newData, null, 2));
}

const getCommands = () => {
  const data = fs.readFileSync('./commands.json', { encoding: 'utf8' });
  const cmds = JSON.parse(data);
  return cmds.order.filter(c => cmds.commands[c]).map(c => cmds.commands[c]);
}


const saveChartFiles = (allChartsData) => {
  const charts = ['requests', 'latency', 'throughput'];
  const platform = process.env.PLATFORM.toLowerCase();
  for (const chartName of charts) {
    const filepath = path.join('public', `${chartName}.json`);
    let chartData = {};
    try {
      const oldData = fs.readFileSync(filepath, { encoding: 'utf8' });
      chartData = { ...JSON.parse(oldData) };
    } catch (e) {
      const tpl = fs.readFileSync(path.join('tpl', 'chart.json'), { encoding: 'utf8' });
      const tplData = JSON.parse(tpl);
      chartData = { ...tplData };
    }
    chartData.labels = allChartsData.labels;
    const dataset = chartData.datasets.find((ds) => ds.label.toLowerCase() === platform);
    dataset.data = allChartsData[chartName];

    fs.writeFileSync(filepath, JSON.stringify(chartData, null, 2), { encoding: 'utf8' });
  }

}
// oha -j -z 5s -c 200 'http://localhost:3003/api/base/64/encode?text=Lorem%20ipsum%20dolor%20sit%20amet&_pretty=1' --no-tui -m POST -d "{...}"
async function testCommand(urlBase, command) {
  console.log(`Command: ${command.label}, wait for 5 secs...`);
  const body = command.body && JSON.stringify(command.body);
  const bodyParam = body ? `-d '${body}' -H "content-type: application/json"` : '';
  const method = command.method || 'GET';
  const url = `${urlBase}${command.urlPath}`;
  const ohaParams = `-j -z 5s -c 200 --no-tui -m ${method} ${bodyParam}`;
  const ohaCmd = `oha ${ohaParams} '${url}'`;
  console.log('Executing:', ohaCmd)
  const { stdout, stderr } = await execAsync(ohaCmd);
  if (stderr) {
    console.error(stderr);
    throw new Error('Error calling: ' + stderr);
  }

  const result = JSON.parse(stdout);
  const summary = {
    label: command.label,
    url: url,
    errors: 1.0 - result.summary.successRate,
    latency: result.summary.average * 1000,
    requests: result.summary.requestsPerSec,
    throughput: (result.summary.sizePerSec / (1024 * 1024))
  }

  console.log(' - Errors:', summary.errors);
  console.log(' - Latency (ms/req):', summary.latency.toFixed(2));
  console.log(' - Average (req/sec):', summary.requests.toFixed(0));
  console.log(' - Throughput (MB/sec):', summary.throughput.toFixed(2));
  return summary;
}

// ------------------------------------------
// |   Main execution:                      |
// ------------------------------------------
savePlatformData();
const urlBase = process.env.URL_BASE || 'http://localhost:3003';

const commands = getCommands();


console.log(`Ready to test ${commands.length} commands:`);
console.log(`=======================================`);

const stats = {
  labels: commands.map(c => c.label),
  latency: [],
  requests: [],
  throughput: [],
}

for (const cmd of commands) {
  const cmdResult = await testCommand(urlBase, cmd);
  stats.latency.push(cmdResult.latency);
  stats.requests.push(cmdResult.requests);
  stats.throughput.push(cmdResult.throughput);
}
saveChartFiles(stats);

console.log('All tests finished.');
