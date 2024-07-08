import React from "react";
import { Footer, Profilebar, Sidebar } from "../../components";

const DashboardPetugas = () => {
  return (
    <>
      <div className="flex">
        <Sidebar />
        <div className="flex flex-col bg-white-maron flex-grow min-h-screen">
          <Profilebar />
          <Footer />
        </div>
      </div>
    </>
  );
};

export default DashboardPetugas;
