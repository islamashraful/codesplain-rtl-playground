import { render, screen } from "@testing-library/react";
import { setupServer } from "msw/node";
import { rest } from "msw";
import { MemoryRouter } from "react-router-dom";
import HomeRoute from "./HomeRoute";

const handlers = [
  rest.get("/api/repositories", (req, res, ctx) => {
    const language = req.url.searchParams.get("q");

    return res(
      ctx.json({
        items: [
          { id: 1, full_name: `${language.split("language:")[1]}_one` },
          { id: 2, full_name: `${language.split("language:")[1]}_two` },
        ],
      })
    );
  }),
];
const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

test("renders two links for each language", async () => {
  render(
    <MemoryRouter>
      <HomeRoute />
    </MemoryRouter>
  );

  const languages = [
    "rust",
    "javascript",
    "typescript",
    "go",
    "java",
    "python",
  ];
  for (let item of languages) {
    const links = await screen.findAllByRole("link", {
      name: new RegExp(`${item}_`),
    });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent(`${item}_one`);
    expect(links[1]).toHaveTextContent(`${item}_two`);
    expect(links[0]).toHaveAttribute("href", `/repositories/${item}_one`);
    expect(links[1]).toHaveAttribute("href", `/repositories/${item}_two`);
  }
});
