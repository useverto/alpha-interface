import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import svelte from "rollup-plugin-svelte";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import config from "sapper/config/rollup.js";
import pkg from "./package.json";
import sveltePreprocess, { sass } from "svelte-preprocess";
import image from "@rollup/plugin-image";
import url from "@rollup/plugin-url";

const mode = process.env.NODE_ENV;
const dev = mode === "development";
const legacy = !!process.env.SAPPER_LEGACY_BUILD;

const onwarn = (warning, onwarn) => {
  if((warning.code === "THIS_IS_UNDEFINED" && warning.message.match("equivalent to 'undefined'")) || (warning.code === "SOURCEMAP_ERROR" && warning.message.match("Can't resolve original location of error."))) return;
  onwarn(warning);
};

export default {
	client: {
		input: config.client.input(),
		output: config.client.output(),
		plugins: [
			replace({
				"process.browser": true,
				"process.env.NODE_ENV": JSON.stringify(mode)
			}),
			svelte({
				dev,
				hydratable: true,
        emitCss: true,
        css: css => css.write("public/build/bundle.css"),
        preprocess: sveltePreprocess()
			}),
			resolve({
				browser: true,
				dedupe: ["svelte"]
			}),
      commonjs(),
      sass(),
      image(),
      url(),

			legacy && babel({
				extensions: [".js", ".mjs", ".html", ".svelte"],
				babelHelpers: "runtime",
				exclude: ["node_modules/@babel/**"],
				presets: [
					["@babel/preset-env", {
						targets: "> 0.25%, not dead"
					}]
				],
				plugins: [
					"@babel/plugin-syntax-dynamic-import",
					["@babel/plugin-transform-runtime", {
						useESModules: true
					}]
				]
			}),

			!dev && terser({
				module: true
			})
		],

		preserveEntrySignatures: false,
		onwarn,
	},

	server: {
		input: config.server.input(),
		output: config.server.output(),
		plugins: [
			replace({
				"process.browser": false,
				"process.env.NODE_ENV": JSON.stringify(mode)
			}),
			svelte({
				generate: "ssr",
        dev,
        preprocess: sveltePreprocess()
			}),
			resolve({
				dedupe: ["svelte"]
			}),
      commonjs(),
      sass(),
      image(),
      url(),
		],
		external: Object.keys(pkg.dependencies).concat(require("module").builtinModules),

		preserveEntrySignatures: "strict",
		onwarn,
	},

	serviceworker: {
		input: config.serviceworker.input(),
		output: config.serviceworker.output(),
		plugins: [
			resolve(),
			replace({
				"process.browser": true,
				"process.env.NODE_ENV": JSON.stringify(mode)
			}),
			commonjs(),
			!dev && terser()
		],

		preserveEntrySignatures: false,
		onwarn,
	}
};
