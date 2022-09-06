
//Same as run_test.mjs but for Deno

import { join } from "https://deno.land/std@0.152.0/path/mod.ts";
import * as os from "https://deno.land/std@0.152.0/node/os.ts";
const { exit, readFileSync, writeFileSync, env } = Deno;

const b2s = (data: Uint8Array) : string => new TextDecoder().decode(data);
const s2b = (data: string) : Uint8Array => new TextEncoder().encode(data);

if (!env.get('PLATFORM')) {
  console.error('A "PLATFORM" var env should be specified');
  exit(-1);
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
  let newData : Record<string, any> = {};
  const filepath = join('.', 'public', `platform.json`);
  try {
    
    const existingPlatform = b2s(readFileSync(filepath));
    newData = JSON.parse(existingPlatform);
  } catch (e) {
    // Ignored
  }
  newData.hardware = hw;
  newData[env.get('PLATFORM')!.toLowerCase()] = env.get('VERSION');
  newData.timestamp = new Date().toISOString();
  writeFileSync(filepath, s2b(JSON.stringify(newData, null, 2)));
}

const getCommands = () => {
  const data = b2s(readFileSync('./commands.json'));
  const cmds = JSON.parse(data);
  return cmds.order.filter((c:string) => cmds.commands[c]).map((c:string) => cmds.commands[c]);
}


const saveChartFiles = (allChartsData: any) => {
  const charts = ['requests', 'latency', 'throughput'];
  const platform = env.get('PLATFORM')!.toLowerCase();
  for (const chartName of charts) {
    const filepath = join('public', `${chartName}.json`);
    let chartData : Record<string, any> = {};
    try {
      const oldData = b2s(readFileSync(filepath));
      chartData = { ...JSON.parse(oldData) };
    } catch (e) {
      const tpl = b2s(readFileSync(join('tpl', 'chart.json')));
      const tplData = JSON.parse(tpl);
      chartData = { ...tplData };
    }
    chartData.labels = allChartsData.labels;
    const dataset = chartData.datasets.find((ds: any) => ds.label.toLowerCase() === platform);
    dataset.data = allChartsData[chartName];

    writeFileSync(filepath, s2b(JSON.stringify(chartData, null, 2)));
  }

}
// oha -j -z 5s -c 200 'http://localhost:3003/api/base/64/encode?text=Lorem%20ipsum%20dolor%20sit%20amet&_pretty=1' --no-tui -m POST -d "{...}"
async function testCommand(urlBase: string, command: any) {
  console.log(`Command: ${command.label}, wait for 5 secs...`);
  const body = command.body && JSON.stringify(command.body);
  const bodyParam = body ? [`-d'${body}'`, "-H'content-type: application/json'"] : [];
  const method = command.method || 'GET';
  const url = `${urlBase}${command.urlPath}`;
  const ohaParams = ['-j', '-z5s', '-c200', '--no-tui', `-m${method}`, ...bodyParam];
   
  const ohaCmd = ['oha', ...ohaParams, url];
  console.log('Executing:', ohaCmd.join(' '));
  const p = Deno.run({ cmd: ohaCmd, stderr: "piped", stdout: "piped"});
  const status = await p.status();

  if (!status.success) {
    const rawError = await p.stderrOutput();
    const errorString = new TextDecoder().decode(rawError);
    console.log(errorString);
    throw new Error('Error calling: ' + ohaCmd);
  }

  const rawOutput = await p.output();
  const result = JSON.parse(new TextDecoder().decode(rawOutput));

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
const urlBase = env.get('URL_BASE') || 'http://localhost:3003';

const commands = getCommands();

console.log(`Ready to test ${commands.length} commands:`);
console.log(`=======================================`);

type TestStat = {
  labels: string[];
  latency: number[];
  requests: number[];
  throughput: number[];
}
const stats = <TestStat>{
  labels: commands.map((c:any) => c.label),
  latency: [],
  requests: [],
  throughput: [],
}

for (const cmd of commands) {
  const cmdResult : any = await testCommand(urlBase, cmd);
  stats.latency.push(cmdResult.latency);
  stats.requests.push(cmdResult.requests);
  stats.throughput.push(cmdResult.throughput);
}
saveChartFiles(stats);

console.log('All tests finished.');


