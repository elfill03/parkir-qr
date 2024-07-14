import { gql, useQuery } from "@apollo/client";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import client from "../../apolloClient";
import { Profilebar, Sidebar } from "../../components";

const GET_MAHASISWA_COUNT = gql`
  query GetMahasiswaCount {
    mahasiswas_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const GET_PETUGAS_COUNT = gql`
  query GetPetugasCount {
    users_aggregate(where: { role_id: { _eq: 2 } }) {
      aggregate {
        count
      }
    }
  }
`;

const GET_RIWAYAT_PARKIR = gql`
  query GetRiwayatParkir($startDate: timestamptz!, $endDate: timestamptz!) {
    riwayat_scans(where: { scan_masuk: { _gte: $startDate, _lte: $endDate } }) {
      id
      scan_masuk
      scan_keluar
    }
  }
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-grey-light p-2 rounded space-y-1">
        <p className="label">{`Tanggal ${label}`}</p>
        <p
          className="intro text-white-light py-1"
          style={{ backgroundColor: "#8884d8" }}
        >{`Masuk: ${payload[0].value}`}</p>
        <p
          className="intro text-white-light py-1"
          style={{ backgroundColor: "#82ca9d" }}
        >{`Keluar: ${payload[1].value}`}</p>
      </div>
    );
  }

  return null;
};

const Dashboard = () => {
  const { data: mahasiswaData } = useQuery(GET_MAHASISWA_COUNT, { client });
  const { data: petugasData } = useQuery(GET_PETUGAS_COUNT, { client });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [chartData, setChartData] = useState([]);
  const [totalVehicles, setTotalVehicles] = useState(0);

  const startDate = new Date(
    new Date().getFullYear(),
    selectedMonth - 1,
    1
  ).toISOString();
  const endDate = new Date(
    new Date().getFullYear(),
    selectedMonth,
    0
  ).toISOString();

  const { loading: loadingRiwayat, data: riwayatData } = useQuery(
    GET_RIWAYAT_PARKIR,
    {
      client,
      variables: { startDate, endDate },
    }
  );

  useEffect(() => {
    if (riwayatData) {
      const daysInMonth = new Date(
        new Date().getFullYear(),
        selectedMonth,
        0
      ).getDate();

      const formattedData = riwayatData.riwayat_scans.reduce((acc, scan) => {
        const masukDate = new Date(scan.scan_masuk).getDate();
        const keluarDate = scan.scan_keluar
          ? new Date(scan.scan_keluar).getDate()
          : null;

        if (!acc[masukDate])
          acc[masukDate] = { date: masukDate, masuk: 0, keluar: 0 };
        if (keluarDate && !acc[keluarDate])
          acc[keluarDate] = { date: keluarDate, masuk: 0, keluar: 0 };

        acc[masukDate].masuk += 1;
        if (keluarDate) acc[keluarDate].keluar += 1;

        return acc;
      }, {});

      const dataArray = Array.from({ length: daysInMonth }, (_, i) => ({
        date: i + 1,
        masuk: formattedData[i + 1]?.masuk || 0,
        keluar: formattedData[i + 1]?.keluar || 0,
      }));

      setChartData(dataArray);

      const totalMasuk = dataArray.reduce((sum, data) => sum + data.masuk, 0);

      setTotalVehicles(totalMasuk);
    }
  }, [riwayatData, selectedMonth]);

  if (!mahasiswaData || !petugasData) {
    return <div className="text-center mt-4">Loading...</div>;
  }

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value));
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col bg-white-maron flex-grow min-h-screen">
        <Profilebar />
        <center className="mt-auto mb-auto">
          <div className="mb-10" style={{ width: "90%" }}>
            <div className="flex justify-between mb-6 bg-white-light rounded-lg shadow-lg">
              <div className=" p-6 text-center">
                <p className="text-base md:text-base sm:text-sm font-medium text-gray-700">
                  Jumlah Mahasiswa
                </p>
                <p className="text-3xl  font-bold text-gray-900">
                  {mahasiswaData.mahasiswas_aggregate.aggregate.count}
                </p>
              </div>
              <div className="p-6 text-center">
                <p className="text-base md:text-base sm:text-sm font-medium text-gray-700">
                  Jumlah Petugas
                </p>
                <p className="text-3xl  font-bold text-gray-900">
                  {petugasData.users_aggregate.aggregate.count}
                </p>
              </div>
              <div className="p-6 text-center">
                <p className="text-base md:text-base sm:text-sm font-medium text-gray-700">
                  Jumlah Kendaraan
                </p>
                {loadingRiwayat ? (
                  <div className="flex justify-center items-center h-24">
                    <ProgressSpinner />
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {totalVehicles}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
              <h2 className="text-center text-xl font-medium text-gray-700 mb-4">
                Pilih Bulan
              </h2>
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="block w-full p-2 border rounded-lg"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-center text-xl font-medium text-gray-700 mb-4">
                Riwayat Parkir per Tanggal
              </h2>
              {loadingRiwayat ? (
                <div className="flex justify-center items-center h-32">
                  <ProgressSpinner />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      label={{
                        value: "Tanggal",
                        position: "insideBottom",
                        offset: -1,
                      }}
                    />
                    <YAxis
                      label={{
                        value: "Jumlah Kendaraan",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" align="center" />
                    <Bar dataKey="masuk" fill="#8884d8" name="Masuk" />
                    <Bar dataKey="keluar" fill="#82ca9d" name="Keluar" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </center>
      </div>
    </div>
  );
};

export default Dashboard;
