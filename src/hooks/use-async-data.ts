"use client";

import { useEffect, useRef, useState } from "react";

export type AsyncState<T> =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "error"; data?: undefined; error: Error }
  | { status: "success"; data: T; error?: undefined };

/** Runs an async fetcher whenever `deps` change, tracking loading/error/data. */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: React.DependencyList): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const seq = useRef(0);

  useEffect(() => {
    const mySeq = ++seq.current;
    setState({ status: "loading" });
    fetcher()
      .then((data) => {
        if (seq.current === mySeq) setState({ status: "success", data });
      })
      .catch((error: Error) => {
        if (seq.current === mySeq) setState({ status: "error", error });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
