/// <reference types="vite/client" />
/// <reference types="@crxjs/vite-plugin/client" />

declare module '*?script' {
  const scriptPath: string;
  export default scriptPath;
}