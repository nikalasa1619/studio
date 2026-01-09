import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the stock intelligence headline", () => {
    render(<HomePage />);

    expect(
      screen.getByText(
        "Build your stock intelligence layer for price, volume, and order book"
      )
    ).toBeInTheDocument();
  });

  it("surfaces the CVRC volatility stack section", () => {
    render(<HomePage />);

    expect(screen.getByText("CVRC Volatility Stack")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Convolution operators decompose variance across trading frequencies."
      )
    ).toBeInTheDocument();
  });
});
