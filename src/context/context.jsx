import React, { useEffect, createContext, useContext, useReducer } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";
const GithubContext = createContext();

const ACTIONS = {
  SEARCH_USER: "SEARCH_USER",
  SETTING_SEARCH_INPUT: "SETTING_SEARCH_INPUT",
  RATE_LIMIT: "RATE_LIMIT",
  SHOW_ERROR: "SHOW_ERROR",
  LOADER: "LOADER",
  GETTING_REPOS: "GETTING_REPOS",
  GETTING_FOLLOWERS: "GETTING_FOLLOWERS",
};

const initialState = {
  inputValue: "",
  githubUser: mockUser,
  repos: mockRepos,
  followers: mockFollowers,
  requests: 0,
  loading: false,
  error: { show: false, msg: "" },
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SETTING_SEARCH_INPUT:
      return { ...state, inputValue: action.payload };

    case ACTIONS.RATE_LIMIT:
      return { ...state, requests: action.payload.remaining };

    case ACTIONS.SEARCH_USER:
      return { ...state, githubUser: action.payload };

    case ACTIONS.GETTING_REPOS:
      return { ...state, repos: action.payload };

    case ACTIONS.GETTING_FOLLOWERS:
      return { ...state, followers: action.payload };

    case ACTIONS.SHOW_ERROR:
      return { ...state, error: action.payload };

    case ACTIONS.LOADER:
      return { ...state, loading: action.payload };

    default:
      console.log("Something Went Wrong.");
  }
};
export const GithubProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  //Check rate
  const checkRequests = async () => {
    try {
      const res = await axios(`${rootUrl}/rate_limit`);
      let data = await res.data;
      dispatch({ type: ACTIONS.RATE_LIMIT, payload: data.rate });
      if (data.rate.remaining === 0) {
        errorHandler(true, "sorry, you have exceeded your hourly rate limit!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkRequests();
  }, []);

  //Searching for github user
  const searchGithubUser = async (user) => {
    errorHandler(true, "");
    dispatch({ type: ACTIONS.LOADER, payload: true });

    const res = await axios(`${rootUrl}/users/${user}`).catch((err) =>
      console.log(err)
    );
    if (res) {
      dispatch({ type: ACTIONS.SEARCH_USER, payload: res.data });
      const { login, followers_url } = res.data;

      //Repos and Followers
      await Promise.allSettled([
        axios(`${rootUrl}/users/${login}/repos?per_page=100`),
        axios(`${followers_url}?per_page=100`),
      ])
        .then((results) => {
          const [repos, followers] = results;
          const status = "fulfilled";
          if (repos.status === status) {
            dispatch({
              type: ACTIONS.GETTING_REPOS,
              payload: repos.value.data,
            });
          }
          if (followers.status === status) {
            dispatch({
              type: ACTIONS.GETTING_FOLLOWERS,
              payload: followers.value.data,
            });
          }
        })
        .catch((err) => console.log(err));
    } else {
      errorHandler(true, "There is no user with that username");
    }
    checkRequests();
    dispatch({ type: ACTIONS.LOADER, payload: false });
  };
  const gettingUserInput = (e) => {
    e.preventDefault();
    if (state.inputValue) {
      searchGithubUser(state.inputValue);
    }
  };

  //Error Handler Function
  function errorHandler(isError, value) {
    dispatch({
      type: ACTIONS.SHOW_ERROR,
      payload: {
        show: isError,
        msg: value,
      },
    });
  }

  // User Input
  const settingUserInput = (e) => {
    dispatch({ type: ACTIONS.SETTING_SEARCH_INPUT, payload: e.target.value });
  };
  return (
    <GithubContext.Provider
      value={{ ...state, gettingUserInput, settingUserInput }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export const useGithubContext = () => {
  return useContext(GithubContext);
};
