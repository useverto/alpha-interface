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
import { copySync, removeSync } from "fs-extra";
import { spassr } from "spassr";
import getConfig from "@roxi/routify/lib/utils/config";
import svelte from "rollup-plugin-svelte-hot";
import Hmr from "rollup-plugin-hot";

const production = !process.env.ROLLUP_WATCH,
  { distDir } = getConfig(),
  buildDir = "dist/build",
  assetsDir = "assets",
  isNollup = !!process.env.NOLLUP;

removeSync(distDir);
removeSync(buildDir);

const serve = () => ({
  writeBundle: async () => {
    const options = {
      assetsDir: [assetsDir, distDir],
      entrypoint: `${assetsDir}/__app.html`,
      script: `${buildDir}/main.js`,
    };
    spassr({ ...options, port: 5000 });
    spassr({
      ...options,
      ssr: true,
      port: 5005,
      ssrOptions: { inlineDynamicImports: true, dev: true },
    });
  },
});
const copyToDist = () => ({
  writeBundle() {
    copySync(assetsDir, distDir);
  },
});

export default {
  preserveEntrySignatures: false,
  input: "src/main.ts",
  output: {
    sourcemap: true,
    format: "iife",
    dir: buildDir,
    chunkFileNames: !production && "[name].js",
  },
  plugins: [
    svelte({
      dev: !production,
      css: (css) => css.write("bundle.css"),
      hot: isNollup,
      preprocess: [sass(), tsProcess({ tsconfigFile })],
    }),
    resolve({
      browser: true,
      dedupe: (importee) => !!importee.match(/svelte(\/|$)/),
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
    production && terser(),
    !production && !isNollup && serve(),
    !production && !isNollup && livereload(distDir), // refresh entire window when code is updated
    !production && isNollup && Hmr({ inMemory: true, public: assetsDir }), // refresh only updated code
    {
      transform: (code) => ({
        code: code.replace("process.env.NODE_ENV", `"${process.env.NODE_ENV}"`),
        map: { mappings: "" },
      }),
    },
    production && copyToDist(),
  ],
  watch: {
    clearScreen: false,
    buildDelay: 100,
  },
};
