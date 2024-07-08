import "primeicons/primeicons.css";
import { Dialog } from "primereact/dialog";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import React, { useEffect } from "react";

const NotificationModal = ({ message, visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <Dialog
      header="Notifikasi"
      visible={visible}
      style={{
        width: "30%", 
        minWidth: "280px",
        textAlign: "center",
      }}
      onHide={onClose}
      modal
      closable={false}
    >
      <div className="notification-content">{message}</div>
    </Dialog>
  );
};

export default NotificationModal;
