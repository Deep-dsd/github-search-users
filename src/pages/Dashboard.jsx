import React from "react";
import { Info, Repos, User, Search, Navbar } from "../components";
import loadingImage from "../assets/preloader.gif";
import { useGithubContext } from "../context/context";

const Dashboard = () => {
  const { loading } = useGithubContext();
  if (loading) {
    return (
      <main>
        <Navbar />
        <Search />
        <img src={loadingImage} alt="loading..." className="loading-img" />
      </main>
    );
  }
  return (
    <main>
      <Navbar />
      <Search />
      <Info />
      <User />
      <Repos />
    </main>
  );
};

export default Dashboard;
