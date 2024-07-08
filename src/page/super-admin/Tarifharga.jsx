import { gql, useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useEffect, useState } from "react";
import { img5 } from "../../assets";
import { Notification, Profilebar, Sidebar } from "../../components";

// Get data Graphql Query
const GET_TARIFF = gql`
  query MyQuery {
    tarif {
      tarif_harga
      harga_denda
    }
  }
`;

// Update data Mutation Graphql Query
const UPDATE_TARIFF = gql`
  mutation UpdateTariff($tarifHarga: Int!, $hargaDenda: Int!) {
    update_tarif(
      where: {}
      _set: { tarif_harga: $tarifHarga, harga_denda: $hargaDenda }
    ) {
      affected_rows
    }
  }
`;

const Tarifharga = () => {
  const { loading, error, data, refetch } = useQuery(GET_TARIFF);
  const [updateTariff] = useMutation(UPDATE_TARIFF);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [newTarifHarga, setNewTarifHarga] = useState(0);
  const [newHargaDenda, setNewHargaDenda] = useState(0);
  const [notification, setNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [dialogWidth, setDialogWidth] = useState("30%");

  useEffect(() => {
    if (data) {
      if (newTarifHarga === 0) {
        setNewTarifHarga(data?.tarif[0]?.tarif_harga || 0);
      }
      if (newHargaDenda === 0) {
        setNewHargaDenda(data?.tarif[0]?.harga_denda || 0);
      }
    }
  }, [data]);

  // Handle submit
  const handleSubmit = async () => {
    try {
      const { data } = await updateTariff({
        variables: { tarifHarga: newTarifHarga, hargaDenda: newHargaDenda },
      });
      if (data.update_tarif.affected_rows > 0) {
        setNotificationMessage("Berhasil mengubah harga tarif dan denda");
        setNotification(true);
        refetch();
      }
    } catch (error) {
      console.error("Error updating tariff:", error);
    } finally {
      setDisplayDialog(false);
    }
  };

  // Hide notification
  const closeNotification = () => {
    setNotification(false);
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

  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        <div className="flex flex-col bg-white-maron flex-grow min-h-screen max-w-screen">
          {/* Profilbar */}
          <Profilebar />

          {/* Content */}
          <center>
            <div className="mb-5">
              <div className="flex" style={{ width: "90%" }}>
                <h1 className="font-semibold text-2xl">Tarif Harga Parkir</h1>
              </div>
              <hr
                className="mb-5 bg-grey-maron pt-1 mt-2"
                style={{ width: "90%" }}
              />
            </div>
          </center>
          <center className="mt-auto mb-auto">
            <div className="flex" style={{ width: "90%" }}>
              <div className="p-5 bg-white-light rounded-xl">
                <img className="h-auto w-30 mb-5" src={img5} alt="motorcycle" />
                <h1 className="text-lg font-semibold">Tarif Parkir & Denda</h1>
                <hr className="mb-5 bg-red-maron pt-1" />
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <ProgressSpinner />
                  </div>
                ) : (
                  <>
                    <div className="flex my-2 w-full text-start justify-center text-base font-semibold">
                      <h1 className="w-24">Tarif Parkir</h1>
                      <h1 className="w-24">
                        : Rp. {newTarifHarga.toLocaleString("id-ID")}
                      </h1>
                    </div>
                    <div className="flex mt-2 mb-10 w-full text-start justify-center text-base font-semibold">
                      <h1 className="w-24">Denda</h1>
                      <h1 className="w-24">
                        : Rp. {newHargaDenda.toLocaleString("id-ID")}
                      </h1>
                    </div>
                    <Button
                      icon="pi pi-pencil"
                      label="EDIT"
                      className="p-button-rounded p-button-success bg-red-maron hover:bg-red-700 text-white-light py-2 px-6"
                      onClick={() => setDisplayDialog(true)}
                    />
                  </>
                )}
              </div>
            </div>
          </center>
          {/* <Footer /> */}
        </div>
      </div>

      {/* Dialog pop up */}
      <Dialog
        header="Edit Tarif Parkir & Denda"
        visible={displayDialog}
        style={{ width: dialogWidth }}
        onHide={() => setDisplayDialog(false)}
        draggable={false}
        className="centered-dialog"
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="tarifHarga">Tarif Parkir</label>
            <InputNumber
              id="tarifHarga"
              value={newTarifHarga}
              onValueChange={(e) => setNewTarifHarga(e.value)}
              mode="currency"
              currency="IDR"
              locale="id-ID"
              className="input-border"
            />
          </div>
          <div className="p-field">
            <label htmlFor="hargaDenda">Harga Denda</label>
            <InputNumber
              id="hargaDenda"
              value={newHargaDenda}
              onValueChange={(e) => setNewHargaDenda(e.value)}
              mode="currency"
              currency="IDR"
              locale="id-ID"
              className="input-border"
            />
          </div>
        </div>
        <div className="flex justify-center mt-5">
          <Button
            label="Batal"
            icon="pi pi-times"
            onClick={() => setDisplayDialog(false)}
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

export default Tarifharga;
