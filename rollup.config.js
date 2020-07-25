import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess, { sass } from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import image from "@rollup/plugin-image";
import url from "@rollup/plugin-url";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/main.ts",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js"
  },
  plugins: [
    svelte({
      dev: !production,
      css: css => css.write("public/build/bundle.css"),
      preprocess: sveltePreprocess()
    }),
    resolve({ browser: true, dedupe: ["svelte"] }),
    commonjs(),
    typescript({ sourceMap: !production }),
    sass(),
    image(),
    url(),

    !production && serve(),
    !production && livereload("public"),
    production && terser()
  ],
  watch: { clearScreen: false }
};

function serve() {
	let started = false;

	return {
		writeBundle() {
			if(!started) {
				started = true;
				require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
					stdio: ["ignore", "inherit", "inherit"],
					shell: true
				});
			}
		}
	}
}