import React, { useEffect, useState, useRef } from "react";
import * as esbuild from "esbuild-wasm";

import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";

let renderd = false;
function App() {
  const inputRef = useRef<any>("");
  const [code, setCode] = useState<string>("");

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

    esbuild.build({
      entryPoints: ["index.js"],
      bundle: true,
      plugins: [unpkgPathPlugin()],
    });
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
