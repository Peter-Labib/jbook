import MonacoEditor from '@monaco-editor/react'

const CodeEditor = () => {
  return (
    <MonacoEditor height='500px' theme='vs-dark' defaultLanguage='javascript' />
  )
}

export default CodeEditor