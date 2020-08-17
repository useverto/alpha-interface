// This is the server part of Sapper
// For this project, it is not used

import sirv from "sirv";
import polka from "polka";
import compression from "compression";
import * as sapper from "@sapper/server";
import Arweave from "arweave";

const client = new Arweave({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 20000,
});
const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

polka()
	.use(
		compression({ threshold: 0 }),
		sirv("static", { dev }),
		sapper.middleware()
	)
	.listen(PORT, err => {
		if (err) console.log("error", err);
	});
