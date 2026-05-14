import { useRef } from "react";
import { useParams } from "react-router-dom";

export default function CashMemoPrint() {
  const { id } = useParams();
  const printRef = useRef();

  const handlePrint = () => window.print();

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* ACTION BAR */}
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

      {/* PRINT AREA */}
      <div
        ref={printRef}
        className="bg-white mx-auto p-8 shadow print:shadow-none print:p-6 max-w-[210mm]"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div className="flex items-center gap-3">
            <img src="/logo/gemtech-logo.webp" alt="GIL" className="h-14" />
            <div>
              <h2 className="text-lg font-bold">
                Gemtech International Laboratories
              </h2>
              <p className="text-xs text-gray-500">
                Certified Gem Testing Services
              </p>
            </div>
          </div>

          <h1 className="text-xl font-bold tracking-wide">CASH MEMO</h1>
        </div>

        {/* META */}
        <div className="grid grid-cols-2 text-sm mb-4">
          <div className="space-y-1">
            <p>
              <strong>Cash Memo No :</strong> CSHGILCNF1105
            </p>
            <p>
              <strong>Cash Memo To :</strong> Rajdeep Jewellers
            </p>
          </div>

          <div className="text-right space-y-1">
            <p>
              <strong>Date :</strong> 20-12-2025
            </p>
          </div>
        </div>

        {/* TABLE */}
        <table className="w-full border text-sm mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Sr No</th>
              <th className="border p-2">Dia. Caratage</th>
              <th className="border p-2">Services</th>
              <th className="border p-2 text-right">Rates</th>
              <th className="border p-2 text-center">Qty</th>
              <th className="border p-2 text-right">Carat</th>
              <th className="border p-2 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            <tr className="h-12">
              <td className="border p-2 text-center">1</td>
              <td className="border p-2">---</td>
              <td className="border p-2">Gold Test</td>
              <td className="border p-2 text-right">500</td>
              <td className="border p-2 text-center">1</td>
              <td className="border p-2 text-right">0.00</td>
              <td className="border p-2 text-right">500</td>
            </tr>

            {/* SUB TOTAL */}
            <tr className="font-semibold bg-gray-50">
              <td colSpan="4" className="border p-2 text-right">
                SUB TOTAL
              </td>
              <td className="border p-2 text-center">1</td>
              <td className="border p-2 text-right">0.00</td>
              <td className="border p-2 text-right">500</td>
            </tr>
          </tbody>
        </table>

        {/* FOOTER */}
        <div className="text-sm mt-10 flex justify-between">
          <div>
            <p>Receiver’s Signature</p>
            <p className="mt-8">Date</p>
          </div>

          <div className="text-right">
            <p>Authorized Signature</p>
            <p className="mt-8">Gemtech International Labs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
