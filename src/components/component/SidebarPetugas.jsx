import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import React, { useState } from "react";
import {
  BsArrowLeftCircle,
  BsArrowRight,
  BsClockHistory,
  BsHouseDoor,
  BsQrCodeScan,
} from "react-icons/bs";
import { NavLink } from "react-router-dom";
import { img1 } from "../../assets";

const SidebarPetugas = () => {
  const [open, setOpen] = useState(true);

  return (
    <>
      <div className="flex">
        {open && (
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setOpen(false)}
          ></div>
        )}
        <div
          className={`${
            open ? "w-96" : "w-0"
          } h-screen fixed duration-500 ease-in-out bg-white-light flex flex-col z-50 shadow-2xl`}
        >
          <div>
            <BsArrowLeftCircle
              className={`bg-white-light text-dark text-3xl rounded-full absolute cursor-pointer -right-2 top-20 ${
                !open ? "rotate-180 -right-9 top-9" : ""
              } duration-500 ease-in-out`}
              onClick={() => setOpen(!open)}
            />
            <div>
              <center>
                <img
                  src={img1}
                  alt="Telkom University Surabaya"
                  className="mt-4"
                />
                <hr className="bg-red-maron pt-1 mt-3 transition-all duration-500 ease-in-out" />
                <div
                  className={`flex items-center bg-white-maron text-red-maron text-xl mt-7 rounded-lg transition-transform duration-500 ease-in-out ${
                    open ? "w-72" : "hidden"
                  }`}
                >
                  <div className="flex py-5">
                    <NavLink
                      to="/dashboard"
                      className={({ isActive }) =>
                        `flex items-center ${
                          isActive
                            ? " text-red-maron bg-white-maron"
                            : "text-gray-900"
                        } ${!open && "cursor-pointer"}`
                      }
                    >
                      <BsHouseDoor
                        className={`mx-auto ms-4 text-3xl transition-opacity duration-500 ease-in ${
                          !open ? "opacity-0 hidden" : ""
                        }`}
                      />
                      <span
                        className={`ms-4 my-auto font-semibold transition-opacity duration-500 ease-in ${
                          !open ? "opacity-0 hidden" : ""
                        }`}
                      >
                        Dashboard
                      </span>
                    </NavLink>
                  </div>
                </div>
              </center>
            </div>

            <center>
              <div
                className={`text-xl rounded-lg transition-transform duration-500 ease-in-out ${
                  open ? "w-72" : "hidden"
                }`}
              >
                <Menu
                  as="div"
                  className="relative inline-block text-left w-full mt-4"
                >
                  <div>
                    <MenuButton className="inline-flex w-full justify-start gap-x-1.5 rounded-md bg-white-light px-4 py-2 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-white-maron transition-all duration-500 ease-in-out">
                      <BsQrCodeScan className="my-auto ms-1 text-2xl" />
                      <span
                        className={`${
                          !open && "hidden"
                        } ms-4 transition-opacity duration-500 ease-in-out`}
                      >
                        Scan QR Code
                      </span>
                      <ChevronDownIcon
                        className={`-mr-1 h-5 w-5 text-black ms-auto me-6 ${
                          !open && "hidden"
                        }`}
                        aria-hidden="true"
                      />
                    </MenuButton>
                  </div>
                  <MenuItems
                    className={`absolute right-0 z-10 mt-2 w-72 origin-top-right divide-y divide-gray-100 rounded-md bg-white-light shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-500 ease-in-out ${
                      !open && "hidden"
                    }`}
                  >
                    <div className="py-1">
                      <MenuItem>
                        {({ active }) => (
                          <NavLink
                            to="/scan-masuk-parkir"
                            className={({ isActive }) =>
                              `flex px-4 py-2 text-base ${
                                isActive
                                  ? "text-red-maron bg-white-maron"
                                  : "text-gray-700"
                              }`
                            }
                          >
                            <BsArrowRight className="my-auto" />
                            <span className="ms-3">Masuk Parkir</span>
                          </NavLink>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <NavLink
                            to="/scan-keluar-parkir"
                            className={({ isActive }) =>
                              `flex px-4 py-2 text-base ${
                                isActive
                                  ? " text-red-maron bg-white-maron"
                                  : "text-gray-700"
                              }`
                            }
                          >
                            <BsArrowRight className="my-auto" />
                            <span className="ms-3">Keluar Parkir</span>
                          </NavLink>
                        )}
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
                <Menu
                  as="div"
                  className="relative inline-block text-left w-full mt-4"
                >
                  <div>
                    <MenuButton className="inline-flex w-full justify-start gap-x-1.5 rounded-md bg-white-light px-4 py-2 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-white-maron transition-all duration-500 ease-in-out">
                      <BsClockHistory className="my-auto ms-1 text-2xl" />
                      <span
                        className={`${
                          !open && "hidden"
                        } ms-4 transition-opacity duration-500 ease-in-out`}
                      >
                        Riwayat Scan QR
                      </span>
                      <ChevronDownIcon
                        className={`-mr-1 h-5 w-5 text-black ms-auto me-6 ${
                          !open && "hidden"
                        }`}
                        aria-hidden="true"
                      />
                    </MenuButton>
                  </div>
                  <MenuItems
                    className={`absolute right-0 z-10 mt-2 w-72 origin-top-right divide-y divide-gray-100 rounded-md bg-white-light shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-500 ease-in-out ${
                      !open && "hidden"
                    }`}
                  >
                    <div className="py-1">
                      <MenuItem>
                        {({ active }) => (
                          <NavLink
                            to="/riwayat-masuk-parkir"
                            className={({ isActive }) =>
                              `flex px-4 py-2 text-base ${
                                isActive
                                  ? "text-red-maron bg-white-maron"
                                  : "text-gray-700"
                              }`
                            }
                          >
                            <BsArrowRight className="my-auto" />
                            <span className="ms-3">Masuk Parkir</span>
                          </NavLink>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <NavLink
                            to="/riwayat-keluar-parkir"
                            className={({ isActive }) =>
                              `flex px-4 py-2 text-base ${
                                isActive
                                  ? " text-red-maron bg-white-maron"
                                  : "text-gray-700"
                              }`
                            }
                          >
                            <BsArrowRight className="my-auto" />
                            <span className="ms-3">Keluar Parkir</span>
                          </NavLink>
                        )}
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
              </div>
            </center>
          </div>
          <div className="mt-auto mb-5">
            <h1
              className={`${
                !open && "hidden"
              } text-black text-lg text-center p-4 md:text-base sm:text-sm sm:p-2 transition-opacity duration-500 ease-in-out`}
            >
              Copyright @ telkomuniversitysurabaya
            </h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarPetugas;
