import { gql, useQuery } from "@apollo/client";
import { ProgressSpinner } from "primereact/progressspinner";
import React from "react";
import { img5 } from "../../assets";
import { Profilebar, Sidebarmahasiswa } from "../../components";

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

const TarifParkir = () => {
  const { loading, error, data } = useQuery(GET_TARIFF);

  if (error) return <p>Error: {error.message}</p>;

  let newTarifHarga = 0;
  let newHargaDenda = 0;
  let newBiayaInap = 0;

  if (data && data.tarif.length > 0) {
    newTarifHarga = data.tarif[0].tarif_harga;
    newHargaDenda = data.tarif[0].harga_denda;
    newBiayaInap = data.tarif[0].biaya_inap;
  }

  return (
    <>
      <div className="flex">
        <Sidebarmahasiswa />
        <div className="flex flex-col bg-white-maron flex-grow min-h-screen">
          <Profilebar />
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
          <center className="mt-5 mx-auto">
            <div className="flex" style={{ width: "90%" }}>
              <div className="p-5 max-w-80 bg-white-light shadow-2xl rounded-xl">
                <img className="h-auto w-30 mb-5" src={img5} alt="motorcycle" />
                <h1 className="text-lg font-semibold mb-1">
                  Tarif Parkir & Denda Motor
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
                  </>
                )}
                <hr className="mt-5 bg-red-maron pt-1" />
                <p className="text-justify break-words mt-1">
                  <span className="text-red-maron font-semibold">
                    Peringatan!
                  </span>{" "}
                  apabila mahasiswa parkir dengan jangka waktu lebih dari 24 jam
                  tanpa mengajukan parkir inap maka akan dikenakan denda.
                </p>
              </div>
            </div>
          </center>
        </div>
      </div>
    </>
  );
};

export default TarifParkir;
