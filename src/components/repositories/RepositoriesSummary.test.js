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
