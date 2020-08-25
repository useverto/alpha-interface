/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function equals(expr1, expr2) {
    return { op: 'equals', expr1, expr2 };
}
function or(...exprs) {
    if (exprs.length == 0) {
        throw new Error('0 arguments pass to or()');
    }
    if (exprs.length == 1) {
        return exprs[0];
    }
    const op = {
        op: 'or',
        expr1: exprs.shift(),
        expr2: exprs.length > 1 ? or(...exprs) : exprs[0]
    };
    return op;
}
function and(...exprs) {
    if (exprs.length == 0) {
        throw new Error('0 arguments pass to and()');
    }
    if (exprs.length == 1) {
        return exprs[0];
    }
    const op = {
        op: 'and',
        expr1: exprs.shift(),
        expr2: exprs.length > 1 ? and(...exprs) : exprs[0]
    };
    return op;
}

function invertObj(obj) {
    return Object.entries(obj).reduce((res, entry) => {
        const [key, value] = entry;
        res[value] = key;
        return res;
    }, {});
}
function genTargetWalletOps(walletAddr, walletDirs) {
    const walletOps = walletDirs.map((dir) => equals(dir, walletAddr));
    return walletDirs.length > 1 ? [or(...walletOps)] : walletOps;
}

function mapTagsToValues(tagMap, tags) {
    const mapped = { otherTags: {} };
    const inverted = getInverted(tagMap);
    for (const [key, value] of Object.entries(tags)) {
        const mappableKey = inverted[key];
        if (mappableKey) {
            mapped[mappableKey] = value;
        }
        else {
            mapped.otherTags[key] = value;
        }
    }
    return mapped;
}
function mapValuesToTags(tagMap, node) {
    var _a, _b;
    let result = {};
    const { otherTags = {} } = node;
    for (const [key, value] of Object.entries(node)) {
        const resultKey = tagMap[key];
        if (!resultKey)
            continue;
        result[resultKey] = (_b = (_a = value === null || value === void 0 ? void 0 : value.toString) === null || _a === void 0 ? void 0 : _a.call(value)) !== null && _b !== void 0 ? _b : `${value}`;
    }
    result = Object.assign(Object.assign({}, result), otherTags);
    return result;
}
function fetchTags(client, txId) {
    return __awaiter(this, void 0, void 0, function* () {
        const { status, statusText, data } = yield client.api.get(`tx/${txId}/tags`);
        if (status >= 300)
            throw new Error(`${status}: ${statusText}`);
        const tags = Object.fromEntries(data.map((rawTag) => [
            client.utils.b64UrlToString(rawTag.name),
            client.utils.b64UrlToString(rawTag.value),
        ]));
        return tags;
    });
}
const invertedTagMaps = new WeakMap();
function getInverted(tagMap) {
    let inverted = invertedTagMaps.get(tagMap);
    if (!inverted) {
        inverted = invertObj(tagMap);
        invertedTagMaps.set(tagMap, inverted);
    }
    return inverted;
}

const ROOT_NODE_TAG_MAP = {
    type: "RDT-Type",
    majorVersion: "RDT-Major-Version",
    root: "Root-Id",
    createdAt: "Created-At",
    tail: "Tail-Node",
    head: "Head-Node",
};
function fetchRootNode(client, { abstractNode, walletAddr, walletDirs = ["to", "from"], tags, }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!abstractNode && !walletAddr) {
            throw new TypeError("Insufficient arguments: abstractNode and/or walletAddr must be provided");
        }
        const exprs = [
            equals("RDT-Type", "root"),
            ...(tags ? Object.entries(tags).map(([key, val]) => equals(key, val)) : []),
        ];
        if (walletAddr)
            exprs.push(...genTargetWalletOps(walletAddr, walletDirs));
        if (abstractNode) {
            exprs.push(equals("Root-Id", typeof abstractNode === "string" ? abstractNode : abstractNode.root));
        }
        const query = and(...exprs);
        const txIds = yield client.arql(query);
        const txId = txIds[txIds.length - 1];
        if (!txId)
            return;
        const nodeTags = yield fetchTags(client, txId);
        const mapped = mapTagsToValues(ROOT_NODE_TAG_MAP, nodeTags);
        mapped.txId = txId;
        mapped.majorVersion = parseInt(mapped.majorVersion);
        mapped.createdAt = new Date(parseInt(mapped.createdAt));
        return mapped;
    });
}

const NODE_TAG_MAP = Object.assign(Object.assign({}, ROOT_NODE_TAG_MAP), { depth: "Branch-Depth" });
function getNode(client, { root, tail, head, depth = 0, fetchGreedily = false, walletAddr, walletDirs = ["to", "from"], tags, }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (tail === head) {
            throw new TypeError("Argument error: Tail ID is the same as Head ID");
        }
        if (!tail && !head) {
            throw new TypeError("Insufficient arguments: tail or head must be defined");
        }
        const prev = [];
        const curr = [];
        const next = [];
        const query = [
            equals("Root-Id", typeof root === "string" ? root : root.root),
            ...(tags
                ? Object.entries(tags).map(([key, value]) => equals(key, value))
                : []),
        ];
        if (walletAddr) {
            curr.push(...genTargetWalletOps(walletAddr, walletDirs));
        }
        if (tail) {
            if (fetchGreedily)
                prev.push(equals("Head-Node", tail));
            curr.push(equals("Tail-Node", tail));
        }
        if (head) {
            if (fetchGreedily)
                next.push(equals("Tail-Node", head));
            curr.push(equals("Head-Node", head));
        }
        const combined = [and(...curr)];
        if (prev.length)
            combined.push(and(...prev));
        if (next.length)
            combined.push(and(...next));
        query.push(or(...combined));
        let prevNode;
        let lastWasBranch = false;
        let doNotContinue = false;
        let branchTailNode;
        const txIds = yield client.arql(and(...query));
        if (!txIds.length)
            return;
        let nodes = yield Promise.all(txIds.flatMap((txId) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (doNotContinue)
                return [];
            const tags = yield fetchTags(client, txId);
            const isRoot = tags["RDT-Type"] === "root";
            const isBranch = !!tags["Branch-Tail-Node"];
            const node = mapTagsToValues(isBranch ? BRANCH_NODE_TAG_MAP : NODE_TAG_MAP, tags);
            if ((isRoot && depth > 0) || !isRoot && node.depth !== depth)
                return [];
            if (prevNode &&
                typeof prevNode.depth !== "undefined" &&
                node.head === prevNode.tail &&
                prevNode.head === node.tail &&
                prevNode.depth === node.depth) {
                doNotContinue = true;
                return [];
            }
            node.createdAt = new Date(parseInt(node.createdAt));
            node.majorVersion = parseInt(node.majorVersion);
            node.txId = txId;
            if (!isRoot) {
                node.depth = parseInt(node.depth);
            }
            if (prevNode &&
                !lastWasBranch &&
                isBranch &&
                prevNode.head === node.branchTail) {
                branchTailNode = prevNode;
            }
            if (prevNode &&
                lastWasBranch &&
                !isBranch &&
                prevNode.head === node.tail) {
                if (!branchTailNode) {
                    const { branchTail } = (_a = prevNode) !== null && _a !== void 0 ? _a : {};
                    if (!branchTail)
                        return [];
                    branchTailNode = yield getNode(client, {
                        root,
                        depth: prevNode.depth - 1,
                        head: branchTail,
                    });
                }
                if (branchTailNode.createdAt.getTime() > node.createdAt.getTime()) {
                    doNotContinue = true;
                    return [];
                }
            }
            lastWasBranch = isBranch;
            prevNode = node;
            return node;
        })));
        nodes = depth === 0 ? nodes[0] : nodes;
        return nodes;
    });
}
function getTailNode(client, { node, depth = 0, walletAddr }) {
    const { root, tail } = node;
    return getNode(client, { root, depth, head: tail, walletAddr });
}
function getHeadNode(client, { node, depth = 0, walletAddr }) {
    const { root, head } = node;
    return getNode(client, { root, depth, tail: head, walletAddr });
}
function traverseNodes(client, { entryNode, amount, maxBranchDepth = 0, walletAddr, }) {
    return __asyncGenerator(this, arguments, function* traverseNodes_1() {
        if (!amount)
            return yield __await(void 0);
        const forward = Math.sign(amount) > 0 ? true : false;
        if (!entryNode.tail && !forward)
            return yield __await(void 0);
        amount = Math.abs(amount);
        let node = entryNode;
        while (--amount) {
            const res = (yield __await((forward ? getHeadNode : getTailNode)(client, {
                node,
                depth: maxBranchDepth,
                walletAddr,
            })));
            if (!res || !res.tail)
                return yield __await(void 0);
            node = res;
            yield yield __await(res);
        }
    });
}

const BRANCH_NODE_TAG_MAP = Object.assign(Object.assign({}, NODE_TAG_MAP), { branchTail: "Branch-Tail-Node" });

// This file replaces `index.js` in bundlers like webpack or Rollup,

if (process.env.NODE_ENV !== 'production') {
  // All bundlers will remove this block in the production bundle.
  if (
    typeof navigator !== 'undefined' &&
    navigator.product === 'ReactNative' &&
    typeof crypto === 'undefined'
  ) {
    throw new Error(
      'React Native does not have a built-in secure random generator. ' +
        'If you don’t need unpredictable IDs use `nanoid/non-secure`. ' +
        'For secure IDs, import `react-native-get-random-values` ' +
        'before Nano ID. If you use Expo, install `expo-random` ' +
        'and use `nanoid/async`.'
    )
  }
  if (typeof msCrypto !== 'undefined' && typeof crypto === 'undefined') {
    throw new Error(
      'Import file with `if (!window.crypto) window.crypto = window.msCrypto`' +
        ' before importing Nano ID to fix IE 11 support'
    )
  }
  if (typeof crypto === 'undefined') {
    throw new Error(
      'Your browser does not have secure random generator. ' +
        'If you don’t need unpredictable IDs, you can use nanoid/non-secure.'
    )
  }
}

let nanoid = (size = 21) => {
  let id = '';
  let bytes = crypto.getRandomValues(new Uint8Array(size));

  // A compact alternative for `for (var i = 0; i < step; i++)`.
  while (size--) {
    // It is incorrect to use bytes exceeding the alphabet size.
    // The following mask reduces the random byte in the 0-255 value
    // range to the 0-63 value range. Therefore, adding hacks, such
    // as empty string fallback or magic numbers, is unneccessary because
    // the bitmask trims bytes down to the alphabet size.
    let byte = bytes[size] & 63;
    if (byte < 36) {
      // `0-9a-z`
      id += byte.toString(36);
    } else if (byte < 62) {
      // `A-Z`
      id += (byte - 26).toString(36).toUpperCase();
    } else if (byte < 63) {
      id += '_';
    } else {
      id += '-';
    }
  }
  return id
};

const MAJOR_VERSION = 0;
function createRootNode(tailNode) {
    const rootNode = {
        type: "root",
        root: nanoid(),
        majorVersion: MAJOR_VERSION,
        createdAt: new Date(),
        head: nanoid(),
        otherTags: {},
    };
    if (tailNode === null || tailNode === void 0 ? void 0 : tailNode.head)
        rootNode.tail = tailNode === null || tailNode === void 0 ? void 0 : tailNode.head;
    return rootNode;
}
function createNode(tailNode, createBranch = false) {
    const { depth } = tailNode;
    const baseNode = {
        type: "node",
        root: tailNode.root,
        depth: !!depth ? (createBranch ? depth + 1 : depth) : 0,
        majorVersion: MAJOR_VERSION,
        createdAt: new Date(),
        tail: tailNode.head,
        head: nanoid(),
        otherTags: {},
    };
    if (createBranch) {
        baseNode.branchTail = baseNode.head;
        return baseNode;
    }
    return baseNode;
}
function getNodeTags(node) {
    node.createdAt = node.createdAt.getTime();
    const tags = mapValuesToTags(node.branchTail
        ? BRANCH_NODE_TAG_MAP
        : node.depth
            ? NODE_TAG_MAP
            : ROOT_NODE_TAG_MAP, node);
    return tags;
}

export { MAJOR_VERSION, createNode, createRootNode, fetchRootNode, getHeadNode, getNode, getNodeTags, getTailNode, traverseNodes };
