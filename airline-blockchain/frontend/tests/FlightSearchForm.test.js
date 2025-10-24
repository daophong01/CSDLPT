import { render, screen, fireEvent } from "@testing-library/react";
import FlightSearchForm from "../components/FlightSearchForm";
import axios from "axios";

jest.mock("axios");

test("renders and submits search form", async () => {
  const onResults = jest.fn();
  axios.post.mockResolvedValue({ data: { flights: [] } });

  render(<FlightSearchForm onResults={onResults} />);
  fireEvent.change(screen.getByPlaceholderText(/From/i), { target: { value: "HAN" } });
  fireEvent.change(screen.getByPlaceholderText(/To/i), { target: { value: "SGN" } });
  fireEvent.click(screen.getByText(/Search/i));

  expect(axios.post).toHaveBeenCalled();
});