import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Receipt77mm from "./Receipt77mm";
// import Receipt77mm from "../components/Receipt77mm";

export default function PrintReceipt() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/dashboard/pos/order/${id}`).then((res) => {
      setOrder(res.data.data);

      setTimeout(() => {
        window.print();
      }, 300);
    });
  }, [id]);

  if (!order) return null;

  return <Receipt77mm order={order} />;
}
