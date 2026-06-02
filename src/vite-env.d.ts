/// <reference types="vite/client" />

// Vite worker import declarations
declare module '*?worker' {
  const WorkerFactory: {
    new (): Worker;
  };
  export default WorkerFactory;
}

declare module '*?worker&inline' {
  const WorkerFactory: {
    new (): Worker;
  };
  export default WorkerFactory;
}
