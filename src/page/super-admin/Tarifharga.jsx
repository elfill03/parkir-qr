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
      biaya_inap
    }
  }
`;

// Update data Mutation Graphql Query
const UPDATE_TARIFF = gql`
  mutation UpdateTariff(
    $tarifHarga: Int!
    $hargaDenda: Int!
    $biayaInap: Int!
  ) {
    update_tarif(
      where: {}
      _set: {
        tarif_harga: $tarifHarga
        harga_denda: $hargaDenda
        biaya_inap: $biayaInap
      }
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
  const [newBiayaInap, setNewBiayaInap] = useState(0);
  const [originalTarifHarga, setOriginalTarifHarga] = useState(0);
  const [originalHargaDenda, setOriginalHargaDenda] = useState(0);
  const [originalBiayaInap, setOriginalBiayaInap] = useState(0);
  const [notification, setNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [dialogWidth, setDialogWidth] = useState("30%");

  useEffect(() => {
    if (data) {
      setNewTarifHarga(data?.tarif[0]?.tarif_harga || 0);
      setNewHargaDenda(data?.tarif[0]?.harga_denda || 0);
      setNewBiayaInap(data?.tarif[0]?.biaya_inap || 0);
      setOriginalTarifHarga(data?.tarif[0]?.tarif_harga || 0);
      setOriginalHargaDenda(data?.tarif[0]?.harga_denda || 0);
      setOriginalBiayaInap(data?.tarif[0]?.biaya_inap || 0);
    }
  }, [data]);

  const handleValueChange = (value, setter) => {
    setter(value || 0);
  };

  const handleSubmit = async () => {
    try {
      const { data } = await updateTariff({
        variables: {
          tarifHarga: newTarifHarga,
          hargaDenda: newHargaDenda,
          biayaInap: newBiayaInap,
        },
      });
      if (data.update_tarif.affected_rows > 0) {
        setNotificationMessage(
          "Berhasil mengubah harga tarif, biaya inap, dan denda"
        );
        setNotification(true);
        refetch();
      }
    } catch (error) {
      console.error("Error updating tariff:", error);
    } finally {
      setDisplayDialog(false);
    }
  };

  const handleCancel = () => {
    setNewTarifHarga(originalTarifHarga);
    setNewHargaDenda(originalHargaDenda);
    setNewBiayaInap(originalBiayaInap);
    setDisplayDialog(false);
  };

  const closeNotification = () => {
    setNotification(false);
  };

  useEffect(() => {
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
        <Sidebar />

        <div className="flex flex-col bg-white-maron flex-grow min-h-screen max-w-screen">
          <Profilebar />

          <center className="mt-auto mb-auto xl:mt-0">
            <div className="mb-5">
              <div className="flex" style={{ width: "90%" }}>
                <h1 className="font-semibold text-2xl">Tarif Harga Parkir</h1>
              </div>
              <hr
                className="mb-5 bg-grey-maron pt-1 mt-2"
                style={{ width: "90%" }}
              />
            </div>
            <div className="flex" style={{ width: "90%" }}>
              <div className="p-5 bg-white-light rounded-xl">
                <img className="h-auto w-30 mb-5" src={img5} alt="motorcycle" />
                <h1 className="text-lg font-semibold">
                  Tarif Parkir, Biaya Inap, & Denda
                </h1>
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
                    <div className="flex my-2 w-full text-start justify-center text-base font-semibold">
                      <h1 className="w-24">Biaya Inap</h1>
                      <h1 className="w-24">
                        : Rp. {newBiayaInap.toLocaleString("id-ID")}
                      </h1>
                    </div>
                    <div className="flex my-2 w-full text-start justify-center text-base font-semibold">
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
        </div>
      </div>

      <Dialog
        header="Edit Tarif Parkir, Denda & Biaya Inap"
        visible={displayDialog}
        style={{ width: dialogWidth }}
        onHide={handleCancel}
        draggable={false}
        className="centered-dialog"
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="tarifHarga">Tarif Parkir</label>
            <InputNumber
              id="tarifHarga"
              value={newTarifHarga}
              onValueChange={(e) =>
                handleValueChange(e.value, setNewTarifHarga)
              }
              mode="currency"
              currency="IDR"
              locale="id-ID"
              className="input-border"
            />
          </div>
          <div className="p-field">
            <label htmlFor="biayaInap">Biaya Inap</label>
            <InputNumber
              id="biayaInap"
              value={newBiayaInap}
              onValueChange={(e) => handleValueChange(e.value, setNewBiayaInap)}
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
              onValueChange={(e) =>
                handleValueChange(e.value, setNewHargaDenda)
              }
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
            onClick={handleCancel}
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

      <Notification
        message={notificationMessage}
        visible={notification}
        onClose={closeNotification}
      />
    </>
  );
};

export default Tarifharga;
