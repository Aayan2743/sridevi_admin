import { useParams } from "react-router-dom";
import { useEffect } from "react";

export default function InvoicePrint() {
  const { id } = useParams();

  useEffect(() => {
    console.log("Invoice for Confirmation ID:", id);
  }, [id]);

  const handlePrint = () => window.print();

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* ACTION BAR (HIDDEN IN PRINT) */}
      <div className="flex justify-end gap-3 mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg"
        >
          Print
        </button>
        <button onClick={handlePrint} className="border px-5 py-2 rounded-lg">
          Download PDF
        </button>
      </div>

      {/* INVOICE PAGE */}
      <div className="bg-white mx-auto p-8 shadow print:shadow-none max-w-[210mm] text-sm">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-wide">INVOICE</h1>
            <p className="text-xs text-gray-500 mt-1">
              Invoice No : INV/25-26/GILCNF1105
            </p>
          </div>

          <div className="text-right text-xs">
            <p>
              <strong>Date :</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* CLIENT INFO */}
        <div className="mb-6 text-sm">
          <p>
            <strong>Invoice To :</strong> Rajdeep Jewellers
          </p>
          <p className="text-gray-600">Abids, Mayurkhusal Complex</p>
        </div>

        {/* TABLE */}
        <table className="w-full border text-sm mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Sr No</th>
              <th className="border p-2 text-left">Dia / Caratage</th>
              <th className="border p-2 text-left">Service</th>
              <th className="border p-2 text-right">Rate</th>
              <th className="border p-2 text-right">Qty</th>
              <th className="border p-2 text-right">Carat</th>
              <th className="border p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">1</td>
              <td className="border p-2">Diamond</td>
              <td className="border p-2">Certification</td>
              <td className="border p-2 text-right">500</td>
              <td className="border p-2 text-right">2</td>
              <td className="border p-2 text-right">1.20</td>
              <td className="border p-2 text-right">1000</td>
            </tr>
          </tbody>
        </table>

        {/* TOTAL */}
        <div className="flex justify-end">
          <table className="w-1/2 text-sm">
            <tbody>
              <tr>
                <td className="py-2">Sub Total</td>
                <td className="py-2 text-right">1000.00</td>
              </tr>
              <tr className="font-semibold border-t">
                <td className="py-2">Grand Total</td>
                <td className="py-2 text-right">1000.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="mt-10 text-xs text-gray-600">
          <p>
            This is a computer-generated invoice and does not require signature.
          </p>
        </div>
      </div>
    </div>
  );
}
