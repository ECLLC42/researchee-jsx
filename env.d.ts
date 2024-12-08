declare namespace NodeJS {
  interface ProcessEnv {
    OPENAI_API_KEY: string;
    BLOB_READ_WRITE_TOKEN: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_REGION: string;
    VERCEL_URL?: string;
    VERCEL_ENV?: 'production' | 'preview' | 'development';
  }
} 