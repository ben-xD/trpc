/**
 * This is the API-handler of your app that contains all your API routes.
 * On a bigger app, you will probably want to split this file up into multiple files.
 */
import * as trpcNext from '@trpc/server/adapters/next';
import { nodeHTTPFormDataContentTypeHandler } from '@trpc/server/adapters/node-http/content-type/form-data';
import { nodeHTTPJSONContentTypeHandler } from '@trpc/server/adapters/node-http/content-type/json';
import { NextApiRequest, NextApiResponse } from 'next';
import { File } from 'undici';
import { publicProcedure, router } from '~/server/trpc';
import { uploadFileSchema } from '~/utils/schemas';

// @ts-expect-error - globalThis.File is not defined for some reason
globalThis.File = File;

const appRouter = router({
  upload: publicProcedure.input(uploadFileSchema).mutation((opts) => {
    return {
      ...opts.input,
      file1: {
        name: opts.input.file1.name,
        size: opts.input.file1.size,
      },
    };
  }),
});

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type AppRouter = typeof appRouter;

const handler = trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: (opts) => {
    return opts;
  },
  unstable_contentTypeHandlers: [
    nodeHTTPFormDataContentTypeHandler(),
    nodeHTTPJSONContentTypeHandler(),
  ],
});

// export API handler
export default async (req: NextApiRequest, res: NextApiResponse) => {
  await handler(req, res);
};

export const config = {
  api: {
    bodyParser: false,
  },
};