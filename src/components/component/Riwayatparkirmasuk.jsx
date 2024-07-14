import { gql, useQuery } from "@apollo/client";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Get data Graphql Query
const GET_RIWAYAT_PARKIR_MASUK = gql`
  query MyQuery {
    riwayat_scans {
      scan_masuk
      status_parkir
      card_motor {
        id
        foto_QR_Code
        mahasiswa {
          NIM
          user {
            id
            nama
            email
          }
        }
      }
    }
  }
`;

const Riwayatparkirmasuk = () => {
  const { loading, error, data } = useQuery(GET_RIWAYAT_PARKIR_MASUK);
  const navigate = useNavigate();
  const [sortField, setSortField] = useState("scan_masuk");
  const [sortOrder, setSortOrder] = useState(-1); // -1 for descending, 1 for ascending
  const [filters, setFilters] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  useEffect(() => {
    initFilters();
  }, []);

  if (error) return <p>Error: {error.message}</p>;

  const riwayatParkirMasuk = data?.riwayat_scans || [];

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
      "card_motor.mahasiswa.user.email": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      scan_masuk: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      status_parkir: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
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

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    date.setHours(date.getHours());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const navigateToDetail = (userId, cardMotorId) => {
    navigate(`/list-card-motor/${userId}/detail-card-motor/${cardMotorId}`);
  };

  const imageBodyTemplate = (rowData) => (
    <div className="flex justify-center">
      <img
        src={rowData.card_motor.foto_QR_Code}
        alt="Foto QR Code"
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

  const onSortChange = (event) => {
    setSortField(event.sortField);
    setSortOrder(event.sortOrder);
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
      {/* Table Riwayat */}
      <center className="mt-auto mb-auto xl:mt-0">
        <div className="card custom-table mb-10">
          <div className="flex" style={{ width: "90%" }}>
            <h1 className=" font-semibold text-2xl">Riwayat Parkir Masuk</h1>
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
              value={riwayatParkirMasuk}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSortChange}
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 25, 50]}
              tableStyle={{ minWidth: "50rem" }}
              paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
              currentPageReportTemplate="{first} to {last} of {totalRecords}"
              filters={filters}
              globalFilterFields={[
                "card_motor.mahasiswa.user.nama",
                "card_motor.mahasiswa.NIM",
                "card_motor.mahasiswa.user.email",
                "status_parkir",
              ]}
              header={header}
              emptyMessage="No parking records found."
              style={{ width: "90%" }}
            >
              <Column
                field="card_motor.mahasiswa.user.nama"
                header="Nama Mahasiswa"
                filter
                filterPlaceholder="Search by name"
                style={{ width: "25%" }}
              />
              <Column
                field="card_motor.mahasiswa.NIM"
                header="NIM"
                filter
                filterPlaceholder="Search by NIM"
                style={{ width: "15%" }}
              />
              <Column
                field="card_motor.mahasiswa.user.email"
                header="Email"
                filter
                filterPlaceholder="Search by email"
                style={{ width: "15%" }}
              />
              <Column
                field="card_motor.foto_QR_Code"
                header="Foto QR Code"
                body={imageBodyTemplate}
                style={{ width: "15%" }}
              />
              <Column
                field="scan_masuk"
                header="Jam Masuk Parkir"
                body={(rowData) => formatDate(rowData.scan_masuk)}
                sortable
                filter
                filterField="scan_masuk"
                filterElement={
                  <InputText type="date" onChange={onGlobalFilterChange} />
                }
                style={{ width: "20%", color: "black" }}
              />
              <Column
                field="status_parkir"
                header="Status Parkir"
                sortable
                filter
                filterPlaceholder="Search by status"
                style={{ width: "10%" }}
              />
            </DataTable>
          )}
        </div>
      </center>
      {/* End Table Riwayat */}
    </>
  );
};

export default Riwayatparkirmasuk;
