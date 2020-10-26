import resolve from "@rollup/plugin-node-resolve";
import builtins from "rollup-plugin-node-builtins";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import svelte from "rollup-plugin-svelte";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import config from "sapper/config/rollup.js";
import pkg from "./package.json";
import { sass, typescript as tsProcess } from "svelte-preprocess";
import image from "@rollup/plugin-image";
import url from "@rollup/plugin-url";
import json from "@rollup/plugin-json";
import { string } from "rollup-plugin-string";
import typescript from "@rollup/plugin-typescript";

const mode = process.env.NODE_ENV;
const dev = mode === "development";
const legacy = !!process.env.SAPPER_LEGACY_BUILD;
const tsconfigFile = require("./tsconfig.json");

const onwarn = (warning, onwarn) => {
  if (
    (warning.code === "THIS_IS_UNDEFINED" &&
      warning.message.match("equivalent to 'undefined'")) ||
    (warning.code === "SOURCEMAP_ERROR" &&
      warning.message.match("Can't resolve original location of error.")) ||
    (warning.code === "MISSING_EXPORT" &&
      warning.message.match(
        "'preload' is not exported by 'src/routes/_layout.svelte'"
      ))
  )
    return;
  // remove the circular dependency warning. We can't do anything about that
  if (warning.code === "CIRCULAR_DEPENDENCY") return;
  // remove the no-onchange warning. In our case, on:change is needed, and on:blur does not work as intended
  if (
    warning.code === "PLUGIN_WARNING" &&
    warning.pluginCode === "a11y-no-onchange"
  )
    return;
  onwarn(warning);
};

export default {
  client: {
    input: config.client.input().replace(/\.js$/, ".ts"),
    output: config.client.output(),
    plugins: [
      replace({
        "process.browser": true,
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      svelte({
        dev,
        hydratable: true,
        emitCss: true,
        css: (css) => css.write("public/build/bundle.css"),
        preprocess: [sass(), tsProcess({ tsconfigFile })],
      }),
      resolve({
        browser: true,
        dedupe: ["svelte"],
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({ sourceMap: dev }),
      sass(),
      image(),
      url(),
      json(),
      builtins(),
      string({ include: ["**/*.graphql", "**/*.gql"] }),
      legacy &&
        babel({
          extensions: [".js", ".mjs", ".html", ".svelte"],
          babelHelpers: "runtime",
          exclude: ["node_modules/@babel/**"],
          presets: [
            [
              "@babel/preset-env",
              {
                targets: "> 0.25%, not dead",
              },
            ],
          ],
          plugins: [
            "@babel/plugin-syntax-dynamic-import",
            [
              "@babel/plugin-transform-runtime",
              {
                useESModules: true,
              },
            ],
          ],
        }),

      !dev &&
        terser({
          module: true,
        }),
    ],

    preserveEntrySignatures: false,
    onwarn,
  },

  server: {
    input: (typeof config.server.input() === "string"
      ? config.server.input()
      : config.server.input().server
    ).replace(/\.js$/, ".ts"),
    output: config.server.output(),
    plugins: [
      replace({
        "process.browser": false,
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      svelte({
        generate: "ssr",
        dev,
        preprocess: [sass(), tsProcess({ tsconfigFile })],
      }),
      resolve({
        dedupe: ["svelte"],
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({ sourceMap: dev }),
      sass(),
      image(),
      url(),
      json(),
      builtins(),
      string({ include: ["**/*.graphql", "**/*.gql"] }),
    ],
    external: Object.keys(pkg.dependencies).concat(
      require("module").builtinModules
    ),

    preserveEntrySignatures: "strict",
    onwarn,
  },

  serviceworker: {
    input: config.serviceworker.input().replace(/\.js$/, ".ts"),
    output: config.serviceworker.output(),
    plugins: [
      resolve(),
      replace({
        "process.browser": true,
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      commonjs(),
      typescript({ sourceMap: dev }),
      !dev && terser(),
    ],

    preserveEntrySignatures: false,
    onwarn,
  },
};
