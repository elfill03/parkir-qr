import React, { useEffect, useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import { BsPlus } from "react-icons/bs";
import { useParams } from "react-router-dom";
import { Notification, Profilebar, Sidebarmahasiswa } from "../../components";

const GET_PARKIR_INAP = gql`
  query MyQuery($userId: Int!) {
    parkir_inaps(where: { user_id: { _eq: $userId } }) {
      id
      tanggal_masuk
      tanggal_keluar
      alasan_parkir_inap
      status_pengajuan
      card_motor {
        foto_motor
        mahasiswa {
          NIM
          user {
            nama
          }
        }
      }
    }
  }
`;

const INSERT_PARKIR_INAP = gql`
  mutation InsertParkirInap(
    $tanggal_masuk: timestamptz!
    $tanggal_keluar: timestamptz!
    $alasan_parkir_inap: String!
    $status_pengajuan: String!
    $card_motor_id: Int!
    $user_id: Int!
  ) {
    insert_parkir_inaps_one(
      object: {
        tanggal_masuk: $tanggal_masuk
        tanggal_keluar: $tanggal_keluar
        alasan_parkir_inap: $alasan_parkir_inap
        status_pengajuan: $status_pengajuan
        card_motor_id: $card_motor_id
        user_id: $user_id
      }
    ) {
      id
    }
  }
`;

const GET_USER_CARDS = gql`
  query GetUserCards($userId: Int!) {
    users_by_pk(id: $userId) {
      id
      nama
      mahasiswas {
        id
        NIM
        card_motors {
          id
          foto_motor
        }
      }
    }
  }
`;

const ParkirInap = () => {
  const { userId } = useParams();
  const { loading, error, data } = useQuery(GET_PARKIR_INAP, {
    variables: { userId: parseInt(userId) },
  });

  const {
    loading: loadingCards,
    error: errorCards,
    data: dataCards,
  } = useQuery(GET_USER_CARDS, {
    variables: { userId: parseInt(userId) },
  });

  const [insertParkirInap] = useMutation(INSERT_PARKIR_INAP);

  const [filters, setFilters] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [displayDialog, setDisplayDialog] = useState(false);
  const [displayConfirmationDialog, setDisplayConfirmationDialog] =
    useState(false);
  const [newParkirInap, setNewParkirInap] = useState({
    tanggal_masuk_date: "",
    tanggal_masuk_time: "",
    tanggal_keluar_date: "",
    tanggal_keluar_time: "",
    alasan_parkir_inap: "",
    card_motor_id: null,
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [dialogWidth, setDialogWidth] = useState("30%");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    initFilters();
  }, []);

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      "card_motor.mahasiswa.user.nama": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      "card_motor.mahasiswa.NIM": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      alasan_parkir_inap: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      tanggal_masuk: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      tanggal_keluar: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      status_pengajuan: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
    });
    setGlobalFilterValue("");
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const onDateFilterChange = (e, field) => {
    const value = e.value;
    let _filters = { ...filters };
    _filters[field].constraints[0].value = value
      ? value.toISOString().split("T")[0]
      : null;
    setFilters(_filters);
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "Belum ada tanggal";
    const date = new Date(isoDate);
    date.setHours(date.getHours() - 7);
    const formattedDate = `${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    return formattedDate;
  };

  const imageBodyTemplate = (rowData) => (
    <div className="flex justify-center">
      <img
        src={rowData.card_motor.foto_motor}
        alt="Foto Motor"
        style={{
          maxWidth: "100px",
          minWidth: "60px",
          width: "100%",
          height: "auto",
        }}
      />
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewParkirInap((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setDisplayConfirmationDialog(true);
    }
  };

  const handleConfirmSubmit = async () => {
    setLoadingSubmit(true);
    const tanggalMasuk = `${newParkirInap.tanggal_masuk_date}T${newParkirInap.tanggal_masuk_time}:00`;
    const tanggalKeluar = `${newParkirInap.tanggal_keluar_date}T${newParkirInap.tanggal_keluar_time}:00`;

    await insertParkirInap({
      variables: {
        tanggal_masuk: tanggalMasuk,
        tanggal_keluar: tanggalKeluar,
        alasan_parkir_inap: newParkirInap.alasan_parkir_inap,
        status_pengajuan: "Pending",
        card_motor_id: newParkirInap.card_motor_id,
        user_id: parseInt(userId),
      },
      refetchQueries: [
        { query: GET_PARKIR_INAP, variables: { userId: parseInt(userId) } },
      ],
    });

    setNotificationMessage(
      "Silahkan tunggu pengajuan parkir inap untuk di approve"
    );
    setNotification(true);
    setTimeout(() => setNotification(false), 3000);
    setDisplayDialog(false);
    setDisplayConfirmationDialog(false);
    setLoadingSubmit(false);
  };

  const validateForm = () => {
    let valid = true;
    let errors = {};

    if (!newParkirInap.tanggal_masuk_date) {
      errors.tanggal_masuk_date = "Tanggal masuk harus diisi.";
      valid = false;
    }

    if (!newParkirInap.tanggal_masuk_time) {
      errors.tanggal_masuk_time = "Waktu masuk harus diisi.";
      valid = false;
    }

    if (!newParkirInap.tanggal_keluar_date) {
      errors.tanggal_keluar_date = "Tanggal keluar harus diisi.";
      valid = false;
    }

    if (!newParkirInap.tanggal_keluar_time) {
      errors.tanggal_keluar_time = "Waktu keluar harus diisi.";
      valid = false;
    }

    if (!newParkirInap.alasan_parkir_inap) {
      errors.alasan_parkir_inap = "Alasan parkir inap harus diisi.";
      valid = false;
    }

    if (!newParkirInap.card_motor_id) {
      errors.card_motor_id = "Card motor harus dipilih !";
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const resetForm = () => {
    setNewParkirInap({
      tanggal_masuk_date: "",
      tanggal_masuk_time: "",
      tanggal_keluar_date: "",
      tanggal_keluar_time: "",
      alasan_parkir_inap: "",
      card_motor_id: null,
    });
    setErrors({});
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

  useEffect(() => {
    const updateDialogWidth = () => {
      if (window.innerWidth <= 680) {
        setDialogWidth("90%");
      } else {
        setDialogWidth("30%");
      }
    };

    window.addEventListener("resize", updateDialogWidth);
    updateDialogWidth();

    return () => window.removeEventListener("resize", updateDialogWidth);
  }, []);

  return (
    <>
      <div className="flex">
        <Sidebarmahasiswa />
        <div className="flex flex-col bg-white-maron flex-grow min-h-screen w-screen">
          <Profilebar />
          <center className="mt-auto mb-auto xl:mt-0">
            <div className="card custom-table mb-10">
              <div className="flex" style={{ width: "90%" }}>
                <h1 className="font-semibold text-base my-auto lg:text-2xl">
                  Pengajuan Parkir Inap
                </h1>
                <button
                  className="bg-red-maron hover:bg-red-700 text-sm text-white-light ml-auto flex items-center px-3 py-2 rounded-lg"
                  onClick={() => {
                    resetForm();
                    setDisplayDialog(true);
                  }}
                >
                  <div className="lg:text-2xl text-base mr-1">
                    <BsPlus />
                  </div>
                  Ajukan Parkir Inap
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
                  value={data?.parkir_inaps}
                  paginator
                  rows={5}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                  currentPageReportTemplate="{first} to {last} of {totalRecords}"
                  filters={filters}
                  globalFilterFields={[
                    "card_motor.mahasiswa.user.nama",
                    "card_motor.mahasiswa.NIM",
                    "alasan_parkir_inap",
                  ]}
                  header={header}
                  emptyMessage="Anda belum membuat pengajuan parkir inap"
                  tableStyle={{ minWidth: "50rem" }}
                  style={{ width: "90%" }}
                >
                  <Column
                    field="card_motor.mahasiswa.user.nama"
                    header="Nama Mahasiswa"
                    style={{ width: "20%" }}
                  />
                  <Column
                    field="card_motor.mahasiswa.NIM"
                    header="NIM"
                    style={{ width: "10%" }}
                  />
                  <Column
                    field="alasan_parkir_inap"
                    header="Alasan Parkir Inap"
                    style={{ width: "20%" }}
                  />
                  <Column
                    field="card_motor.foto_motor"
                    header="Foto Motor"
                    body={imageBodyTemplate}
                    style={{ width: "10%" }}
                  />
                  <Column
                    field="tanggal_masuk"
                    header="Tanggal Masuk"
                    body={(rowData) => formatDate(rowData.tanggal_masuk)}
                    sortable
                    filter
                    filterField="tanggal_masuk"
                    filterElement={
                      <Calendar
                        value={filters.tanggal_masuk?.constraints[0].value}
                        onChange={(e) => onDateFilterChange(e, "tanggal_masuk")}
                        dateFormat="yy-mm-dd"
                        placeholder="Filter by date"
                      />
                    }
                    style={{ width: "15%", color: "black" }}
                  />
                  <Column
                    field="tanggal_keluar"
                    header="Tanggal Keluar"
                    body={(rowData) => formatDate(rowData.tanggal_keluar)}
                    sortable
                    filter
                    filterField="tanggal_keluar"
                    filterElement={
                      <Calendar
                        value={filters.tanggal_keluar?.constraints[0].value}
                        onChange={(e) =>
                          onDateFilterChange(e, "tanggal_keluar")
                        }
                        dateFormat="yy-mm-dd"
                        placeholder="Filter by date"
                      />
                    }
                    style={{ width: "15%", color: "black" }}
                  />
                  <Column
                    field="status_pengajuan"
                    header="Status Pengajuan"
                    filter
                    filterPlaceholder="Search by status"
                    style={{ width: "10%" }}
                  />
                </DataTable>
              )}
            </div>
          </center>
        </div>
      </div>

      <Dialog
        header="Ajukan Parkir Inap"
        visible={displayDialog}
        onHide={() => setDisplayDialog(false)}
        draggable={false}
        className="centered-dialog"
        style={{ width: dialogWidth }}
      >
        <div className="p-fluid mt-2">
          <div className="p-field">
            <label htmlFor="tanggal_masuk_date">Tanggal Masuk:</label> <br />
            <InputText
              id="tanggal_masuk_date"
              name="tanggal_masuk_date"
              type="date"
              value={newParkirInap.tanggal_masuk_date}
              onChange={handleInputChange}
              className={`input-border ${
                errors.tanggal_masuk_date ? "p-invalid" : ""
              }`}
              style={{ width: "70%" }}
            />
            <InputText
              id="tanggal_masuk_time"
              name="tanggal_masuk_time"
              type="time"
              value={newParkirInap.tanggal_masuk_time}
              onChange={handleInputChange}
              className={`input-border ${
                errors.tanggal_masuk_time ? "p-invalid" : ""
              }`}
              style={{ width: "30%" }}
            />
          </div>
          <div className="p-error flex">
            <div style={{ width: "70%" }}>
              {errors.tanggal_masuk_date && (
                <small className="p-error ms-2">
                  {errors.tanggal_masuk_date}
                </small>
              )}
            </div>
            <div style={{ width: "30%" }}>
              {errors.tanggal_masuk_time && (
                <small className="p-error ms-2">
                  {errors.tanggal_masuk_time}
                </small>
              )}
            </div>
          </div>
          <div className="p-field">
            <label htmlFor="tanggal_keluar_date">Tanggal Keluar:</label> <br />
            <InputText
              id="tanggal_keluar_date"
              name="tanggal_keluar_date"
              type="date"
              value={newParkirInap.tanggal_keluar_date}
              onChange={handleInputChange}
              className={`input-border ${
                errors.tanggal_keluar_date ? "p-invalid" : ""
              }`}
              style={{ width: "70%" }}
            />
            <InputText
              id="tanggal_keluar_time"
              name="tanggal_keluar_time"
              type="time"
              value={newParkirInap.tanggal_keluar_time}
              onChange={handleInputChange}
              className={`input-border ${
                errors.tanggal_keluar_time ? "p-invalid" : ""
              }`}
              style={{ width: "30%" }}
            />
          </div>
          <div className="p-error flex">
            <div style={{ width: "70%" }}>
              {errors.tanggal_keluar_date && (
                <small className="p-error ms-2">
                  {errors.tanggal_keluar_date}
                </small>
              )}
            </div>
            <div style={{ width: "30%" }}>
              {errors.tanggal_keluar_time && (
                <small className="p-error ms-2">
                  {errors.tanggal_keluar_time}
                </small>
              )}
            </div>
          </div>

          <div className="p-field">
            <label htmlFor="alasan_parkir_inap">Alasan Parkir Inap:</label>
            <InputText
              id="alasan_parkir_inap"
              name="alasan_parkir_inap"
              value={newParkirInap.alasan_parkir_inap}
              onChange={handleInputChange}
              className={`input-border ${
                errors.alasan_parkir_inap ? "p-invalid" : ""
              }`}
              style={{ width: "100%" }}
            />
            {errors.alasan_parkir_inap && (
              <small className="p-error ms-2">
                {errors.alasan_parkir_inap}
              </small>
            )}
          </div>
          <div className="p-field">
            <label htmlFor="card_motor_id">Pilih Card Motor:</label>
            <div className="flex flex-col md:flex-row justify-between items-center">
              {loadingCards ? (
                <ProgressSpinner />
              ) : dataCards?.users_by_pk?.mahasiswas[0]?.card_motors?.length ===
                0 ? (
                <h1>
                  Anda belum memiliki card motor, silahkan buat terlebih dahulu
                </h1>
              ) : (
                dataCards?.users_by_pk?.mahasiswas[0]?.card_motors?.map(
                  (card) => (
                    <div
                      key={card.id}
                      className={`flex flex-col items-center mb-4 md:mb-0 cursor-pointer p-2 border-2 rounded-lg ${
                        newParkirInap.card_motor_id === card.id
                          ? "border-red-maron bg-gray-200"
                          : "border-gray-300"
                      }`}
                      style={{ width: "30%", height: "auto" }}
                      onClick={() =>
                        handleInputChange({
                          target: { name: "card_motor_id", value: card.id },
                        })
                      }
                    >
                      <input
                        type="radio"
                        id={`card_motor_${card.id}`}
                        name="card_motor_id"
                        value={card.id}
                        checked={newParkirInap.card_motor_id === card.id}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <label htmlFor={`card_motor_${card.id}`}>
                        <img
                          src={card.foto_motor}
                          alt={`Card Motor ${card.id}`}
                        />
                      </label>
                    </div>
                  )
                )
              )}
            </div>
            {errors.card_motor_id && (
              <small className="p-error flex justify-center">
                {errors.card_motor_id}
              </small>
            )}
          </div>
        </div>
        <div className="flex justify-center mt-5">
          <Button
            label="Batal"
            icon="pi pi-times"
            onClick={() => setDisplayDialog(false)}
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
        header="Konfirmasi"
        visible={displayConfirmationDialog}
        onHide={() => setDisplayConfirmationDialog(false)}
        draggable={false}
        className="centered-dialog"
        style={{ width: dialogWidth }}
      >
        {loadingSubmit ? (
          <div className="flex justify-center items-center h-32">
            <ProgressSpinner />
          </div>
        ) : (
          <>
            <p>
              Apakah anda telah mengisi data dengan benar, karena data tidak
              dapat diubah?
            </p>
            <div className="flex justify-center mt-5">
              <Button
                label="Batal"
                icon="pi pi-times"
                onClick={() => setDisplayConfirmationDialog(false)}
                className="bg-red-maron hover:bg-red-700 py-2 px-4 text-white-light"
                severity="danger"
              />
              <Button
                label="Ya"
                icon="pi pi-check"
                onClick={handleConfirmSubmit}
                autoFocus
                className="bg-green-light py-2 px-4 ms-5 text-white-light"
                severity="success"
              />
            </div>
          </>
        )}
      </Dialog>

      <Notification
        message={notificationMessage}
        visible={notification}
        onClose={() => setNotification(false)}
      />
    </>
  );
};

export default ParkirInap;
