# Codesplain RTL Playground

This repository is a playground project with react and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) to show common test cases that usualy needs to covered in react applications. It includes all the basic configurations for React Testing Library, [Mock Service Workers](https://mswjs.io/) and debugging scripts.

## Testing Scenarios

1. A simple component that just displays data passed down as props.
   <details>
   <summary><code>RepositoriesSummary.test.js</code></summary>

   ```js
   import { render, screen } from "@testing-library/react";
   import RepositoriesSummary from "./RepositoriesSummary";

   test("displays information about the repository", () => {
     const repository = {
       stargazers_count: 1,
       open_issues: 2,
       forks: 3,
       language: "Javascript",
     };
     render(<RepositoriesSummary repository={repository} />);

     for (let key in repository) {
       const element = screen.getByText(new RegExp(repository[key]));
       expect(element).toBeInTheDocument();
     }
   });
   ```

   </details>

2. Handling `Link` in test env with some async tests.
   <details>
   <summary><code>RepositoriesListItem.test.js</code></summary>

   ```js
   import { render, screen } from "@testing-library/react";
   import { MemoryRouter } from "react-router-dom";
   import RepositoriesListItem from "./RepositoriesListItem";

   function renderComponent() {
     const repository = {
       full_name: "facebook/react",
       language: "Javascript",
       description: "A frontend lib",
       owner: {
         login: "facebook",
       },
       name: "react",
       html_url: "https://github.com/facebook/react",
     };

     render(
       <MemoryRouter>
         <RepositoriesListItem repository={repository} />
       </MemoryRouter>
     );

     return { repository };
   }

   test("show github repo url in the list item", async () => {
     const { repository } = renderComponent();

     await screen.findByRole("img", { name: "Javascript" });

     const link = screen.getByRole("link", { name: /github repository/ });
     expect(link).toHaveAttribute("href", repository.html_url);
   });

   test("shows a fileicon with the appropriate icon", async () => {
     renderComponent();

     const icon = await screen.findByRole("img", { name: "Javascript" });

     expect(icon).toHaveClass("js-icon");
   });

   test("shows a link to the code editor page", async () => {
     const { repository } = renderComponent();

     await screen.findByRole("img", { name: "Javascript" });

     const link = await screen.findByRole("link", {
       name: new RegExp(repository.owner.login),
     });

     expect(link).toHaveAttribute(
       "href",
       `/repositories/${repository.full_name}`
     );
   });
   ```

   </details>

3. Intercept network calls using MSW, using mocking instead of api.

   <details>
   <summary><code>HomeRoute.test.js</code></summary>

   ```js
   import { render, screen } from "@testing-library/react";
   import { MemoryRouter } from "react-router-dom";
   import HomeRoute from "./HomeRoute";
   import { createServer } from "../test/server";

   createServer([
     {
       path: "/api/repositories",
       res: (req) => {
         const language = req.url.searchParams.get("q");
         return {
           items: [
             { id: 1, full_name: `${language.split("language:")[1]}_one` },
             { id: 2, full_name: `${language.split("language:")[1]}_two` },
           ],
         };
       },
     },
   ]);

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
   ```

   </details>

4. Tests for authentication
   <details>
   <summary><code>AuthButtons.test.js</code></summary>

   ```js
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
   ```

   </details>
