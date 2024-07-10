import { gql, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import React, { useRef, useState } from "react";
import { QrReader } from "react-qr-reader";
import { useNavigate } from "react-router-dom";
import { Notification, Profilebar, Sidebarpetugas } from "../../components";

const UPDATE_RIWAYAT_PARKIR = gql`
  mutation UpdateRiwayatParkir($cardMotorId: Int!, $scanKeluar: timestamptz!) {
    update_riwayat_scans(
      where: {
        card_motor_id: { _eq: $cardMotorId }
        scan_keluar: { _is_null: true }
      }
      _set: { scan_keluar: $scanKeluar }
    ) {
      affected_rows
    }
  }
`;

const ScanKeluar = () => {
  const [updateRiwayatParkir] = useMutation(UPDATE_RIWAYAT_PARKIR);
  const [notification, setNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const hasScannedRef = useRef(false);
  const navigate = useNavigate();

  const handleResult = async (result, error) => {
    if (result && !hasScannedRef.current) {
      hasScannedRef.current = true;
      setIsScanning(false);

      try {
        const url = new URL(result.text);
        const parts = url.pathname.split("/");
        const userId = parts[2];
        const cardMotorId = parts[4];

        const scanKeluar = new Date().toISOString();

        const { data } = await updateRiwayatParkir({
          variables: {
            cardMotorId: parseInt(cardMotorId),
            scanKeluar,
          },
        });

        if (data.update_riwayat_scans.affected_rows > 0) {
          navigate(
            `/list-card-motor/${userId}/detail-card-motor/${cardMotorId}`,
            {
              state: {
                scanKeluar,
                cardMotorId: parseInt(cardMotorId),
              },
            }
          );

          setNotificationMessage("Scan keluar berhasil disimpan.");
        } else {
          setNotificationMessage(
            "Gagal memproses scan keluar. Data tidak ditemukan atau sudah diproses sebelumnya."
          );
        }
        setNotification(true);
      } catch (error) {
        console.error("Error processing scan data:", error);
        setNotificationMessage("Gagal memproses scan keluar.");
        setNotification(true);
      }
    } else if (error) {
      console.error("QR Code scan error:", error);
    }
  };

  const closeNotification = () => {
    setNotification(false);
  };

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
                  Scan Keluar Parkir
                </h1>
                <Button
                  label="Scan Keluar"
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
      <Notification
        message={notificationMessage}
        visible={notification}
        onClose={closeNotification}
      />
    </>
  );
};

export default ScanKeluar;
