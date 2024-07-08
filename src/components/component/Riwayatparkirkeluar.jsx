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

// Get data Graphql Query
const GET_RIWAYAT_PARKIR_KELUAR = gql`
  query MyQuery {
    riwayat_scans {
      scan_keluar
      biaya
      status_pembayaran
      card_motor {
        foto_QR_Code
        mahasiswa {
          NIM
          user {
            nama
            email
          }
        }
      }
    }
  }
`;

const Riwayatparkirkeluar = () => {
  const { loading, error, data } = useQuery(GET_RIWAYAT_PARKIR_KELUAR);
  const [sortField, setSortField] = useState("scan_keluar_sort");
  const [sortOrder, setSortOrder] = useState(-1); // -1 for descending, 1 for ascending
  const [filters, setFilters] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  useEffect(() => {
    initFilters();
  }, []);

  if (error) return <p>Error: {error.message}</p>;

  const riwayatParkirKeluar = (data?.riwayat_scans || []).map((entry) => ({
    ...entry,
    scan_keluar_sort: entry.scan_keluar
      ? new Date(entry.scan_keluar).getTime()
      : Number.MAX_SAFE_INTEGER,
  }));

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
      status_pembayaran: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      scan_keluar: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
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

  // Handle format date
  const formatDate = (isoDate) => {
    if (!isoDate) return "Belum keluar";
    const date = new Date(isoDate);
    // Adjust timezone
    date.setHours(date.getHours() - 7);
    const formattedDate = `${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    return formattedDate;
  };

  // Image column
  const imageBodyTemplate = (rowData) => (
    <div className="flex justify-center">
      <img
        src={rowData.card_motor.foto_QR_Code}
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

  // Handle sorting
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
      {/* Table Riwayat Keluar */}
      <center className="mt-auto mb-auto xl:mt-0">
        <div className="card custom-table mb-10">
          <div className="flex" style={{ width: "90%" }}>
            <h1 className="font-semibold text-2xl">Riwayat Parkir Keluar</h1>
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
              value={riwayatParkirKeluar}
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
                "status_pembayaran",
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
                field="card_motor.mahasiswa.user.email"
                header="Email"
                filter
                filterPlaceholder="Search by email"
                style={{ width: "20%" }}
              />
              <Column field="biaya" header="Biaya" style={{ width: "10%" }} />
              <Column
                field="status_pembayaran"
                header="Status Pembayaran"
                filter
                filterPlaceholder="Search by status"
                style={{ width: "15%", color: "black" }}
                sortable
              />
              <Column
                field="card_motor.foto_QR_Code"
                header="Foto QR Code"
                body={imageBodyTemplate}
                style={{ width: "10%" }}
              />
              <Column
                field="scan_keluar"
                header="Jam Keluar Parkir"
                body={(rowData) => formatDate(rowData.scan_keluar)}
                sortable
                filter
                filterField="scan_keluar"
                filterElement={
                  <InputText type="date" onChange={onGlobalFilterChange} />
                }
                style={{ width: "15%", color: "black" }}
              />
            </DataTable>
          )}
        </div>
      </center>
      {/* End Table Riwayat Keluar */}
    </>
  );
};

export default Riwayatparkirkeluar;
