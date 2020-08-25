import {
  fetchRootNode,
  getNode,
  traverseNodes,
} from "trackweave";

export async function getLatestNode(client, addr) {
  const root = await fetchRootNode(client, {
    walletAddr: addr
  });

  let cache = JSON.parse(localStorage.getItem("cache"));
  const latestHeadId = cache && cache[addr];

  const entryNode = latestHeadId
    ? await getNode(client, { root, head: latestHeadId })
    : root;

  // TODO(@zorbyte): Optimise this, it currently has complexity O(n).
  const allNodes = [entryNode];
  for await (const node of traverseNodes(client, {
    entryNode,
    amount: Infinity,
  })) allNodes.push(node);

  const latest = allNodes[allNodes.length - 1];

  if (cache) {
    cache[addr] = latest.head;
  } else {
    cache = {
      [addr]: latest.head
    }
  }
  localStorage.setItem("cache", JSON.stringify(cache));

  return latest;
}
