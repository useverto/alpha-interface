import {
  fetchRootNode,
  getNode,
  traverseNodes,
} from "trackweave";

export async function getLatestNode(client, addr) {
  const root = fetchRootNode(client, {
    walletAddr: addr
  });

  const cache = JSON.parse(localStorage.getItem("cache"));
  const latestHeadId = cache[addr];

  const entryNode = (latestHeadId
    ? await getNode(client, { root, head: latestHeadId })
    : root) ?? root;

  // TODO(@zorbyte): Optimise this, it currently has complexity O(n).
  const allNodes = [entryNode];
  for await (const node of traverseNodes(client, {
    entryNode,
    amount: Infinity,
  })) allNodes.push(node);

  const latest = allNodes[allNodes.length - 1];

  cache[addr] = latest.head;
  localStorage.setItem("cache", JSON.stringify(cache));

  return latest;
}
