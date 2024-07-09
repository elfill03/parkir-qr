import React from "react";
import { Profilebar, Sidebarpetugas } from "../../components";

const ScanMasuk = () => {
  return (
    <>
      <div className="flex">
        <Sidebarpetugas />
        <div className="flex flex-col bg-white-maron flex-grow min-h-screen">
          <Profilebar />
          <center>
            <div className="mb-5">
              <div className="flex" style={{ width: "90%" }}>
                <h1 className="font-semibold text-2xl">Scan Masuk Parkir</h1>
              </div>
              <hr
                className="mb-5 bg-grey-maron pt-1 mt-2"
                style={{ width: "90%" }}
              />
            </div>
          </center>
        </div>
      </div>
    </>
  );
};

export default ScanMasuk;
