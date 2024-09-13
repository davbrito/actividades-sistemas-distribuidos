import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import type { RollupOptions } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import externals from "rollup-plugin-node-externals";
import { typescriptPaths } from "rollup-plugin-typescript-paths";
import { cleandir } from "rollup-plugin-cleandir";
import alias from "@rollup/plugin-alias";
import { fileURLToPath } from "url";

export default {
  input: {
    index: "index.ts",
  },
  output: {
    dir: "dist",
    format: "es",
    generatedCode: {
      constBindings: true,
    },
    preserveModules: false,
    strict: true,
    banner: ["#!/usr/bin/env node", "/* eslint-disable */"].join("\n"),
  },

  plugins: [
    alias({
      entries: [
        {
          find: "lodash",
          replacement: fileURLToPath(import.meta.resolve("lodash-es")),
        },
      ],
    }),
    cleandir(),
    externals({
      deps: false,
      include: ["mongodb", "execa"],
    }),
    nodeResolve(),
    commonjs(),
    json(),

    typescriptPaths({
      preserveExtensions: true,
    }),
    esbuild({ minify: false }),
    // useEsbuild
    //   ? [
    //     ]
    //   : typescript({
    //       noEmitOnError: true,
    //       removeComments: true,
    //     }),
  ],
} satisfies RollupOptions;
