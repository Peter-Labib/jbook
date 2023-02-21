import React, { useEffect, useRef } from "react";
import * as esbuild from "esbuild-wasm";

import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";

let renderd = false;
function App() {
  const inputRef = useRef<any>("");
  const iframeRef = useRef<any>("");

  const startService = async () => {
    try {
      await esbuild.initialize({
        worker: true,
        wasmURL: "esbuild.wasm",
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

    // setCode(res.outputFiles && res.outputFiles[0].text);
    iframeRef.current.contentWindow.postMessage(
      res.outputFiles && res.outputFiles[0].text,
      "*"
    );
  };

  useEffect(() => {
    if (!renderd) startService();
    return () => {
      renderd = true;
    };
  }, []);

  const html = `<html>
                  <head></head>
                  <body>
                    <div id="root"></div>
                    <script>
                      window.addEventListener('message', event => {
                        try {
                          eval(event.data);
                        } catch (err) {
                          const root = document.querySelector('#root');
                          root.innerHTML = '<div style="color: red;"> <h4>Runtime Error</h4>' + err + "</div>"
                          console.log(err);
                        }
                      }, false)
                    </script>
                  </body>
                </html>`;

  return (
    <div className="App">
      <textarea ref={inputRef}></textarea>
      <div>
        <button onClick={onClick}>Sudbmit</button>
      </div>
      <iframe
        title="user-code"
        ref={iframeRef}
        sandbox="allow-scripts"
        srcDoc={html}
      />
    </div>
  );
}

export default App;
