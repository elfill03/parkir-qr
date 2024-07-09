import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import bcrypt from "bcryptjs";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { img7 } from "../../assets";
import { storage } from "../../config/firebase/firebaseConfig";
import { Notification } from "../../components";

const GET_USER_DATA = gql`
  query GetUserData($userId: Int!) {
    users_by_pk(id: $userId) {
      id
      nama
      email
      role_id
      mahasiswas {
        NIM
      }
      foto_profile
    }
  }
`;

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $id: Int!
    $password: String
    $foto_profile: String
  ) {
    update_users_by_pk(
      pk_columns: { id: $id }
      _set: { password: $password, foto_profile: $foto_profile }
    ) {
      id
      nama
      email
      foto_profile
    }
  }
`;

const Profilebar = () => {
  const userId = JSON.parse(localStorage.getItem("user")).id;
  const navigate = useNavigate();
  const [profileDialogVisible, setProfileDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [notification, setNotification] = useState(false);
  const [newProfile, setNewProfile] = useState({
    password: "",
    foto_profile: null,
  });
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [errors, setErrors] = useState({});

  const { data, loading, error } = useQuery(GET_USER_DATA, {
    variables: { userId },
  });

  const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: () => {
      setLoadingUpdate(false);
      setEditDialogVisible(false);
      setNotification(true);
    },
    onError: (error) => {
      console.error(error);
      setLoadingUpdate(false);
    },
  });

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleProfileClick = () => {
    setProfileDialogVisible(true);
  };

  const handleEditProfileClick = () => {
    setEditDialogVisible(true);
  };

  const handleCloseDialog = () => {
    setProfileDialogVisible(false);
  };

  const handleCloseEditDialog = () => {
    setEditDialogVisible(false);
  };

  const closeNotification = () => {
    setNotification(false);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "foto_profile") {
      setNewProfile((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setNewProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditProfile = async () => {
    const newErrors = {};
    if (!newProfile.password) {
      newErrors.password = "Password harus diisi";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoadingUpdate(true);
    let foto_profile_url = data.users_by_pk.foto_profile;

    if (newProfile.foto_profile) {
      const storageRef = ref(
        storage,
        `profile_pictures/${userId}_${Date.now()}`
      );
      await uploadBytes(storageRef, newProfile.foto_profile);
      foto_profile_url = await getDownloadURL(storageRef);
    }

    let hashedPassword = data.users_by_pk.password;
    if (newProfile.password) {
      hashedPassword = await bcrypt.hash(newProfile.password, 10);
    }

    await updateUserProfile({
      variables: {
        id: userId,
        password: hashedPassword,
        foto_profile: foto_profile_url,
      },
    });
  };

  if (error) return <p>Error: {error.message}</p>;

  const user = data?.users_by_pk;
  const NIM = user?.mahasiswas?.[0]?.NIM;

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
                  <button
                    onClick={handleProfileClick}
                    className={`${
                      active ? "bg-gray-100" : ""
                    } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                  >
                    Your Profile
                  </button>
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

      <Dialog
        header="User Profile"
        visible={profileDialogVisible}
        onHide={handleCloseDialog}
        draggable={false}
        className="centered-dialog w-11/12 sm:w-96 max-w-full p-0 bg-white rounded-lg shadow-lg"
      >
        <div className="p-4 flex flex-col items-center space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <ProgressSpinner />
            </div>
          ) : (
            <>
              <h1 className="text-lg font-bold">Photo Profile</h1>
              <img
                src={user?.foto_profile ?? img7}
                alt="Profile"
                className="h-24 w-24 rounded-full mb-4 shadow-md"
              />
              <div className="text-center">
                <h1 className="text-lg font-bold">Nama:</h1>
                <h1 className="text-xl font-semibold">{user?.nama}</h1>
              </div>
              <div className="text-center">
                <h1 className="text-lg font-bold">Email:</h1>
                <p>{user?.email}</p>
              </div>
              {user?.role_id === 3 && (
                <div className="text-center">
                  <p className="text-lg font-bold">NIM:</p>
                  <p>{NIM}</p>
                </div>
              )}

              <Button
                label="Edit Profile"
                className="bg-red-maron hover:bg-red-700 text-white py-2 px-3 my-2 rounded flex justify-center"
                onClick={handleEditProfileClick}
              />
            </>
          )}
        </div>
      </Dialog>

      <Dialog
        header="Edit Profile"
        visible={editDialogVisible}
        onHide={handleCloseEditDialog}
        draggable={false}
        className="centered-dialog w-11/12 sm:w-96 max-w-full p-0 bg-white rounded-lg shadow-lg"
      >
        <div className="p-4 flex flex-col items-center space-y-4">
          {loadingUpdate ? (
            <div className="flex justify-center items-center h-32">
              <ProgressSpinner />
            </div>
          ) : (
            <>
              <h1 className="text-lg font-bold">Edit Profile</h1>
              <div className="p-field">
                <label htmlFor="foto_profile">Photo Profile</label>
                <InputText
                  id="foto_profile"
                  name="foto_profile"
                  type="file"
                  onChange={handleInputChange}
                  className={`w-full input-border `}
                />
              </div>
              <div className="p-field w-full">
                <label htmlFor="password">Password</label>
                <Password
                  id="password"
                  name="password"
                  value={newProfile.password}
                  onChange={handleInputChange}
                  toggleMask
                  className={`w-full input-border ${
                    errors.password ? "p-invalid" : ""
                  }`}
                />
                {errors.password && (
                  <small className="p-error">{errors.password}</small>
                )}
              </div>

              <button
                className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded mt-4"
                onClick={handleEditProfile}
              >
                Save
              </button>
            </>
          )}
        </div>
      </Dialog>
      <Notification
        message="Berhasil mengubah profil"
        visible={notification}
        onClose={closeNotification}
      />
    </>
  );
};

export default Profilebar;
