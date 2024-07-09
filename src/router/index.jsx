import {
  Dashboard,
  Dashboardmahasiswa,
  Dashboardpetugas,
  Datamahasiswa,
  Datapetugas,
  Detailcardmotor,
  Listcardmotor,
  Login,
  Riwayatkeluar,
  Riwayatmasuk,
  Scankeluar,
  Scanmasuk,
  Tarif,
  Tarifparkirmahasiswa,
} from "../page";
import ProtectedRoute from "../router/ProtectedRoute";

const router = [
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute roleRequired={1}>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard-mahasiswa",
    element: (
      <ProtectedRoute roleRequired={3}>
        <Dashboardmahasiswa />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard-petugas",
    element: (
      <ProtectedRoute roleRequired={2}>
        <Dashboardpetugas />
      </ProtectedRoute>
    ),
  },
  {
    path: "/scan-masuk-parkir",
    element: (
      <ProtectedRoute roleRequired={2}>
        <Scanmasuk />
      </ProtectedRoute>
    ),
  },
  {
    path: "/scan-keluar-parkir",
    element: (
      <ProtectedRoute roleRequired={2}>
        <Scankeluar />
      </ProtectedRoute>
    ),
  },
  {
    path: "/data-petugas",
    element: (
      <ProtectedRoute roleRequired={1}>
        <Datapetugas />
      </ProtectedRoute>
    ),
  },
  {
    path: "/data-mahasiswa",
    element: (
      <ProtectedRoute roleRequired={1}>
        <Datamahasiswa />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tarif-parkir",
    element: (
      <ProtectedRoute roleRequired={1}>
        <Tarif />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tarif-parkir-mahasiswa",
    element: (
      <ProtectedRoute roleRequired={3}>
        <Tarifparkirmahasiswa />
      </ProtectedRoute>
    ),
  },
  {
    path: "/list-card-motor/:userId",
    element: (
      <ProtectedRoute roleRequired={[1, 3]}>
        <Listcardmotor />
      </ProtectedRoute>
    ),
  },
  {
    path: "/list-card-motor/:userId/detail-card-motor/:cardId",
    element: (
      <ProtectedRoute roleRequired={[1, 2, 3]}>
        <Detailcardmotor />
      </ProtectedRoute>
    ),
  },
  {
    path: "/riwayat-masuk-parkir",
    element: (
      <ProtectedRoute roleRequired={[1, 2]}>
        <Riwayatmasuk />
      </ProtectedRoute>
    ),
  },
  {
    path: "/riwayat-keluar-parkir",
    element: (
      <ProtectedRoute roleRequired={[1, 2]}>
        <Riwayatkeluar />
      </ProtectedRoute>
    ),
  },
];

export default router;
