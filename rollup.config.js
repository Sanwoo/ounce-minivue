import pkg from "./package.json";
import { nodeResolve } from '@rollup/plugin-node-resolve';
export default {
  input: "./src/index.js",
  output: [
    // 1. cjs -> commonjs
    // 2. esm
    {
      format: "cjs",
      file: pkg.main,
    },
    {
      format: "es",
      file: pkg.module,
    },
  ],

  plugins: [nodeResolve()],
};
