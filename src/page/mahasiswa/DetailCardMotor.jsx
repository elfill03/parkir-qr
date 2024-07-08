import { gql, useMutation, useQuery } from "@apollo/client";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import QRCode from "qrcode.react";
import React, { useRef, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { Notification } from "../../components"; // Ensure you have this import
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

  const [updateCardQRCode] = useMutation(UPDATE_CARD_QR_CODE);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [qrCodeUrl, setQRCodeUrl] = useState(null);
  const [notification, setNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const qrRef = useRef(null);

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
    }, 100); // Timeout to ensure the QR code is rendered
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

        <center className=" mx-auto" style={{ width: "90%" }}>
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
              {roleId !== 2 ? (
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
              ) : (
                <button className=" bg-red-maron hover:bg-red-700 text-white py-2 px-3 my-2 rounded flex justify-start">
                  Sudah bayar
                </button>
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

      {/* Notification pop up */}
      <Notification
        message={notificationMessage}
        visible={notification}
        onClose={closeNotification}
      />
    </div>
  );
};

export default DetailCardMotor;
