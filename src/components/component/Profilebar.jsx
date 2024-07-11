import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import bcrypt from "bcryptjs"; // Assuming you're using bcryptjs for password hashing
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { img7 } from "../../assets";
import { Notification } from "../../components";
import { storage } from "../../config/firebase/firebaseConfig";

const GET_USER_DATA = gql`
  query GetUserData($userId: Int!) {
    users_by_pk(id: $userId) {
      id
      nama
      email
      role_id
      password
      mahasiswas {
        NIM
      }
      foto_profile
    }
  }
`;

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($id: Int!, $foto_profile: String) {
    update_users_by_pk(
      pk_columns: { id: $id }
      _set: { foto_profile: $foto_profile }
    ) {
      id
      nama
      email
      foto_profile
    }
  }
`;

const CHANGE_USER_PASSWORD = gql`
  mutation ChangeUserPassword($id: Int!, $password: String!) {
    update_users_by_pk(pk_columns: { id: $id }, _set: { password: $password }) {
      id
      nama
    }
  }
`;

const Profilebar = () => {
  const userId = JSON.parse(localStorage.getItem("user")).id;
  const navigate = useNavigate();
  const [profileDialogVisible, setProfileDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);
  const [notification, setNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [newProfile, setNewProfile] = useState({
    foto_profile: null,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [errors, setErrors] = useState({});

  const { data, loading, error } = useQuery(GET_USER_DATA, {
    variables: { userId },
  });

  useEffect(() => {
    if (data && data.users_by_pk) {
      setPasswordData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }
  }, [data]);

  const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: () => {
      setLoadingUpdate(false);
      setEditDialogVisible(false);
      setNotificationMessage("Berhasil mengubah foto profile");
      setNotification(true);
      setErrors({});
    },
    onError: (error) => {
      console.error(error);
      setLoadingUpdate(false);
    },
  });

  const [changeUserPassword] = useMutation(CHANGE_USER_PASSWORD, {
    onCompleted: () => {
      setLoadingUpdate(false);
      setPasswordDialogVisible(false);
      setNotificationMessage("Berhasil mengubah password");
      setNotification(true);
      setErrors({});
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

  const handleChangePasswordClick = () => {
    setPasswordDialogVisible(true);
  };

  const handleCloseDialog = () => {
    setProfileDialogVisible(false);
    setErrors({});
  };

  const handleCloseEditDialog = () => {
    setEditDialogVisible(false);
    setErrors({});
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogVisible(false);
    setErrors({});
  };

  const closeNotification = () => {
    setNotification(false);
  };

  const handleInputChange = (e) => {
    const { name, files, value } = e.target;
    if (name === "foto_profile") {
      setNewProfile((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setPasswordData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditProfile = async () => {
    const newErrors = {};
    if (!newProfile.foto_profile) {
      newErrors.foto_profile = "Foto profil harus diisi";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoadingUpdate(true);
    let foto_profile_url = data.users_by_pk.foto_profile;

    if (newProfile.foto_profile) {
      // Delete old profile photo
      if (foto_profile_url) {
        const oldPhotoRef = ref(storage, foto_profile_url);
        await deleteObject(oldPhotoRef).catch((error) => {
          console.error("Error deleting old profile photo:", error);
        });
      }

      // Upload new profile photo
      const storageRef = ref(
        storage,
        `profile_pictures/${userId}_${Date.now()}`
      );
      await uploadBytes(storageRef, newProfile.foto_profile);
      foto_profile_url = await getDownloadURL(storageRef);
    }

    await updateUserProfile({
      variables: {
        id: userId,
        foto_profile: foto_profile_url,
      },
    });
  };

  const handleChangePassword = async () => {
    const newErrors = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Password saat ini harus diisi";
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = "Password baru harus diisi";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak sesuai";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoadingUpdate(true);

    // Add logic to verify the current password here
    // Assuming `data.users_by_pk.password` contains the hashed password
    if (data && data.users_by_pk && data.users_by_pk.password) {
      const currentHashedPassword = data.users_by_pk.password;
      const isCurrentPasswordValid = await bcrypt.compare(
        passwordData.currentPassword,
        currentHashedPassword
      );

      if (!isCurrentPasswordValid) {
        setErrors({ currentPassword: "Password saat ini salah" });
        setLoadingUpdate(false);
        return;
      }

      const newHashedPassword = await bcrypt.hash(passwordData.newPassword, 10);

      await changeUserPassword({
        variables: {
          id: userId,
          password: newHashedPassword,
        },
      });
    } else {
      setErrors({ currentPassword: "Data pengguna tidak ditemukan" });
      setLoadingUpdate(false);
    }
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
              alt="foto profile"
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
              <h1 className="text-lg font-bold">Foto Profile</h1>
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
                label="Edit Foto Profile"
                className="bg-red-maron hover:bg-red-700 text-white py-2 px-3 my-2 rounded flex justify-center"
                onClick={handleEditProfileClick}
              />
              <Button
                label="Ubah Password"
                className="bg-red-maron hover:bg-red-700 text-white py-2 px-3 my-2 rounded flex justify-center"
                onClick={handleChangePasswordClick}
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
              <h1 className="text-lg font-bold">Edit Foto Profile</h1>
              <div className="p-field">
                <label htmlFor="foto_profile">Foto Profile</label>
                <InputText
                  id="foto_profile"
                  name="foto_profile"
                  type="file"
                  onChange={handleInputChange}
                  className={`w-full input-border ${
                    errors.foto_profile ? "p-invalid" : ""
                  }`}
                />
                {errors.foto_profile && (
                  <small className="p-error">{errors.foto_profile}</small>
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

      <Dialog
        header="Ubah Password"
        visible={passwordDialogVisible}
        onHide={handleClosePasswordDialog}
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
              <div className="p-field">
                <label htmlFor="currentPassword">Password Saat Ini</label>
                <Password
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handleInputChange}
                  className={`w-full input-border ${
                    errors.currentPassword ? "p-invalid" : ""
                  }`}
                  toggleMask
                  feedback={false}
                />
                {errors.currentPassword && (
                  <small className="p-error">{errors.currentPassword}</small>
                )}
              </div>
              <div className="p-field">
                <label htmlFor="newPassword">Password Baru</label>
                <Password
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handleInputChange}
                  className={`w-full input-border ${
                    errors.newPassword ? "p-invalid" : ""
                  }`}
                  toggleMask
                  feedback={false}
                />
                {errors.newPassword && (
                  <small className="p-error">{errors.newPassword}</small>
                )}
              </div>
              <div className="p-field">
                <label htmlFor="confirmPassword">Konfirmasi Password</label>
                <Password
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full input-border ${
                    errors.confirmPassword ? "p-invalid" : ""
                  }`}
                  toggleMask
                  feedback={false}
                />
                {errors.confirmPassword && (
                  <small className="p-error">{errors.confirmPassword}</small>
                )}
              </div>
              <button
                className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded mt-4"
                onClick={handleChangePassword}
              >
                Ubah Password
              </button>
            </>
          )}
        </div>
      </Dialog>

      <Notification
        message={notificationMessage}
        visible={notification}
        onClose={closeNotification}
      />
    </>
  );
};

export default Profilebar;
