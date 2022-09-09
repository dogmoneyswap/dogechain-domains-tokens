const { writeFileSync } = require('fs');


const getHolders = async () => {
  const fetch = (await import('node-fetch')).default;

  const oasis = "0x3e79c89f479824bc24b9ead73eb8c55f322fe963";

  let holders = {};
  const hist = {1:[], 2: [], 3:[], 4:[], 5:[]};

  let registrations = [];

  for (let skip = 0; skip < 4000; skip +=1000) {
    const response = await fetch("https://graph.dogedomains.wf/subgraphs/name/graphprotocol/ens-dogechain", {
      "headers": {
        "accept": "application/json",
        "accept-language": "en-GB,en;q=0.9",
        "content-type": "application/json",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "Referer": "https://graph.dogedomains.wf/subgraphs/name/graphprotocol/ens-dogechain/graphql?query=%7B%0A%09registrations(first%3A1000%2C%20skip%3A0)%7B%0A%20%20%20%20domain%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20owner%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%20%20registrant%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%7D%0A%09%09cost%0A%20%20%20%20expiryDate%0A%20%20%20%20registrationDate%0A%20%20%7D%0A%7D",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": `{\"query\":\"{\\n\\tregistrations(first:1000, skip:${skip}){\\n    domain{\\n      name\\n      owner{\\n        id\\n      }\\n    }\\n    registrant{\\n      id\\n    }\\n\\t\\tcost\\n    expiryDate\\n    registrationDate\\n  }\\n}\",\"variables\":null,\"operationName\":null}`,
      "method": "POST"
    });

    const json = await response.json();
    registrations = [...registrations, ...json.data.registrations];
  }

  writeFileSync("./dnsRegistrations.json", JSON.stringify(registrations, null, 2))

  for (let registration of registrations) {
    const domain = registration.domain;
    const years = Math.round(1000 * (parseInt(registration.expiryDate) - parseInt(registration.registrationDate)) / 31556951) / 1000

    if (!domain.name?.endsWith(".doge")) {
      continue;
    }
    const parts = domain.name.split(".");
    if (parts.length > 2) {
      continue
    }

    const holderAddr = registration.registrant.id == oasis ? domain.owner.id : registration.registrant.id;

    if (!holders[holderAddr]) {
      holders[holderAddr] = { dns: 0, domains: 0, names: [] };
    }

    const name = parts[0];
    let length = [...new Intl.Segmenter().segment(name)].length;

    if (length != [...name].length) {
      // fix zwj names
      length = [...name].length;
      // console.log(name, length, holderAddr)
    }

    const factor = Math.min(5, length);
    holders[holderAddr].dns += +(years * 10 ** (5 - factor)).toFixed(3);
    holders[holderAddr].domains += 1;
    holders[holderAddr].names.push(name);

    hist[factor].push(name);
  }

  // exclude dns service account
  delete holders["0xb69d54a4e31f24afdd9eb1b53f8319ac83c646c9"];

  // console.log(holders);

  let dnsDistribution = Object.fromEntries(Object.entries(holders).map(([k, v]) => [k, v.dns]));
  dnsDistribution = Object.fromEntries(Object.entries(dnsDistribution).sort(([,a],[,b]) => b-a));
  // console.log(dnsDistribution);
  const nHolders = Object.entries(holders).length;
  console.log("Total unique holders: ", nHolders);
  const nDNS = Object.values(dnsDistribution).reduce((prev, curr) => prev + curr, 0)
  console.log("Total DNS to distribute: ", nDNS)

  writeFileSync("./dnsholders.json", JSON.stringify(dnsDistribution, null, 2));
  console.log(`Data saved to dnsholders.json`);
}

getHolders()
