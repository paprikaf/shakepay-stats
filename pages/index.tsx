import * as Csv from "lib/Csv";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as R from "fp-ts/Record";
import * as TE from "fp-ts/TaskEither";

import Head from "next/head";
import Image from "next/image";
import React from "react";
import { pipe } from "fp-ts/function";
import styles from "../styles/Home.module.css";

const upload = (file: File) =>
  TE.tryCatch(
    () => {
      const data = new FormData();
      data.append(Csv.fieldName, file);

      return fetch("/api/csv", {
        method: "POST",
        body: data,
      });
    },
    (_) => new Error("Upload failed")
  );

export default function Home() {
  const [file, setFile] = React.useState<O.Option<File>>(O.none);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    // TODO: handle error in UI
    pipe(
      file,
      TE.fromOption(() => new Error("No file provided")),
      TE.chain(upload),
      TE.chainEitherK((response) =>
        response.ok ? E.right(response) : E.left(new Error("Upload failed"))
      ),
      TE.chain((response) =>
        TE.tryCatch(
          response.json,
          (_) => new Error("Could parse response as json")
        )
      ),
      // TODO: We're going to eventually receive some other response for which we'll need a type.
      TE.map((body) => body as Csv.Csv),
      TE.map(console.log)
    )();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    pipe(
      O.fromNullable(event.target.files),
      O.chainNullableK((files) => files.item(0)),
      O.map((file) => {
        setFile(O.some(file));
      })
    );
  };

  return (
    <div className="py-6 px-12 flex flex-col h-screen">
      <nav className="flex items-center justify-between mb-64">
        <span>shakepay.stats</span>
        <ul className="flex items-center ml-4">
          <li>about</li>
        </ul>
      </nav>
      <div className="flex flex-grow">
        <header>
          <h1 className="text-3xl mb-2">What's my BTC worth on shakepay</h1>
          <p>
            {/* TODO explain to go get the history in shakepay */}
            Upload your shakepay <a href="">transactions history</a> and
            discover how much you gained or lost over time.
          </p>
        </header>
        <form
          encType="multipart/form-data"
          method="post"
          action="/api/csv"
          onSubmit={handleSubmit}
        >
          <label>
            Choose a file
            <input
              type="file"
              name="csv_upload"
              accept="text/csv"
              onChange={handleFileChange}
            />
          </label>
          <button type="submit" disabled={O.isNone(file)}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
