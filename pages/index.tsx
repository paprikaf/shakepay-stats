import * as A from "fp-ts/Array";
import * as Csv from "lib/Csv";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as R from "fp-ts/Record";
import * as TE from "fp-ts/TaskEither";

import { DropzoneOptions, useDropzone } from "react-dropzone";

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

const Dropzone: React.FC = ({ onDrop, accept }) => {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: "text/csv",
    });

  return (
    <div
      {...getRootProps()}
      className="h-full flex items-center justify-center cursor-pointer"
    >
      <input className="" {...getInputProps()} />
      {isDragActive ? (
        <p className="dropzone-content">Release to drop the files here</p>
      ) : (
        <p className="dropzone-content">
          Drag &amp; drop some files here, or click to select files
        </p>
      )}
    </div>
  );
};

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

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    pipe(acceptedFiles, A.head, setFile);
  }, []);

  return (
    <div className="py-6 px-12 flex flex-col h-screen">
      <nav className="flex items-center justify-between mb-48">
        <span>shakepay.stats</span>
        <ul className="flex items-center ml-4">
          <li>about</li>
        </ul>
      </nav>
      <div className="flex-grow flex flex-col">
        <header>
          <h1 className="text-3xl mb-2">
            Learn what's your BTC worth on shakepay
          </h1>
          <p>
            {/* TODO explain to go get the history in shakepay */}
            Upload your shakepay{" "}
            <a href="" className="underline">
              transactions history
            </a>{" "}
            and discover how much you gained or lost over time 💰.
          </p>
        </header>
        <form
          encType="multipart/form-data"
          method="post"
          action="/api/csv"
          onSubmit={handleSubmit}
          className="flex flex-col mt-8 flex-grow"
        >
          <div className="border-dashed border-2 border-gray-200 p-6 h-full">
            {pipe(
              file,
              O.map((f) => (
                <>
                  <div>
                    Ready to upload{" "}
                    <span className="bg-blue-200 py-1 px-2 rounded">
                      <span className="mr-1">{f.name}</span>
                      <button
                        type="button"
                        className="p-2 -m-2"
                        onClick={() => setFile(O.none)}
                      >
                        &times;
                      </button>
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="bg-green-300 px-4 py-1 rounded text-black self-center mt-4"
                  >
                    Upload
                  </button>
                </>
              )),
              O.getOrElse(() => <Dropzone onDrop={onDrop} />)
            )}
          </div>
          <a className="underline text-gray-400 mt-4 text-sm">Learn how your data is being handled</a>
        </form>
      </div>
    </div>
  );
}
