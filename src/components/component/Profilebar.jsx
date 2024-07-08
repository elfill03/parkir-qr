import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import React, { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { img7 } from "../../assets";

const Profilebar = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <>
      <div className="flex justify-end bg-white-light shadow-md mb-5">
        <Menu as="div" className="relative">
          <MenuButton className="relative flex items-center justify-center text-base focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 p-3 ps-4 pe-8 border-l-2 border-grey-maron">
            <span className="sr-only">Open user menu</span>
            <img
              className="h-10 w-10 rounded-full"
              src={user?.foto_profile ?? img7}
              alt="photo profile"
            />

            <h1 className="text-black ms-4">{user?.nama || "Admin"}</h1>
          </MenuButton>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 z-10 mt-0 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <MenuItem>
                {({ active }) => (
                  <a
                    href="#"
                    className={`${
                      active ? "bg-gray-100" : ""
                    } block px-4 py-2 text-sm text-gray-700`}
                  >
                    Your Profile
                  </a>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={handleSignOut}
                    className={`${
                      active ? "bg-gray-100" : ""
                    } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                  >
                    Sign out
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Transition>
        </Menu>
      </div>
    </>
  );
};

export default Profilebar;
