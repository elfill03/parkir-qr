import { gql, useMutation, useQuery } from "@apollo/client";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useState } from "react";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { Notification, Profilebar, Sidebarmahasiswa } from "../../components";
import { storage } from "../../config/firebase/firebaseConfig";

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
          foto_STNK
          foto_KTM
          foto_motor
          foto_QR_Code
        }
      }
    }
  }
`;

const CREATE_CARD = gql`
  mutation CreateCard(
    $mahasiswaId: Int!
    $fotoSTNK: String!
    $fotoKTM: String!
    $fotoMotor: String!
  ) {
    insert_card_motors_one(
      object: {
        mahasiswa_id: $mahasiswaId
        foto_STNK: $fotoSTNK
        foto_KTM: $fotoKTM
        foto_motor: $fotoMotor
      }
    ) {
      id
    }
  }
`;

const UPDATE_CARD = gql`
  mutation UpdateCard(
    $cardId: Int!
    $fotoSTNK: String!
    $fotoKTM: String!
    $fotoMotor: String!
  ) {
    update_card_motors_by_pk(
      pk_columns: { id: $cardId }
      _set: { foto_STNK: $fotoSTNK, foto_KTM: $fotoKTM, foto_motor: $fotoMotor }
    ) {
      id
    }
  }
`;

const DELETE_CARD = gql`
  mutation DeleteCard($cardId: Int!) {
    delete_card_motors_by_pk(id: $cardId) {
      id
    }
  }
`;

const ListCardMotor = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const { loading, error, data, refetch } = useQuery(GET_USER_CARDS, {
    variables: { userId: parseInt(userId) },
  });

  const [createCard] = useMutation(CREATE_CARD);
  const [updateCard] = useMutation(UPDATE_CARD);
  const [deleteCard] = useMutation(DELETE_CARD);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [notification, setNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [dialogWidth, setDialogWidth] = useState("30%");
  const [fotoSTNK, setFotoSTNK] = useState(null);
  const [fotoKTM, setFotoKTM] = useState(null);
  const [fotoMotor, setFotoMotor] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const cardMotors = data?.users_by_pk?.mahasiswas[0]?.card_motors || [];
  const mahasiswaId = data?.users_by_pk?.mahasiswas[0]?.id || null;

  const handleSubmit = async () => {
    if (cardMotors.length >= 3) {
      setNotificationMessage("Maksimal card motor yang dapat dibuat adalah 3");
      setNotification(true);
      return;
    }

    if (!mahasiswaId) {
      setNotificationMessage("ID Mahasiswa tidak ditemukan.");
      setNotification(true);
      return;
    }

    try {
      const urls = await uploadFiles();
      const { data } = await createCard({
        variables: {
          mahasiswaId: mahasiswaId,
          fotoSTNK: urls.fotoSTNK,
          fotoKTM: urls.fotoKTM,
          fotoMotor: urls.fotoMotor,
        },
      });
      if (data.insert_card_motors_one.id) {
        setNotificationMessage("Berhasil membuat card motor");
        setNotification(true);
        refetch();
      }
    } catch (error) {
      console.error("Error creating card:", error);
      console.error(
        "GraphQL error details:",
        error.networkError?.result?.errors || error.message
      );
    } finally {
      setDisplayDialog(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCard) return;

    try {
      await deleteFilesFromStorage(selectedCard);

      const urls = await uploadFiles();
      const { data } = await updateCard({
        variables: {
          cardId: selectedCard.id,
          fotoSTNK: urls.fotoSTNK,
          fotoKTM: urls.fotoKTM,
          fotoMotor: urls.fotoMotor,
        },
      });
      if (data.update_card_motors_by_pk.id) {
        setNotificationMessage("Berhasil mengedit card motor");
        setNotification(true);
        refetch();
      }
    } catch (error) {
      console.error("Error editing card:", error);
      console.error(
        "GraphQL error details:",
        error.networkError?.result?.errors || error.message
      );
    } finally {
      setEditDialog(false);
    }
  };

  const handleDelete = async (card) => {
    try {
      await deleteFilesFromStorage(card);

      const { data } = await deleteCard({
        variables: { cardId: card.id },
      });

      if (data.delete_card_motors_by_pk.id) {
        setNotificationMessage("Berhasil menghapus card motor");
        setNotification(true);
        refetch();
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      console.error(
        "GraphQL error details:",
        error.networkError?.result?.errors || error.message
      );
    }
  };

  const deleteFilesFromStorage = async (card) => {
    const deletePromises = [];

    if (card.foto_STNK) {
      const stnkRef = ref(storage, card.foto_STNK);
      deletePromises.push(deleteObject(stnkRef));
    }
    if (card.foto_KTM) {
      const ktmRef = ref(storage, card.foto_KTM);
      deletePromises.push(deleteObject(ktmRef));
    }
    if (card.foto_motor) {
      const motorRef = ref(storage, card.foto_motor);
      deletePromises.push(deleteObject(motorRef));
    }

    await Promise.all(deletePromises);
  };

  const uploadFiles = async () => {
    const stnkRef = ref(storage, `images/stnk_${Date.now()}`);
    const ktmRef = ref(storage, `images/ktm_${Date.now()}`);
    const motorRef = ref(storage, `images/motor_${Date.now()}`);

    const [fotoSTNKUrl, fotoKTMUrl, fotoMotorUrl] = await Promise.all([
      uploadFile(fotoSTNK, stnkRef),
      uploadFile(fotoKTM, ktmRef),
      uploadFile(fotoMotor, motorRef),
    ]);

    return {
      fotoSTNK: fotoSTNKUrl,
      fotoKTM: fotoKTMUrl,
      fotoMotor: fotoMotorUrl,
    };
  };

  const uploadFile = async (file, storageRef) => {
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

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

  return (
    <div className="flex">
      <Sidebarmahasiswa />
      <div className="flex flex-col bg-white-maron flex-grow min-h-screen">
        <Profilebar />
        <center>
          <div className="mb-5">
            <div className="flex" style={{ width: "90%" }}>
              <h1 className="font-semibold text-2xl">List Card Motor</h1>
              <button
                className="bg-red-maron hover:bg-red-700 text-white-light ml-auto flex items-center px-3 py-2 rounded-lg"
                onClick={() => setDisplayDialog(true)}
              >
                Buat card
              </button>
            </div>
            <hr
              className="mb-5 bg-grey-maron pt-1 mt-2"
              style={{ width: "90%" }}
            />
          </div>
        </center>
        <center className="mt-5 mx-auto" style={{ width: "90%" }}>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <ProgressSpinner />
            </div>
          ) : error ? (
            <p>Error: {error.message}</p>
          ) : cardMotors.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-xl font-semibold">
                Anda tidak memiliki card motor, silahkan buat terlebih dahulu
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center">
              {cardMotors.map((card, index) => (
                <div key={card.id} className="mb-5 mx-10 p-2">
                  <div className="p-5 bg-white-light shadow-2xl rounded-xl">
                    <img
                      className="w-64 h-48 mb-5"
                      src={card.foto_motor}
                      alt="motorcycle"
                    />
                    <h1 className="text-lg font-semibold mb-1">
                      Card Motor {index + 1}
                    </h1>
                    <hr className="mb-2 bg-red-maron pt-1" />
                    <div
                      className="flex justify-center text-sm space-x-4"
                      style={{ width: "90%" }}
                    >
                      <button
                        className=" bg-red-maron hover:bg-red-700 text-white py-2 px-3 my-2 rounded flex justify-start"
                        onClick={() => {
                          setSelectedCard(card);
                          setEditDialog(true);
                        }}
                      >
                        <BsPencilSquare className="my-auto me-1" />
                        Edit
                      </button>
                      <button
                        className=" bg-red-maron hover:bg-red-700 text-white py-2 px-3 my-2 rounded flex justify-start"
                        onClick={() => handleDelete(card)}
                      >
                        <BsTrash className="my-auto me-1" />
                        Hapus
                      </button>
                    </div>
                    <div className="flex my-2 w-full text-start justify-center text-base font-semibold">
                      <button
                        onClick={() =>
                          navigate(
                            `/list-card-motor/${userId}/detail-card-motor/${card.id}`
                          )
                        }
                        className="bg-red-maron hover:bg-red-700 text-white p-2 rounded"
                      >
                        Detail card motor
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </center>
      </div>

      {/* Dialog pop up */}
      <Dialog
        header="Buat Card Motor"
        visible={displayDialog}
        style={{ width: dialogWidth }}
        onHide={() => setDisplayDialog(false)}
        draggable={false}
        className="centered-dialog"
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="fotoSTNK">Foto STNK</label> <br />
            <input
              type="file"
              id="fotoSTNK"
              onChange={(e) => setFotoSTNK(e.target.files[0])}
              className="input-border w-full"
            />
          </div>
          <div className="p-field">
            <label htmlFor="fotoKTM">Foto KTM</label> <br />
            <input
              type="file"
              id="fotoKTM"
              onChange={(e) => setFotoKTM(e.target.files[0])}
              className="input-border w-full"
            />
          </div>
          <div className="p-field">
            <label htmlFor="fotoMotor">Foto Motor</label> <br />
            <input
              type="file"
              id="fotoMotor"
              onChange={(e) => setFotoMotor(e.target.files[0])}
              className="input-border w-full"
            />
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

      {/* Edit Dialog pop up */}
      <Dialog
        header="Edit Card Motor"
        visible={editDialog}
        style={{ width: dialogWidth }}
        onHide={() => setEditDialog(false)}
        draggable={false}
        className="centered-dialog"
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="fotoSTNK">Foto STNK</label> <br />
            <input
              type="file"
              id="fotoSTNK"
              onChange={(e) => setFotoSTNK(e.target.files[0])}
              className="input-border w-full"
            />
          </div>
          <div className="p-field">
            <label htmlFor="fotoKTM">Foto KTM</label> <br />
            <input
              type="file"
              id="fotoKTM"
              onChange={(e) => setFotoKTM(e.target.files[0])}
              className="input-border w-full"
            />
          </div>
          <div className="p-field">
            <label htmlFor="fotoMotor">Foto Motor</label> <br />
            <input
              type="file"
              id="fotoMotor"
              onChange={(e) => setFotoMotor(e.target.files[0])}
              className="input-border w-full"
            />
          </div>
        </div>
        <div className="flex justify-center mt-5">
          <Button
            label="Batal"
            icon="pi pi-times"
            onClick={() => setEditDialog(false)}
            className="bg-red-maron hover:bg-red-700 py-2 px-4 text-white-light"
            severity="danger"
          />
          <Button
            label="Simpan"
            icon="pi pi-check"
            onClick={handleEdit}
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
    </div>
  );
};

export default ListCardMotor;
