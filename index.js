import axios from 'axios';
import chalk from 'chalk';
import dns from 'dns/promises';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const rl = readline.createInterface({ input, output });

const ascii = `
  █████╗ ██████╗ ███████╗██████╗ ███████╗██████╗ ██╗   ██╗
 ██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝██╔══██╗╚██╗ ██╔╝
 ███████║██████╔╝█████╗  ██████╔╝█████╗  ██████╔╝ ╚████╔╝ 
 ██╔══██║██╔═══╝ ██╔══╝  ██╔═══╝ ██╔══╝  ██╔═══╝   ╚██╔╝  
 ██║  ██║██║     ███████╗██║     ███████╗██║        ██║   
 ╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝     ╚══════╝╚═╝        ╚═╝
`;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function loadingAnimation(durationMs) {
  const frames = ['.', '..', '...'];
  const interval = 200;
  const iterations = Math.floor(durationMs / interval);
  for (let i = 0; i < iterations; i++) {
    process.stdout.write(chalk.cyan(`\r[~] Fetching data${frames[i % frames.length]} `));
    await wait(interval);
  }
  process.stdout.write('\r' + ' '.repeat(30) + '\r'); 
}

async function fetchIPInfo(ip) {
  try {
    const res = await axios.get(`http://ip-api.com/json/${ip}?fields=66846719`);
    return res.data;
  } catch {
    return null;
  }
}

function printInfo(info, query, resolvedIp = null) {
  console.clear();
  console.log(chalk.blueBright(ascii));
  console.log(chalk.cyan.bold(`[+] Query: ${query}`));
  if (resolvedIp) console.log(chalk.magenta(`[+] Resolved IP: ${resolvedIp}`));

  if (info && info.status === "success") {
    console.log(chalk.green('\n[+] IP Information:'));
    console.log(`${chalk.yellow('• Country:')} ${info.country} (${info.countryCode})`);
    console.log(`${chalk.yellow('• Region:')} ${info.regionName}`);
    console.log(`${chalk.yellow('• City:')} ${info.city}`);
    console.log(`${chalk.yellow('• ZIP:')} ${info.zip}`);
    console.log(`${chalk.yellow('• Latitude / Longitude:')} ${info.lat}, ${info.lon}`);
    console.log(`${chalk.yellow('• ISP:')} ${info.isp}`);
    console.log(`${chalk.yellow('• Org:')} ${info.org}`);
    console.log(`${chalk.yellow('• ASN:')} ${info.as}`);
    console.log(`${chalk.yellow('• Mobile:')} ${info.mobile ? 'Yes' : 'No'}`);
    console.log(`${chalk.yellow('• Proxy:')} ${info.proxy ? 'Yes' : 'No'}`);
    console.log(`${chalk.yellow('• Hosting:')} ${info.hosting ? 'Yes' : 'No'}`);
    console.log(`${chalk.yellow('• Timezone:')} ${info.timezone}`);
  } else {
    console.log(chalk.red('\n[!] Failed to fetch IP information.'));
  }
}

async function main() {
  console.clear();
  console.log(chalk.blueBright(ascii));
  while (true) {
    try {
      const inputQuery = await rl.question(chalk.cyan('\n[?] Enter an IP address or domain (CTRL+C to quit): '));

      let ipInfo, resolvedIp;

      if (/[a-zA-Z]/.test(inputQuery)) {
        try {
          const dnsRes = await dns.lookup(inputQuery);
          resolvedIp = dnsRes.address;
        } catch {
          console.log(chalk.red('[!] Failed to resolve domain.'));
          continue; 
        }
      }

      await loadingAnimation(2000);

      ipInfo = await fetchIPInfo(resolvedIp || inputQuery);

      printInfo(ipInfo, inputQuery, resolvedIp);

      await rl.question(chalk.gray('\nPress Enter to search another IP/domain...'));

      console.clear();
      console.log(chalk.blueBright(ascii));

    } catch (err) {
      console.log(chalk.red('\n[!] Unexpected error, exiting.'));
      rl.close();
      process.exit(1);
    }
  }
}

main();
