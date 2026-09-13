import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClassifyOptions, type ClassifyOptionsValue } from "./ClassifyOptions";

describe("ClassifyOptions", () => {
  it("renders the current top-K / width / height values", () => {
    const value: ClassifyOptionsValue = { topK: 5, width: 224, height: 224 };
    render(<ClassifyOptions value={value} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/top-k/i)).toHaveValue(5);
    expect(screen.getByLabelText(/width/i)).toHaveValue(224);
    expect(screen.getByLabelText(/height/i)).toHaveValue(224);
  });

  it("calls onChange with the updated top-K when edited", () => {
    const onChange = vi.fn();
    const value: ClassifyOptionsValue = { topK: 5, width: 224, height: 224 };
    render(<ClassifyOptions value={value} onChange={onChange} />);

    const input = screen.getByLabelText(/top-k/i);
    fireEvent.change(input, { target: { value: "3" } });

    expect(onChange).toHaveBeenLastCalledWith({ topK: 3, width: 224, height: 224 });
  });

  it("disables all fields when disabled is true", () => {
    const value: ClassifyOptionsValue = { topK: 5, width: 224, height: 224 };
    render(<ClassifyOptions value={value} onChange={vi.fn()} disabled />);
    expect(screen.getByLabelText(/top-k/i)).toBeDisabled();
    expect(screen.getByLabelText(/width/i)).toBeDisabled();
    expect(screen.getByLabelText(/height/i)).toBeDisabled();
  });
});
