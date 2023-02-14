import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localForage from "localforage";

interface funcProp {
  inputCode: string;
}

const fileCache = localForage.createInstance({
  name: "file-cahe",
});

export const unpkgPathPlugin = ({ inputCode }: funcProp) => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      // handle root entry file of index.js
      build.onResolve(
        { filter: /(^index\.js$)/ },
        (args: esbuild.OnResolveArgs) => {
          return { path: args.path, namespace: "a" };
        }
      );

      // handle relative path in module
      build.onResolve({ filter: /^\.+\// }, (args: esbuild.OnResolveArgs) => {
        return {
          namespace: "a",
          path: new URL(args.path, "https://unpkg.com" + args.resolveDir + "/")
            .href,
        };
      });

      // handle main file of a module
      build.onResolve({ filter: /.*/ }, async (args: esbuild.OnResolveArgs) => {
        return {
          namespace: "a",
          path: `https://unpkg.com/${args.path}`,
        };
      });

      build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
        if (args.path === "index.js") {
          return {
            loader: "jsx",
            contents: inputCode,
          };
        }

        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );

        if (cachedResult) return cachedResult;

        const { data, request } = await axios.get(args.path);

        const result: esbuild.OnLoadResult = {
          loader: "jsx",
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname,
        };
        await fileCache.setItem(args.path, result);

        return result;
      });
    },
  };
};
