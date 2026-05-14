import { useRef } from "react";
import { useParams } from "react-router-dom";
export default function ConfirmationPrint() {
  const { id } = useParams();

  console.log("Confirmation ID:", id); // 👈 must log

  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* ACTION BAR (NOT PRINTED) */}
      <div className="flex justify-end gap-3 mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg"
        >
          Print
        </button>

        <button
          onClick={() => window.print()}
          className="border px-5 py-2 rounded-lg"
        >
          Download PDF
        </button>
      </div>

      {/* PRINT AREA */}
      <div
        ref={printRef}
        className="bg-white mx-auto p-8 shadow print:shadow-none print:p-6 max-w-[210mm]"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <img src="/logo/gemtech-logo.webp" alt="GIL" className="h-16" />

          <h1 className="text-xl font-bold tracking-wide">CONFIRMATION</h1>
        </div>

        {/* META */}
        <div className="grid grid-cols-2 text-sm mb-4">
          <div>
            <p>
              <strong>Confirmation No :</strong> GILCNF1105
            </p>
            <p>
              <strong>Received By :</strong> Admin
            </p>
          </div>

          <div className="text-right">
            <p>
              <strong>Print Date :</strong> 20-12-2025 05:21 PM
            </p>
            <p>
              <strong>Received On :</strong> 20-12-2025 05:21 PM
            </p>
          </div>
        </div>

        {/* TABLE */}
        <table className="w-full border text-sm mb-4">
          <thead>
            <tr className="border">
              <th className="border p-2">Sr No</th>
              <th className="border p-2">Retailer</th>
              <th className="border p-2">Supplier</th>
              <th className="border p-2">Item</th>
              <th className="border p-2">No of Pcs</th>
              <th className="border p-2">Weight</th>
              <th className="border p-2">Services</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 text-center">1</td>
              <td className="border p-2">Rajdeep Jewellers</td>
              <td className="border p-2">---</td>
              <td className="border p-2">Ring</td>
              <td className="border p-2 text-center">2</td>
              <td className="border p-2 text-center">15.20</td>
              <td className="border p-2">Gold Test</td>
            </tr>
          </tbody>
        </table>

        {/* FOOTER INFO */}
        <div className="text-sm space-y-2 mb-6">
          <p>
            <strong>Total No. of Pieces :</strong> 2
          </p>
          <p>
            <strong>Comments :</strong>
          </p>
          <p>
            <strong>Delivery Details :</strong>
          </p>
        </div>

        {/* TERMS */}
        <div className="text-xs leading-relaxed mb-10">
          <p className="font-semibold mb-1">Terms and Conditions :</p>
          <p>
            GIL shall not be held responsible for any damage or loss unless
            caused by laboratory staff.
          </p>
          <p>We agree to the laboratory examination and certification terms.</p>
        </div>

        {/* SIGNATURES */}
        <div className="flex justify-between text-sm mt-16">
          <div>
            <p>Receiver's Signature</p>
            <p className="mt-8">Date</p>
          </div>

          <div className="text-right">
            <p>Depositor's Signature</p>
            <p className="mt-8">Deposited By</p>
          </div>
        </div>
      </div>
    </div>
  );
}
