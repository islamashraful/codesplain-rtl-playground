import { screen, render } from "@testing-library/react";
import { createServer } from "../../test/server";
import { MemoryRouter } from "react-router-dom";
import AuthButtons from "./AuthButtons";
import { SWRConfig } from "swr";

async function renderComponnent() {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter>
        <AuthButtons />
      </MemoryRouter>
    </SWRConfig>
  );

  await screen.findAllByRole("link");
}

describe("when user is signed in", () => {
  createServer([
    {
      path: "/api/user",
      res: () => ({ user: { id: 1, email: "user@email.com" } }),
    },
  ]);

  test("sign in and sign up btn is not visible", async () => {
    await renderComponnent();

    const signInBtn = screen.queryByRole("link", { name: /sign in/i });
    const signUpBtn = screen.queryByRole("link", { name: /sign up/i });

    expect(signInBtn).not.toBeInTheDocument();
    expect(signUpBtn).not.toBeInTheDocument();
  });

  test("sign out is visible", async () => {
    await renderComponnent();

    const signOutBtn = screen.getByRole("link", { name: /Sign Out/i });

    expect(signOutBtn).toBeInTheDocument();
  });
});

describe("when user is not signed in", () => {
  createServer([
    {
      path: "/api/user",
      res: () => ({ user: null }),
    },
  ]);

  test("sign in and sign up btn is visible", async () => {
    await renderComponnent();

    const signInBtn = screen.getByRole("link", { name: /sign in/i });
    const signUpBtn = screen.getByRole("link", { name: /sign up/i });

    expect(signInBtn).toBeInTheDocument();
    expect(signInBtn).toHaveAttribute("href", "/signin");
    expect(signUpBtn).toBeInTheDocument();
    expect(signUpBtn).toHaveAttribute("href", "/signup");
  });

  test("sign out is not visible", async () => {
    await renderComponnent();

    const signOutBtn = screen.queryByRole("link", { name: /Sign Out/i });

    expect(signOutBtn).not.toBeInTheDocument();
  });
});
