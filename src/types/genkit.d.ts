declare module 'genkit' {
  type GenkitOptions = any;
  export function genkit(options: GenkitOptions): any;
  export const z: any;
}

declare module '@genkit-ai/googleai' {
  export function googleAI(opts?: any): any;
}

export {};
