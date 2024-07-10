import { gql, useMutation, useQuery } from "@apollo/client";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import QRCode from "qrcode.react";
import React, { useEffect, useRef, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { Notification } from "../../components";
import { storage } from "../../config/firebase/firebaseConfig";

const GET_CARD_DETAILS = gql`
  query GetCardDetails($cardId: Int!) {
    card_motors(where: { id: { _eq: $cardId } }) {
      id
      foto_motor
      foto_STNK
      foto_KTM
      foto_QR_Code
      mahasiswa {
        NIM
        user_id
        user {
          id
          nama
        }
      }
    }
  }
`;

const GET_RIWAYAT_PARKIR = gql`
  query GetRiwayatParkir($cardMotorId: Int!) {
    riwayat_scans(
      where: {
        card_motor_id: { _eq: $cardMotorId }
        scan_keluar: { _is_null: false }
      }
    ) {
      scan_masuk
      scan_keluar
    }
  }
`;

const UPDATE_STATUS_PEMBAYARAN = gql`
  mutation UpdateStatusPembayaran(
    $cardMotorId: Int!
    $biaya: Int!
    $statusPembayaran: String!
  ) {
    update_riwayat_scans(
      where: {
        card_motor_id: { _eq: $cardMotorId }
        scan_keluar: { _is_null: false }
      }
      _set: { biaya: $biaya, status_pembayaran: $statusPembayaran }
    ) {
      affected_rows
    }
  }
`;

const GET_TARIF_HARGA = gql`
  query GetTarifHarga {
    tarif {
      tarif_harga
      harga_denda
    }
  }
`;

const UPDATE_CARD_QR_CODE = gql`
  mutation UpdateCardQRCode($id: Int!, $fotoQRCode: String!) {
    update_card_motors_by_pk(
      pk_columns: { id: $id }
      _set: { foto_QR_Code: $fotoQRCode }
    ) {
      id
    }
  }
`;

const DetailCardMotor = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_CARD_DETAILS, {
    variables: { cardId: parseInt(cardId) },
  });

  const card = data?.card_motors[0];

  // Mendapatkan role_id dari localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const roleId = user?.role_id;

  const { data: riwayatData } = useQuery(GET_RIWAYAT_PARKIR, {
    variables: { cardMotorId: parseInt(cardId) },
  });

  const { data: tarifData } = useQuery(GET_TARIF_HARGA);

  const [updateCardQRCode] = useMutation(UPDATE_CARD_QR_CODE);
  const [updateStatusPembayaran] = useMutation(UPDATE_STATUS_PEMBAYARAN);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [displayPaymentDialog, setDisplayPaymentDialog] = useState(false);
  const [biaya, setBiaya] = useState(0);
  const [qrCodeUrl, setQRCodeUrl] = useState(null);
  const [notification, setNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const qrRef = useRef(null);

  useEffect(() => {
    if (roleId === 2 && riwayatData && tarifData) {
      const scanMasuk = new Date(riwayatData.riwayat_scans[0].scan_masuk);
      const scanKeluar = new Date(riwayatData.riwayat_scans[0].scan_keluar);
      const duration = (scanKeluar - scanMasuk) / (1000 * 60 * 60); // in hours

      const biaya =
        duration > 24
          ? tarifData.tarif[0].harga_denda
          : tarifData.tarif[0].tarif_harga;
    }
  }, [riwayatData, tarifData, roleId]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleGenerateQRCode = () => {
    setDisplayDialog(true);
  };

  const saveQRCodeToStorage = async () => {
    setTimeout(async () => {
      const canvas = qrRef.current?.querySelector("canvas");

      if (!canvas) {
        console.error("QR code canvas not found.");
        setNotificationMessage("QR code canvas not found.");
        setNotification(true);
        return;
      }

      const dataUrl = canvas.toDataURL("image/png");

      try {
        const storageRef = ref(storage, `qrcodes/card_motor_${cardId}.png`);
        await uploadString(storageRef, dataUrl, "data_url");
        const downloadUrl = await getDownloadURL(storageRef);

        await updateCardQRCode({
          variables: {
            id: cardId,
            fotoQRCode: downloadUrl,
          },
        });

        setNotificationMessage("Berhasil menyimpan QR code.");
        setQRCodeUrl(downloadUrl);
      } catch (error) {
        console.error("Error saving QR code:", error);
        setNotificationMessage("Gagal menyimpan QR code.");
      } finally {
        setNotification(true);
        setDisplayDialog(false);
      }
    }, 100);
  };

  const handleCheckBiaya = () => {
    if (riwayatData && tarifData) {
      const scanMasuk = new Date(riwayatData.riwayat_scans[0].scan_masuk);
      const scanKeluar = new Date(riwayatData.riwayat_scans[0].scan_keluar);
      const duration = (scanKeluar - scanMasuk) / (1000 * 60 * 60); // in hours

      const biaya =
        duration > 24
          ? tarifData.tarif[0].harga_denda
          : tarifData.tarif[0].tarif_harga;

      setBiaya(biaya);
      setDisplayPaymentDialog(true);
    }
  };

  const handlePayment = async () => {
    if (riwayatData && tarifData) {
      const scanMasuk = new Date(riwayatData.riwayat_scans[0].scan_masuk);
      const scanKeluar = new Date(riwayatData.riwayat_scans[0].scan_keluar);
      const duration = (scanKeluar - scanMasuk) / (1000 * 60 * 60); // in hours

      const biaya =
        duration > 24
          ? tarifData.tarif[0].harga_denda
          : tarifData.tarif[0].tarif_harga;
      const statusPembayaran = "Sudah bayar";

      try {
        await updateStatusPembayaran({
          variables: {
            cardMotorId: parseInt(cardId),
            biaya,
            statusPembayaran,
          },
        });

        setNotificationMessage("Status pembayaran berhasil diubah.");
        setNotification(true);

        setTimeout(() => {
          navigate("/scan-keluar-parkir");
        }, 2000);
      } catch (error) {
        console.error("Error updating payment status:", error);
        setNotificationMessage("Gagal mengupdate status pembayaran.");
        setNotification(true);
      }
    }
  };

  const closeNotification = () => {
    setNotification(false);
  };

  return (
    <div className="flex">
      <div className="flex flex-col bg-white-maron flex-grow min-h-screen">
        <center>
          <div className="my-5" style={{ width: "90%" }}>
            <div className="flex">
              <h1 className="font-semibold text-2xl">Detail Card Motor</h1>
            </div>
            <hr className="mb-5 bg-grey-maron pt-1 mt-2" />
          </div>
        </center>

        <center className=" mx-auto md:my-auto" style={{ width: "90%" }}>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <ProgressSpinner />
            </div>
          ) : error ? (
            <p>Error: {error.message}</p>
          ) : card ? (
            <div className="p-5 bg-white-light shadow-2xl rounded-xl max-w-96 mb-5">
              <div className="mb-4">
                <p className="text-2xl font-semibold mb-1 break-words">
                  Nama Mahasiswa: {card.mahasiswa.user.nama}
                </p>
                <p className="text-base">NIM: {card.mahasiswa.NIM}</p>
              </div>
              <div className="max-w-44 space-y-2">
                <img src={card.foto_STNK} alt="STNK" />
                <img src={card.foto_KTM} alt="KTM" />
                <img src={card.foto_motor} alt="Motor" />
              </div>
              {roleId === 2 ? (
                <div
                  className="flex justify-center mt-4 text-sm space-x-4"
                  style={{ width: "90%" }}
                >
                  <button
                    onClick={() => navigate(-1)}
                    className=" bg-red-maron hover:bg-red-700 text-white py-2 px-3 my-2 rounded flex justify-start"
                  >
                    <BsChevronLeft className="my-auto" />
                    Kembali
                  </button>
                  <button
                    className=" bg-red-maron hover:bg-red-700 text-white py-2 px-3 my-2 rounded flex justify-start"
                    onClick={handleCheckBiaya}
                  >
                    Cek biaya
                  </button>
                </div>
              ) : (
                <div className="actions">
                  <div
                    className="flex justify-center mt-4 text-sm space-x-4"
                    style={{ width: "90%" }}
                  >
                    <button
                      onClick={() => navigate(-1)}
                      className=" bg-red-maron hover:bg-red-700 text-white py-2 px-3 my-2 rounded flex justify-start"
                    >
                      <BsChevronLeft className="my-auto" />
                      Kembali
                    </button>
                    <button
                      className=" bg-red-maron hover:bg-red-700 text-white py-2 px-3 my-2 rounded flex justify-start"
                      onClick={handleGenerateQRCode}
                    >
                      Generate QR Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Card motor tidak ditemukan.</p>
          )}
        </center>
      </div>

      <Dialog
        header="QR Code"
        visible={displayDialog}
        draggable={false}
        className="w-64"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.25)" }}
        onHide={() => setDisplayDialog(false)}
      >
        <div className="flex justify-center" ref={qrRef}>
          <QRCode
            value={`https://parkir-qr-telkom-university-surabaya.netlify.app/list-card-motor/${user.id}/detail-card-motor/${cardId}`}
          />
        </div>
        <button
          onClick={saveQRCodeToStorage}
          className="flex justify-center text-white mx-auto mt-6 bg-red-maron hover:bg-red-700 py-2 px-3 my-2 rounded"
        >
          Simpan QR Code
        </button>
      </Dialog>

      <Dialog
        header="Biaya Parkir"
        visible={displayPaymentDialog}
        draggable={false}
        className="w-64 "
        style={{ backgroundColor: "rgba(0, 0, 0, 0.25)" }}
        onHide={() => setDisplayPaymentDialog(false)}
      >
        <div className="flex flex-col justify-center items-center">
          <p>Biaya parkir yang dikenakan sebesar: {biaya}</p>
          <button
            onClick={handlePayment}
            className="flex justify-center text-white mx-auto mt-6 bg-red-maron hover:bg-red-700 py-2 px-3 my-2 rounded"
          >
            Sudah bayar
          </button>
        </div>
      </Dialog>

      <Notification
        message={notificationMessage}
        visible={notification}
        onClose={closeNotification}
      />
    </div>
  );
};

export default DetailCardMotor;
