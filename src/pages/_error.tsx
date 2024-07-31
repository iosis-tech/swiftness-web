import React from "react";
import { NextPage, NextPageContext } from "next";

interface ErrorPageProps {
  statusCode?: number;
}

const ErrorPage: NextPage<ErrorPageProps> = ({ statusCode }) => (
  <div>
    <h1>An error occurred</h1>
    {statusCode && <p>Status code: {statusCode}</p>}
  </div>
);

ErrorPage.getInitialProps = async (ctx: NextPageContext) => {
  const statusCode = ctx.err ? ctx.err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
