import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import React, { useRef, useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";
import { Profilebar, Sidebarpetugas } from "../../components";

// GraphQL Queries and Mutations
const INSERT_RIWAYAT_PARKIR = gql`
  mutation InsertRiwayatParkir(
    $scanMasuk: timestamptz!
    $cardMotorId: Int!
    $statusPembayaran: String!
    $biaya: Int!
    $statusParkir: String!
  ) {
    insert_riwayat_scans_one(
      object: {
        scan_masuk: $scanMasuk
        scan_keluar: null
        status_pembayaran: $statusPembayaran
        biaya: $biaya
        card_motor_id: $cardMotorId
        status_parkir: $statusParkir
      }
    ) {
      id
    }
  }
`;

const GET_TARIF_HARGA = gql`
  query GetTarifHarga {
    tarif {
      tarif_harga
      harga_denda
      biaya_inap
    }
  }
`;

const CHECK_PARKIR_INAP = gql`
  query CheckParkirInap($cardMotorId: Int!, $currentDate: timestamptz!) {
    parkir_inaps(
      where: {
        card_motor_id: { _eq: $cardMotorId }
        status_pengajuan: { _eq: "Diterima" }
        tanggal_masuk: { _lte: $currentDate }
        tanggal_keluar: { _gte: $currentDate }
      }
    ) {
      id
    }
  }
`;

const GET_MAHASISWA_INFO = gql`
  query GetMahasiswaInfo($cardMotorId: Int!) {
    card_motors_by_pk(id: $cardMotorId) {
      mahasiswa {
        NIM
        user {
          nama
        }
      }
    }
  }
`;

const ScanMasuk = () => {
  const [insertRiwayatParkir] = useMutation(INSERT_RIWAYAT_PARKIR);
  const { data: tarifData } = useQuery(GET_TARIF_HARGA);
  const client = useApolloClient();
  const [displayDialog, setDisplayDialog] = useState(false);
  const [dialogWidth, setDialogWidth] = useState("30%");
  const [dialogMessage, setDialogMessage] = useState("");
  const [mahasiswaName, setMahasiswaName] = useState("");
  const [mahasiswaNIM, setMahasiswaNIM] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const hasScannedRef = useRef(false);

  const handleResult = async (result, error) => {
    if (result && !hasScannedRef.current) {
      hasScannedRef.current = true;
      setIsScanning(false);

      try {
        const url = new URL(result.text);
        const parts = url.pathname.split("/");
        const userId = parts[2];
        const cardMotorId = parseInt(parts[4]);

        const scanMasuk = new Date().toISOString();
        const statusPembayaran = "Belum bayar";
        const currentDate = new Date().toISOString();

        const { data: parkirInapData } = await client.query({
          query: CHECK_PARKIR_INAP,
          variables: {
            cardMotorId,
            currentDate,
          },
        });

        const statusParkir =
          parkirInapData?.parkir_inaps.length > 0 ? "Parkir Inap" : "Reguler";
        const biaya =
          statusParkir === "Parkir Inap"
            ? tarifData?.tarif[0]?.biaya_inap || 0
            : tarifData?.tarif[0]?.tarif_harga || 0;

        await insertRiwayatParkir({
          variables: {
            scanMasuk,
            cardMotorId,
            statusPembayaran,
            biaya,
            statusParkir,
          },
        });

        const { data: mahasiswaData } = await client.query({
          query: GET_MAHASISWA_INFO,
          variables: {
            cardMotorId,
          },
        });

        const nama = mahasiswaData.card_motors_by_pk.mahasiswa.user.nama;
        const NIM = mahasiswaData.card_motors_by_pk.mahasiswa.NIM;

        setMahasiswaName(nama);
        setMahasiswaNIM(NIM);
        setDialogMessage("Berhasil melakukan scan masuk");
        setDisplayDialog(true);
      } catch (error) {
        setDialogMessage("Gagal memproses scan masuk");
        setDisplayDialog(true);
      }
    } else if (error) {
    }
  };

  const closeDialog = () => {
    setDisplayDialog(false);
    window.location.reload();
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

  return (
    <>
      <div className="flex">
        <Sidebarpetugas />
        <div className="flex flex-col bg-white-maron flex-grow min-h-screen">
          <Profilebar />
          <center>
            <div className="mb-5">
              <div
                className="flex flex-col items-center"
                style={{ width: "90%" }}
              >
                <h1 className="font-semibold text-2xl mb-4">
                  Scan Masuk Parkir
                </h1>
                <Button
                  label="Scan Masuk"
                  icon="pi pi-camera"
                  className="p-button-rounded p-button-success bg-red-maron hover:bg-red-700 text-white-light px-3 py-2 rounded-lg"
                  onClick={() => {
                    setIsScanning(true);
                    hasScannedRef.current = false;
                  }}
                />
              </div>
              <hr
                className="mb-5 bg-grey-maron pt-1 mt-2"
                style={{ width: "90%" }}
              />
              <div style={{ width: "80%" }}>
                {isScanning && (
                  <QrReader
                    delay={500}
                    onResult={handleResult}
                    constraints={{ facingMode: "environment" }}
                    style={{ width: "100%" }}
                  />
                )}
              </div>
            </div>
          </center>
        </div>
      </div>
      <Dialog
        header="Konfirmasi Parkir Masuk"
        visible={displayDialog}
        style={{ width: dialogWidth }}
        onHide={closeDialog}
        footer={
          <div className="flex justify-center">
            <Button
              label="Konfirmasi"
              onClick={closeDialog}
              className="bg-green-light py-2 px-4 text-white-light"
            />
          </div>
        }
      >
        <p className="text-base lg:text-xl mb-2">{dialogMessage}</p>
        {dialogMessage === "Berhasil melakukan scan masuk" && (
          <>
            <p className="text-base lg:text-lg">Nama mahasiswa: {mahasiswaName}</p>
            <p className="text-base lg:text-lg">NIM: {mahasiswaNIM}</p>
          </>
        )}
      </Dialog>
    </>
  );
};

export default ScanMasuk;
