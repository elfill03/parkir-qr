import React from "react";
import {
  Footer,
  Profilebar,
  Sidebar,
  Tabelriwayatmasuk,
} from "../.././components";

const RiwayatScanMasuk = () => {
  return (
    <>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        {/* End Sidebar */}

        <div className="flex flex-col bg-white-maron flex-grow min-h-screen max-w-screen">
          {/* Profile Navbar */}
          <Profilebar />
          {/* End Profile Navbar */}

          {/* Table Content */}
          <Tabelriwayatmasuk />
          {/* End Table Content */}

          {/* Footer */}
          {/* <Footer /> */}
          {/* End Footer */}
        </div>
      </div>
    </>
  );
};

export default RiwayatScanMasuk;
