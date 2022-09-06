import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

const { stdout, stderr } = await execAsync('ls -ltrh');

console.log('OUT:', stdout);
console.log('ERR:', stderr);