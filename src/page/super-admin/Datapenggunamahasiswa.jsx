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
import { useNavigate } from "react-router-dom";
import { img7 } from "../../assets";
import { Notification, Profilebar, Sidebar } from "../../components";

// Get data Graphql Query
const GET_STUDENTS = gql`
  query MyQuery {
    users(where: { role_id: { _eq: 3 } }) {
      id
      nama
      email
      password
      foto_profile
      mahasiswas {
        NIM
      }
    }
  }
`;

// Insert data Mutation Graphql Query
const INSERT_STUDENT = gql`
  mutation MyMutation(
    $nama: String!
    $email: String!
    $password: String!
    $role_id: Int!
    $NIM: Int!
  ) {
    insert_users_one(
      object: {
        nama: $nama
        email: $email
        password: $password
        role_id: $role_id
        mahasiswas: { data: { NIM: $NIM } }
      }
    ) {
      id
      foto_profile
    }
  }
`;

// Delete data Mutation Graphql Query
const DELETE_STUDENT = gql`
  mutation MyMutation($id: Int!) {
    delete_mahasiswas(where: { user_id: { _eq: $id } }) {
      affected_rows
    }
    delete_users_by_pk(id: $id) {
      id
    }
  }
`;

// Update data Mutation Graphql Query
const UPDATE_STUDENT = gql`
  mutation MyMutation(
    $id: Int!
    $nama: String!
    $email: String!
    $password: String!
    $NIM: Int!
  ) {
    update_users_by_pk(
      pk_columns: { id: $id }
      _set: { nama: $nama, email: $email, password: $password }
    ) {
      id
      nama
      email
      mahasiswas {
        NIM
      }
    }
    update_mahasiswas(where: { user_id: { _eq: $id } }, _set: { NIM: $NIM }) {
      returning {
        NIM
      }
    }
  }
`;

const Datapenggunamahasiswa = () => {
  const { loading, error, data } = useQuery(GET_STUDENTS);
  const [insertStudent] = useMutation(INSERT_STUDENT);
  const [deleteStudent] = useMutation(DELETE_STUDENT);
  const [updateStudent] = useMutation(UPDATE_STUDENT);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState(null);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [newStudent, setNewStudent] = useState({
    nama: "",
    email: "",
    password: "",
    NIM: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [dialogWidth, setDialogWidth] = useState("30%");

  const [filters, setFilters] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const navigate = useNavigate();

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      nama: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      NIM: {
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

  if (error) return <p>Error: {error.message}</p>;

  const students = data
    ? data.users.map((user) => ({
        ...user,
        NIM: user.mahasiswas[0]?.NIM || "-",
      }))
    : [];

  // Image column
  const imageBodyTemplate = (rowData) => (
    <div className="flex justify-center">
      <img
        src={rowData.foto_profile ?? img7}
        alt="Foto Mahasiswa"
        style={{
          maxWidth: "100px",
          minWidth: "60px",
          width: "100%",
          height: "auto",
        }}
      />
    </div>
  );

  // Number NIM column
  const numberBodyTemplate = (rowData, { rowIndex }) => {
    return rowIndex + 1;
  };

  // Handle delete user
  const handleDeleteStudent = async (id) => {
    await deleteStudent({
      variables: { id },
      refetchQueries: [{ query: GET_STUDENTS }],
    });
    setNotificationMessage("Berhasil menghapus data");
    setNotification(true);
    setTimeout(() => setNotification(false), 2000);
    setDeleteConfirmDialog(false);
    setDeleteStudentId(null);
  };

  const confirmDeleteStudent = (id) => {
    setDeleteStudentId(id);
    setDeleteConfirmDialog(true);
  };

  // Handle edit user
  const handleEditStudent = (student) => {
    setNewStudent({ ...student, password: "" });
    setIsEditMode(true);
    setDisplayDialog(true);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (validate()) {
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(newStudent.password, 10);

        if (isEditMode) {
          await updateStudent({
            variables: {
              ...newStudent,
              id: newStudent.id,
              password: hashedPassword,
            },
            refetchQueries: [{ query: GET_STUDENTS }],
          });
          setNotificationMessage("Berhasil mengubah data");
        } else {
          await insertStudent({
            variables: {
              ...newStudent,
              password: hashedPassword,
              role_id: 3,
            },
            refetchQueries: [{ query: GET_STUDENTS }],
          });
          setNotificationMessage("Berhasil menambah data");
        }
        setNotification(true);
        setDisplayDialog(false);
        setNewStudent({ nama: "", email: "", password: "", NIM: "" });
        setIsEditMode(false);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  // Actions edit & delete
  const actionBodyTemplate = (rowData) => (
    <div className="flex justify-center space-x-1">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success bg-red-maron hover:bg-red-700 text-white-light"
        onClick={() => handleEditStudent(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger bg-red-maron hover:bg-red-700 text-white-light"
        onClick={() => confirmDeleteStudent(rowData.id)}
      />
      <Button
        icon="pi pi-list"
        className="p-button-rounded p-button-danger bg-red-maron hover:bg-red-700 text-white-light"
        onClick={() => navigate(`/list-card-motor/${rowData.id}`)}
      />
    </div>
  );

  // Handle reset form value when pop up closed
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  // Form validation
  const validate = () => {
    let valid = true;
    const newErrors = {};

    if (!newStudent.nama) {
      newErrors.nama = "Nama harus diisi";
      valid = false;
    } else if (newStudent.nama.length > 100) {
      newErrors.nama = "Nama maksimal 100 huruf";
      valid = false;
    }

    if (!newStudent.email) {
      newErrors.email = "Email harus diisi";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(newStudent.email)) {
      newErrors.email = "Email tidak valid";
      valid = false;
    }

    if (!newStudent.password) {
      newErrors.password = "Password harus diisi";
      valid = false;
    }

    if (!newStudent.NIM) {
      newErrors.NIM = "NIM harus diisi";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Hide dialog pop up
  const handleDialogHide = () => {
    setDisplayDialog(false);
    setNewStudent({ nama: "", email: "", password: "", NIM: "" });
    setErrors({});
    setIsEditMode(false);
  };

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

  // Hide notification
  const closeNotification = () => {
    setNotification(false);
    setNotificationMessage("");
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
                <h1 className="font-semibold text-2xl">Data Mahasiswa</h1>
                <button
                  className="bg-red-maron hover:bg-red-700 text-white-light ml-auto flex items-center px-3 py-2 rounded-lg"
                  onClick={() => {
                    setIsEditMode(false);
                    setDisplayDialog(true);
                  }}
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
                  value={students}
                  paginator
                  rows={5}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  filters={filters}
                  header={header}
                  globalFilterFields={["nama", "NIM", "email"]}
                  emptyMessage="No students found."
                  tableStyle={{ minWidth: "50rem" }}
                  paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                  currentPageReportTemplate="{first} to {last} of {totalRecords}"
                  style={{ width: "90%" }}
                >
                  <Column
                    header="No"
                    body={numberBodyTemplate}
                    style={{ width: "10%" }}
                  ></Column>
                  <Column
                    field="nama"
                    header="Nama Mahasiswa"
                    filter
                    filterPlaceholder="Search by name"
                    style={{ width: "25%" }}
                  ></Column>
                  <Column
                    field="NIM"
                    header="NIM"
                    filter
                    filterPlaceholder="Search by NIM"
                    style={{ width: "20%" }}
                  ></Column>
                  <Column
                    field="email"
                    header="Email"
                    filter
                    filterPlaceholder="Search by email"
                    style={{ width: "20%" }}
                  ></Column>
                  <Column
                    body={imageBodyTemplate}
                    header="Foto"
                    style={{ width: "15%" }}
                  ></Column>
                  <Column
                    body={actionBodyTemplate}
                    header="Aksi"
                    style={{ width: "10%" }}
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

      {/* Dialog pop up */}
      <Dialog
        header={isEditMode ? "Edit Data Mahasiswa" : "Tambah Data Mahasiswa"}
        visible={displayDialog}
        style={{ width: dialogWidth }}
        onHide={handleDialogHide}
        draggable={false}
        className="centered-dialog"
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="nama">Nama</label>
            <InputText
              id="nama"
              name="nama"
              value={newStudent.nama}
              onChange={handleInputChange}
              className={`input-border ${errors.nama ? "p-invalid" : ""}`}
            />
            {errors.nama && <small className="p-error">{errors.nama}</small>}
          </div>
          <div className="p-field">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              name="email"
              value={newStudent.email}
              onChange={handleInputChange}
              className={`input-border ${errors.email ? "p-invalid" : ""}`}
            />
            {errors.email && <small className="p-error">{errors.email}</small>}
          </div>
          <div className="p-field">
            <label htmlFor="password">Password</label>
            <Password
              id="password"
              name="password"
              value={newStudent.password}
              onChange={handleInputChange}
              toggleMask
              className={`input-border ${errors.password ? "p-invalid" : ""}`}
            />
            {errors.password && (
              <small className="p-error">{errors.password}</small>
            )}
          </div>
          <div className="p-field">
            <label htmlFor="NIM">NIM</label>
            <InputText
              id="NIM"
              name="NIM"
              value={newStudent.NIM}
              onChange={handleInputChange}
              className={`input-border ${errors.NIM ? "p-invalid" : ""}`}
              type="number"
            />
            {errors.NIM && <small className="p-error">{errors.NIM}</small>}
          </div>
        </div>
        <div className="flex justify-center mt-5">
          <Button
            label="Batal"
            icon="pi pi-times"
            onClick={handleDialogHide}
            className="bg-red-maron hover:bg-red-700 py-2 px-4 text-white-light"
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

      <Dialog
        header="Konfirmasi Hapus"
        visible={deleteConfirmDialog}
        onHide={() => setDeleteConfirmDialog(false)}
        draggable={false}
        className="centered-dialog"
        style={{ width: "30%" }}
      >
        <div className="flex justify-center mt-5">
          <p>Apakah Anda yakin ingin menghapus akun mahasiswa berikut?</p>
        </div>
        <div className="flex justify-center mt-5">
          <Button
            label="Batal"
            icon="pi pi-times"
            onClick={() => setDeleteConfirmDialog(false)}
            className="bg-red-maron py-2 px-4 text-white-light"
            severity="danger"
          />
          <Button
            label="Hapus"
            icon="pi pi-check"
            onClick={() => handleDeleteStudent(deleteStudentId)}
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

export default Datapenggunamahasiswa;
