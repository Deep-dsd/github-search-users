import React from "react";
import styled from "styled-components";
import {
  ExampleChart,
  Doughnut3D,
  Column2D,
  Bar3D,
  Doughnut2D,
} from "./Charts";
import { useGithubContext } from "../context/context";
const Repos = () => {
  const { repos } = useGithubContext();
  let repoLanguages = {};
  let mostStars = {};

  const utilityFunction = (obj) => {
    return Object.values(obj)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  repos.forEach((repo) => {
    const { language, stargazers_count } = repo;
    if (language) {
      if (
        repoLanguages[language] !== undefined &&
        mostStars[language] !== undefined
      ) {
        repoLanguages[language] = {
          ...repoLanguages[language],
          value: repoLanguages[language].value + 1,
        };
        mostStars[language] = {
          ...mostStars[language],
          value: mostStars[language].value + stargazers_count,
        };
      } else {
        repoLanguages = {
          ...repoLanguages,
          [language]: { label: language, value: 1 },
        };
        mostStars = {
          ...mostStars,
          [language]: { label: language, value: stargazers_count },
        };
      }
    }
  });

  let { stars, forks } = repos.reduce(
    (total, repo) => {
      const { stargazers_count, name, forks } = repo;
      total.stars[stargazers_count] = { label: name, value: stargazers_count };
      total.forks[forks] = { label: name, value: forks };
      return total;
    },
    { stars: {}, forks: {} }
  );

  stars = Object.values(stars).slice(-5).reverse();
  forks = Object.values(forks).slice(-5).reverse();

  repoLanguages = utilityFunction(repoLanguages);
  mostStars = utilityFunction(mostStars);

  return (
    <section className="section">
      <Wrapper className="section-center">
        {/* <ExampleChart />; */}
        <Doughnut3D data={repoLanguages} />
        <Column2D data={stars} />
        <Doughnut2D data={mostStars} />
        <Bar3D data={forks} />
      </Wrapper>
    </section>
  );
};

const Wrapper = styled.div`
  display: grid;
  justify-items: center;
  gap: 2rem;
  @media (min-width: 800px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: 1200px) {
    grid-template-columns: 2fr 3fr;
  }

  div {
    width: 100% !important;
  }
  .fusioncharts-container {
    width: 100% !important;
  }
  svg {
    width: 100% !important;
    border-radius: var(--radius) !important;
  }
`;

export default Repos;
