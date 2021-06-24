import * as Next from "next";

const withMethod =
  (method: Next.HttpMethod) =>
  <T>(fn: Next.NextApiHandler<T>) =>
  (request: Next.NextApiRequest, response: Next.NextApiResponse<T>) => {
    if (request.method === method) {
      return fn(request, response);
    }

    // TODO: use enum for http code
    // TODO: Force returning a response object instead of mutating
    response.status(404);
  };

export const post = withMethod(Next.HttpMethod.Post);
