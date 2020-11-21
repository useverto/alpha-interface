import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import { sass, typescript as tsProcess } from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import tsconfigFile from "./tsconfig.json";
import { string } from "rollup-plugin-string";
import json from "@rollup/plugin-json";
import image from "@rollup/plugin-image";
import url from "@rollup/plugin-url";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/main.ts",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js",
  },
  plugins: [
    svelte({
      dev: !production,
      hydratable: true,
      emitCss: true,
      css: (css) => css.write("public/build/bundle.css"),
      preprocess: [sass(), tsProcess({ tsconfigFile })],
    }),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),
    sass(),
    image(),
    url(),
    string({ include: ["**/*.graphql", "**/*.gql"] }),
    json(),
    !production && serve(),
    !production && livereload("public"),
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require("child_process").spawn(
        "npm",
        ["run", "start", "--", "--dev"],
        {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        }
      );

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}
