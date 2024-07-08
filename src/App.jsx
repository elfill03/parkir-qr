import React from "react";
import RootRouter from "./RootRouter";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient"; 

const App = () => {
  return (
    <ApolloProvider client={client}>
      <RootRouter />
    </ApolloProvider>
  );
};

export default App;
