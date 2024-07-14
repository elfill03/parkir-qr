import { gql, useMutation, useQuery } from "@apollo/client";
import "primeicons/primeicons.css";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Profilebar, Sidebar } from "../../components";

// GraphQL query to get all parkir inap data
const GET_ALL_PARKIR_INAP = gql`
  query MyQuery {
    parkir_inaps {
      id
      tanggal_masuk
      tanggal_keluar
      alasan_parkir_inap
      status_pengajuan
      card_motor {
        id
        foto_motor
        mahasiswa {
          NIM
          user {
            id
            nama
          }
        }
      }
    }
  }
`;

const UPDATE_PARKIR_INAP_STATUS = gql`
  mutation UpdateParkirInapStatus($id: Int!, $status_pengajuan: String!) {
    update_parkir_inaps_by_pk(
      pk_columns: { id: $id }
      _set: { status_pengajuan: $status_pengajuan }
    ) {
      id
      status_pengajuan
    }
  }
`;

const formatDate = (isoDate) => {
  if (!isoDate) return "Belum ada tanggal";
  const date = new Date(isoDate);
  // Adjust timezone
  date.setHours(date.getHours() - 7);
  const formattedDate = `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  return formattedDate;
};

const ListParkirInap = () => {
  const { loading, error, data } = useQuery(GET_ALL_PARKIR_INAP);
  const navigate = useNavigate();
  const [updateParkirInapStatus] = useMutation(UPDATE_PARKIR_INAP_STATUS);

  const [filters, setFilters] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [dialogWidth, setDialogWidth] = useState("30%");
  const [displayDialog, setDisplayDialog] = useState(false);
  const [selectedParkirInap, setSelectedParkirInap] = useState(null);
  const [newStatus, setNewStatus] = useState("");

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
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      tanggal_keluar: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
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

  const handleEditClick = (rowData) => {
    setSelectedParkirInap(rowData);
    setNewStatus(rowData.status_pengajuan);
    setDisplayDialog(true);
  };

  const handleSaveStatus = async () => {
    await updateParkirInapStatus({
      variables: {
        id: selectedParkirInap.id,
        status_pengajuan: newStatus,
      },
      refetchQueries: [{ query: GET_ALL_PARKIR_INAP }],
    });
    setDisplayDialog(false);
  };

  const navigateToDetail = (userId, cardMotorId) => {
    navigate(`/list-card-motor/${userId}/detail-card-motor/${cardMotorId}`);
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
          cursor: "pointer",
        }}
        onClick={() =>
          navigateToDetail(
            rowData.card_motor.mahasiswa.user.id,
            rowData.card_motor.id
          )
        }
      />
    </div>
  );

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

  React.useEffect(() => {
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
        <Sidebar />
        <div className="flex flex-col bg-white-maron flex-grow min-h-screen max-w-screen">
          <Profilebar />
          <center className="mt-auto mb-auto xl:mt-0">
            <div className="card custom-table mb-10">
              <div className="flex" style={{ width: "90%" }}>
                <h1 className="font-semibold text-2xl">Daftar Parkir Inap</h1>
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
                  emptyMessage="Tidak ada data parkir inap"
                  tableStyle={{ minWidth: "50rem" }}
                  style={{ width: "90%" }}
                >
                  <Column
                    field="card_motor.mahasiswa.user.nama"
                    header="Nama Mahasiswa"
                    filter
                    filterPlaceholder="Search by name"
                    style={{ width: "20%" }}
                  />
                  <Column
                    field="card_motor.mahasiswa.NIM"
                    header="NIM"
                    filter
                    filterPlaceholder="Search by NIM"
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
                      <InputText type="date" onChange={onGlobalFilterChange} />
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
                      <InputText type="date" onChange={onGlobalFilterChange} />
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
                  <Column
                    header="Action"
                    body={(rowData) => (
                      <Button
                        icon="pi pi-pencil"
                        className="p-button-rounded p-button-success bg-red-maron text-white-light"
                        onClick={() => handleEditClick(rowData)}
                      />
                    )}
                    style={{ width: "10%" }}
                  />
                </DataTable>
              )}
            </div>
          </center>
        </div>
      </div>

      <Dialog
        header="Edit Status Pengajuan"
        visible={displayDialog}
        onHide={() => setDisplayDialog(false)}
        draggable={false}
        className="centered-dialog"
        style={{ width: dialogWidth }}
      >
        {selectedParkirInap && (
          <div className="p-fluid mt-2">
            <div className="p-field">
              <label htmlFor="tanggal_masuk">Tanggal Masuk:</label>
              <InputText
                id="tanggal_masuk"
                value={formatDate(selectedParkirInap.tanggal_masuk)}
                disabled
                className="input-border"
                style={{ width: "100%" }}
              />
            </div>
            <div className="p-field">
              <label htmlFor="tanggal_keluar">Tanggal Keluar:</label>
              <InputText
                id="tanggal_keluar"
                value={formatDate(selectedParkirInap.tanggal_keluar)}
                disabled
                className="input-border"
                style={{ width: "100%" }}
              />
            </div>
            <div className="p-field">
              <label htmlFor="alasan_parkir_inap">Alasan Parkir Inap:</label>
              <InputText
                id="alasan_parkir_inap"
                value={selectedParkirInap.alasan_parkir_inap}
                disabled
                className="input-border"
                style={{ width: "100%" }}
              />
            </div>
            <div className="p-field">
              <label>Card Motor:</label>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <img
                  src={selectedParkirInap.card_motor.foto_motor}
                  alt="Card Motor"
                  className="min-w-16 max-w-32 h-auto"
                />
              </div>
            </div>
            <div className="p-field">
              <label>Status Pengajuan:</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="diterima"
                    name="status_pengajuan"
                    value="Diterima"
                    checked={newStatus === "Diterima"}
                    onChange={(e) => setNewStatus(e.target.value)}
                  />
                  <label htmlFor="diterima" className="ml-2">
                    Diterima
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="ditolak"
                    name="status_pengajuan"
                    value="Ditolak"
                    checked={newStatus === "Ditolak"}
                    onChange={(e) => setNewStatus(e.target.value)}
                  />
                  <label htmlFor="ditolak" className="ml-2">
                    Ditolak
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
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
            onClick={handleSaveStatus}
            autoFocus
            className="bg-green-light py-2 px-4 ms-5 text-white-light"
            severity="success"
          />
        </div>
      </Dialog>
    </>
  );
};

export default ListParkirInap;
