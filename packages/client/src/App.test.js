import { render, screen } from "@testing-library/react";
import App from "./App";

test("should validate title", () => {
  render(<App />);
  const linkElement = screen.getByText(/Photo Gallery/i);
  expect(linkElement).toBeInTheDocument();
});
