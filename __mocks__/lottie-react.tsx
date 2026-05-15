/**
 * Manual mock for lottie-react.
 * Replaces the heavy canvas-based animation with a lightweight <div> stub.
 */
import React from "react";

const Lottie = jest.fn(({ "data-testid": testId }: { "data-testid"?: string }) =>
  React.createElement("div", { "data-testid": testId ?? "lottie-animation" }),
);

export default Lottie;
