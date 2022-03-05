import * as Error from "lib/Errors";

import { StatusCodes } from "http-status-codes";
import { failure as formatValidationErrors } from "io-ts/PathReporter";

export const fromUploadError = Error.APIUpload.match<Error.APIError>({
  CsvParseError: () => ({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    error: "Parse error",
  }),
  DecodeError: ({ value }) => ({
    status: StatusCodes.BAD_REQUEST,
    error: "Invalid file: " + formatValidationErrors(value.errors).join("; "),
  }),
  NoFile: () => ({
    status: StatusCodes.BAD_REQUEST,
    error: "File not found",
  }),
  ThirdPartyApiError: ({ value }) => ({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    error: value,
  }),
});
