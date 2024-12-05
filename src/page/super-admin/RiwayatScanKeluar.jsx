import React from "react";
import {
  Profilebar,
  Sidebar,
  Sidebarpetugas,
  Tabelriwayatkeluar,
} from "../.././components";

const RiwayatScanKeluar = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const roleId = user?.role_id;
  return (
    <>
      <div className="flex">
        {/* Sidebar */}
        {roleId === 1 && <Sidebar />}
        {roleId === 2 && <Sidebarpetugas />}
        {/* End Sidebar */}

        <div className="flex flex-col bg-white-maron flex-grow min-h-screen w-screen">
          {/* Profile Navbar */}
          <Profilebar />
          {/* End Profile Navbar */}

          {/* Table Content */}
          <Tabelriwayatkeluar />
          {/* End Table Content */}

          {/* Footer */}
          {/* <Footer /> */}
          {/* End Footer */}
        </div>
      </div>
    </>
  );
};

export default RiwayatScanKeluar;
