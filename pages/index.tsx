import * as A from "fp-ts/Array";
import * as Csv from "lib/Csv";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";

import React from "react";
import classnames from "classnames";
import { pipe } from "fp-ts/function";
import styles from "./Home.module.css";
import { useDropzone } from "react-dropzone";

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

const Credits: React.FC = () => {
  const [show, setShow] = React.useState(false);
  const [ref, setRef] = React.useState<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleOutsideClick = (event: Event) => {
      if (ref !== null && ref.contains(event.target as Node) === false) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [show, ref]);

  return (
    <div className="relative">
      <button
        type="button"
        className="underline text-gray-400 mt-4 text-sm"
        onClick={() => setShow(true)}
      >
        Learn how your data is being handled
      </button>
      {show && (
        <div
          ref={setRef}
          className={classnames(
            "absolute w-64 bg-blue-200 p-4 rounded",
            styles.creditsTooltip
          )}
          style={{
            left: -10,
            bottom: 30,
          }}
        >
          <p>
            Your CSV file is processed on our server but we do not store it. We
            simply use the data to compute the stats we're showing you.{" "}
            <span className="underline">Nothing is persisted.</span>
          </p>
        </div>
      )}
    </div>
  );
};

const FileIcon: React.FC = () => (
  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" width={120}>
    <g>
      <path
        d="M330.7 6H87.9v500h361.3V122.8z"
        style={{ stroke: "black", strokeWidth: 2, fill: "none" }}
      />
      <path d="m330.7 6 118.5 116.8H330.7z" />
    </g>
    <g>
      <path d="M149 400.1c3.1 0 5.4-.8 6.9-2.5s2.3-4.1 2.3-7.2h20.6l.1.4c.2 7.9-2.5 14.3-8.2 19.3-5.6 5-12.9 7.4-21.7 7.4-11 0-19.5-3.4-25.4-10.2-5.9-6.8-8.9-15.6-8.9-26.5v-1.5c0-10.9 3-19.7 8.9-26.5 5.9-6.8 14.4-10.2 25.3-10.2 9.2 0 16.5 2.5 22 7.6s8.2 12.1 8 20.9l-.1.4h-20.6c0-3.4-.8-6.2-2.3-8.4-1.6-2.2-3.9-3.2-6.9-3.2-4.4 0-7.4 1.7-9.1 5.2-1.7 3.5-2.6 8.2-2.6 14.1v1.5c0 6.1.9 10.8 2.6 14.2 1.5 3.5 4.6 5.2 9.1 5.2z" />
      <path d="M235.3 395.8c0-1.8-1-3.4-3-4.8s-5.7-2.7-11.1-3.8c-8.4-1.6-14.8-4.2-19-7.6-4.3-3.4-6.4-8.2-6.4-14.3 0-6.4 2.7-11.8 8-16.2 5.3-4.4 12.6-6.6 21.7-6.6 9.6 0 17.3 2.1 23 6.4 5.7 4.3 8.4 9.9 8.1 16.7l-.1.4h-21.9c0-2.8-.7-5-2.1-6.5-1.4-1.5-3.8-2.2-7-2.2-2.4 0-4.3.6-5.9 1.9-1.6 1.3-2.4 2.9-2.4 4.9 0 1.9.9 3.5 2.8 4.9 1.8 1.3 5.6 2.5 11.2 3.6 8.9 1.7 15.4 4.3 19.6 7.8 4.2 3.5 6.3 8.3 6.3 14.7 0 6.5-2.9 11.9-8.6 16.1-5.8 4.2-13.4 6.3-22.9 6.3-9.8 0-17.6-2.5-23.3-7.5-5.7-5-8.4-10.6-8.2-16.7l.1-.4h20.4c.1 3.4 1.1 5.9 3.1 7.4s4.8 2.3 8.4 2.3c3 0 5.3-.6 6.9-1.8 1.5-1.2 2.3-2.8 2.3-5z" />
      <path d="m304.2 386.3 1.3 7.7.4.1 1.5-7.7 9.6-42.5h23.7l-23.5 72.3h-22.9l-23.5-72.3h23.8l9.6 42.4z" />
    </g>
  </svg>
);

const Dropzone: React.FC = ({ onDrop, accept }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "text/csv",
  });

  return (
    <div
      {...getRootProps()}
      className="flex items-center justify-center cursor-pointer h-full p-8"
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

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    pipe(acceptedFiles, A.head, setFile);
  }, []);

  return (
    <div className="py-6 px-6 md:px-12 flex flex-col h-screen">
      <nav className="flex items-center justify-between mb-12 md:mb-48">
        <span>shakepay.stats</span>
        <ul className="flex items-center ml-4">
          <li>about</li>
        </ul>
      </nav>
      <div className="flex-grow flex flex-col">
        <header>
          <h1 className="text-4xl mb-2">
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
          <div className="border-dashed border-2 border-gray-200 flex-grow flex flex-col justify-center">
            {pipe(
              file,
              O.map((f) => (
                // TODO: remove key this is a false positive because eslint thinks we're calling array.map lol
                <div className="flex justify-center" key="lol">
                  <div className="flex flex-col relative">
                    <div className="bg-blue-200 py-4 px-2 rounded">
                      <button
                        type="button"
                        className="p-2 -m-2 absolute top-0 right-2 text-2xl"
                        onClick={() => setFile(O.none)}
                      >
                        &times;
                      </button>
                      <FileIcon />
                      <div className="mt-2 text-center">{f.name}</div>
                    </div>
                    <button
                      type="submit"
                      className="bg-green-300 px-4 py-1 rounded text-black self-center mt-4 w-full"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              )),
              O.getOrElse(() => <Dropzone onDrop={onDrop} />)
            )}
          </div>
          <Credits />
        </form>
      </div>
    </div>
  );
}
