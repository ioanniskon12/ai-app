import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`

* {
   margin: 0; padding: 0; box-sizing: border-box;
  }
html {
    font-size: 16px; /* Base font size */
    scroll-behavior: smooth; /* Smooth scrolling */
  }
  body, html {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow-x: hidden; /* Prevent horizontal scroll */
  }
  a {
    text-decoration: none; /* Remove underline from links */
    color: inherit; /* Inherit color from parent */
  }
  button {
    cursor: pointer; /* Change cursor to pointer for buttons */
    border: none; /* Remove default border */
    background: none; /* Remove default background */
  }

`;

export default GlobalStyle;
