import * as Next from "next";

type NotFoundError = { error: string };

enum HttpMethod {
  Post = "POST",
  Get = "GET",
}

const withMethod =
  (method: HttpMethod) =>
  <T>(fn: Next.NextApiHandler<T>) =>
  (
    request: Next.NextApiRequest,
    response: Next.NextApiResponse<T | NotFoundError>
  ): ReturnType<Next.NextApiHandler<T | NotFoundError>> => {
    console.log(request.method);
    if (request.method === method) {
      fn(request, response);
    } else {
      // TODO: use enum for http code
      // TODO: Force returning a response object instead of mutating
      response.status(404).send({ error: "Not found" });
    }
  };

export const post = withMethod(HttpMethod.Post);
