import React, { useEffect, useState, useRef } from "react";
import * as esbuild from "esbuild-wasm";

import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";

let renderd = false;
function App() {
  const inputRef = useRef<any>("");
  const [code, setCode] = useState<string | undefined>("");

  const startService = async () => {
    try {
      await esbuild.initialize({
        worker: true,
        wasmURL: "/esbuild.wasm",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onClick = async () => {
    if (!inputRef.current) {
      return;
    }

    const res = await esbuild.build({
      entryPoints: ["index.js"],
      bundle: true,
      plugins: [
        unpkgPathPlugin(),
        fetchPlugin({ inputCode: inputRef.current.value }),
      ],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
      },
    });

    setCode(res.outputFiles && res.outputFiles[0].text);
  };

  useEffect(() => {
    if (!renderd) startService();
    return () => {
      renderd = true;
    };
  }, []);

  return (
    <div className="App">
      <textarea ref={inputRef}></textarea>
      <div>
        <button onClick={onClick}>Sudbmit</button>
      </div>
      <pre>{code}</pre>
    </div>
  );
}

export default App;
