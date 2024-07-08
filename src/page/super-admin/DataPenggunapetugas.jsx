import { gql, useMutation, useQuery } from "@apollo/client";
import bcrypt from "bcryptjs";
import "primeicons/primeicons.css";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { ProgressSpinner } from "primereact/progressspinner";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import React, { useState } from "react";
import { BsPlus } from "react-icons/bs";
import { Notification, Profilebar, Sidebar } from "../../components";
import { img7 } from "../../assets";

// Get data Graphql Query
const GET_USERS = gql`
  query MyQuery {
    users(where: { role_id: { _eq: 2 } }) {
      id
      nama
      email
      foto_profile
      password
    }
  }
`;

// Insert data Mutation Graphql Query
const INSERT_USER = gql`
  mutation MyMutation(
    $nama: String!
    $email: String!
    $password: String!
    $role_id: Int!
  ) {
    insert_users_one(
      object: {
        nama: $nama
        email: $email
        password: $password
        role_id: $role_id
      }
    ) {
      id
      foto_profile
    }
  }
`;

// Delete data Mutation Graphql Query
const DELETE_USER = gql`
  mutation MyMutation($id: Int!) {
    delete_users_by_pk(id: $id) {
      id
    }
  }
`;

// Update data Mutation Graphql Query
const UPDATE_USER = gql`
  mutation MyMutation(
    $id: Int!
    $nama: String!
    $email: String!
    $password: String!
  ) {
    update_users_by_pk(
      pk_columns: { id: $id }
      _set: { nama: $nama, email: $email, password: $password }
    ) {
      id
      nama
      email
    }
  }
`;

const DataPenggunapetugas = () => {
  const { loading, error, data } = useQuery(GET_USERS);
  const [insertUser] = useMutation(INSERT_USER);
  const [deleteUser] = useMutation(DELETE_USER);
  const [updateUser] = useMutation(UPDATE_USER);

  const [displayDialog, setDisplayDialog] = useState(false);
  const numberBodyTemplate = (rowData, { rowIndex }) => rowIndex + 1;
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dialogWidth, setDialogWidth] = useState("30%");

  const [filters, setFilters] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const [newUser, setNewUser] = useState({
    nama: "",
    email: "",
    password: "",
  });

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      nama: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      email: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
    });
    setGlobalFilterValue("");
  };

  React.useEffect(() => {
    if (error) return <p>Error: {error.message}</p>;

    initFilters();
  }, [error]);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const handleDeleteUser = async (id) => {
    await deleteUser({
      variables: { id },
      refetchQueries: [{ query: GET_USERS }],
    });
    setNotificationMessage("Berhasil menghapus data");
    setNotification(true);
    setTimeout(() => setNotification(false), 2000);
  };

  const handleEditUser = (user) => {
    setNewUser({ ...user, password: "" });
    setIsEditMode(true);
    setDisplayDialog(true);
  };

  const handleSubmit = async () => {
    if (validate()) {
      const hashedPassword = await bcrypt.hash(newUser.password, 10);
      if (isEditMode) {
        await updateUser({
          variables: {
            ...newUser,
            password: hashedPassword,
          },
          refetchQueries: [{ query: GET_USERS }],
        });
        setNotificationMessage("Berhasil mengubah data");
      } else {
        await insertUser({
          variables: { ...newUser, password: hashedPassword, role_id: 2 },
          refetchQueries: [{ query: GET_USERS }],
        });
        setNotificationMessage("Berhasil menambah data");
      }
      setNotification(true);
      setDisplayDialog(false);
      setNewUser({ nama: "", email: "", password: "" });
      setIsEditMode(false);
    }
  };

  const imageBodyTemplate = (rowData) => (
    <div className="flex justify-center">
      <img
        src={rowData.foto_profile ?? img7}
        alt="Foto Petugas"
        style={{
          maxWidth: "100px",
          minWidth: "60px",
          width: "100%",
          height: "auto",
        }}
      />
    </div>
  );

  const actionBodyTemplate = (rowData) => (
    <div className="flex justify-center space-x-1">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success bg-red-maron text-white-light"
        onClick={() => handleEditUser(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger bg-red-maron text-white-light"
        onClick={() => handleDeleteUser(rowData.id)}
      />
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = {};

    if (!newUser.nama) {
      newErrors.nama = "Nama harus diisi";
      valid = false;
    } else if (newUser.nama.length > 100) {
      newErrors.nama = "Nama maksimal 100 huruf";
      valid = false;
    }

    if (!newUser.email) {
      newErrors.email = "Email harus diisi";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      newErrors.email = "Email tidak valid";
      valid = false;
    }

    if (!newUser.password) {
      newErrors.password = "Password harus diisi";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleDialogHide = () => {
    setDisplayDialog(false);
    setNewUser({ nama: "", email: "", password: "" });
    setErrors({});
    setIsEditMode(false);
  };

  const header = (
    <div className="flex justify-content-between">
      <Button
        type="button"
        icon="pi pi-filter-slash"
        label="Clear"
        outlined
        onClick={initFilters}
        className="me-10 ms-4"
      />
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Keyword Search"
          className="ps-6"
        />
      </span>
    </div>
  );

  // Responsive dialog
  React.useEffect(() => {
    const updateDialogWidth = () => {
      if (window.innerWidth <= 680) {
        setDialogWidth("80%");
      } else {
        setDialogWidth("30%");
      }
    };

    window.addEventListener("resize", updateDialogWidth);
    updateDialogWidth();

    return () => window.removeEventListener("resize", updateDialogWidth);
  }, []);

  const closeNotification = () => {
    setNotification(false);
    setNotificationMessage("");
  };

  return (
    <>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        <div className="flex flex-col bg-white-maron flex-grow min-h-screen max-w-screen">
          {/* Profilbar */}
          <Profilebar />

          {/* Content */}
          <center className="mt-auto mb-auto xl:mt-0">
            <div className="card custom-table mb-10">
              <div className="flex" style={{ width: "90%" }}>
                <h1 className="font-semibold text-2xl">Data Petugas</h1>
                <button
                  className="bg-red-maron hover:bg-red-700 text-white-light ml-auto flex items-center px-3 py-2 rounded-lg"
                  onClick={() => setDisplayDialog(true)}
                >
                  <div className="text-2xl mr-1">
                    <BsPlus />
                  </div>
                  Tambah Data
                </button>
              </div>
              <hr
                className="mb-5 bg-grey-maron pt-1 mt-2"
                style={{ width: "90%" }}
              />
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <ProgressSpinner />
                </div>
              ) : (
                <DataTable
                  value={data?.users}
                  paginator
                  rows={5}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                  currentPageReportTemplate="{first} to {last} of {totalRecords}"
                  filters={filters}
                  header={header}
                  globalFilterFields={["nama", "email"]}
                  emptyMessage="No petugas found."
                  tableStyle={{ minWidth: "50rem" }}
                  style={{ width: "90%" }}
                >
                  <Column
                    header="No"
                    body={numberBodyTemplate}
                    style={{ width: "10%" }}
                  ></Column>
                  <Column
                    field="nama"
                    header="Nama Petugas"
                    filter
                    filterPlaceholder="Search by name"
                    style={{ width: "25%" }}
                  ></Column>
                  <Column
                    field="email"
                    header="Email Petugas"
                    filter
                    filterPlaceholder="Search by email"
                    style={{ width: "25%" }}
                  ></Column>
                  <Column
                    body={imageBodyTemplate}
                    header="Foto Petugas"
                    style={{ width: "25%" }}
                  ></Column>
                  <Column
                    body={actionBodyTemplate}
                    header="Aksi"
                    style={{ width: "15%" }}
                  ></Column>
                </DataTable>
              )}
              {notification && (
                <div className="notification">{notificationMessage}</div>
              )}
            </div>
          </center>
          {/* <Footer /> */}
        </div>
      </div>

      <Dialog
        header={isEditMode ? "Edit Petugas" : "Tambah Petugas"}
        visible={displayDialog}
        onHide={handleDialogHide}
        draggable={false}
        className="centered-dialog"
        style={{ width: dialogWidth }}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="nama">Nama:</label>
            <InputText
              id="nama"
              name="nama"
              value={newUser.nama}
              onChange={handleInputChange}
              className={`input-border ${errors.nama ? "p-invalid" : ""}`}
            />
            {errors.nama && <small className="p-error">{errors.nama}</small>}
          </div>

          <div className="p-field">
            <label htmlFor="email">Email:</label>
            <InputText
              id="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              className={`input-border ${errors.email ? "p-invalid" : ""}`}
            />
            {errors.email && <small className="p-error">{errors.email}</small>}
          </div>

          <div className="p-field">
            <label htmlFor="password">Password:</label>
            <Password
              id="password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              toggleMask
              className={`input-border ${errors.password ? "p-invalid" : ""}`}
            />
            {errors.password && (
              <small className="p-error">{errors.password}</small>
            )}
          </div>
        </div>
        <div className="flex justify-center mt-5">
          <Button
            label="Batal"
            icon="pi pi-times"
            onClick={handleDialogHide}
            className="bg-red-maron py-2 px-4 text-white-light"
            severity="danger"
          />
          <Button
            label="Simpan"
            icon="pi pi-check"
            onClick={handleSubmit}
            autoFocus
            className="bg-green-light py-2 px-4 ms-5 text-white-light"
            severity="success"
          />
        </div>
      </Dialog>

      {/* Notification pop up */}
      <Notification
        message={notificationMessage}
        visible={notification}
        onClose={closeNotification}
      />
    </>
  );
};

export default DataPenggunapetugas;
