import * as E from "fp-ts/Either";
import * as Next from "next";
import * as t from "io-ts";

import { failure as formatValidationErrors } from "io-ts/PathReporter";
import { pipe } from "fp-ts/function";

interface NotFoundError {
  error: "Not found";
}

interface ValidationError {
  errors: string[];
}

enum HttpMethod {
  Post = "POST",
  Get = "GET",
}

export const post =
  <A>(decoder: t.Decoder<unknown, A>) =>
  <B>(
    fn: (
      request: Next.NextApiRequest,
      response: Next.NextApiResponse<B>,
      body: A
    ) => ReturnType<Next.NextApiHandler<B>>
  ): Next.NextApiHandler<B | NotFoundError | ValidationError> =>
  (request, response) => {
    if (request.method !== HttpMethod.Post) {
      return;
    }

    pipe(
      decoder.decode(request.body),
      E.fold(
        (errors) => {
          return response.status(400).send({
            errors: formatValidationErrors(errors),
          });
        },
        (value) => fn(request, response, value)
      )
    );
  };
