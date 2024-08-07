import React from "react";
import { img2, img3 } from "../../assets";
import { Profilebar, Sidebarmahasiswa } from "../../components";

const DashboardMahasiswa = () => {
  return (
    <>
      <div className="flex">
        <Sidebarmahasiswa />
        <div className="flex flex-col bg-white-maron flex-grow min-h-screen">
          <Profilebar />
          <div className="flex flex-col items-center justify-center flex-grow text-center p-4">
            <div className="flex lg:text-start text-center">
              <h1 className="text-4xl font-bold my-auto">
                WELCOME <br />
                SMART PARKING QR SCAN
              </h1>
              <img
                src={img2}
                alt="Telkom University"
                className="my-auto hidden sm:block"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="flex items-center justify-center">
              <img
                src={img3}
                alt="Car and QR Code"
                className="mt-5"
                style={{ width: "70%", height: "auto" }}
              />
            </div>
          </div>

          {/* <Footer /> */}
        </div>
      </div>
    </>
  );
};

export default DashboardMahasiswa;
