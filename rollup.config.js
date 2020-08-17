import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import svelte from "rollup-plugin-svelte";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import config from "sapper/config/rollup.js";
import pkg from "./package.json";
import { sass, typescript as typescriptprocess } from "svelte-preprocess";
import image from "@rollup/plugin-image";
import url from "@rollup/plugin-url";
import typescript from "@rollup/plugin-typescript";

const
  mode = process.env.NODE_ENV,
  dev = mode === "development",
  legacy = !!process.env.SAPPER_LEGACY_BUILD,
  onwarn = (warning, onwarn) => (warning.code === "CIRCULAR_DEPENDENCY" && /[/\\]@sapper[/\\]/.test(warning.message)) || onwarn(warning),
  tsconfigFile = require("./tsconfig.json");

export default {
	client: {
		input: config.client.input().replace(/\.js$/, '.ts'),
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
        preprocess: [
          sass({}),
          typescriptprocess({ tsconfigFile })
        ]
      }),
			resolve({
				browser: true,
				dedupe: ["svelte"]
			}),
      commonjs(),
      image(),
      url(),
      typescript(),

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
		input: ((typeof config.server.input() === 'string') ? config.server.input() : config.server.input().server).replace(/\.js$/, '.ts'),
		output: config.server.output(),
		plugins: [
			replace({
				"process.browser": false,
				"process.env.NODE_ENV": JSON.stringify(mode)
			}),
			svelte({
				generate: "ssr",
        dev,
        preprocess: [
          sass({}),
          typescriptprocess({ tsconfigFile })
        ]
      }),
			resolve({
				dedupe: ["svelte"]
      }),
      commonjs(),
      image(),
      url(),
      typescript(),
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
