import { useParams } from "react-router-dom";

export default function InvoiceWithLogoPrint() {
  const { id } = useParams();

  return (
    <div className="bg-gray-100 min-h-screen p-4 print:p-0">
      {/* ACTION BAR */}
      <div className="flex justify-end gap-3 mb-4 print:hidden">
        <button
          onClick={() => window.print()}
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

      {/* INVOICE PAGE */}
      <div className="bg-white mx-auto shadow print:shadow-none p-8 max-w-[210mm] text-sm">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <img
              src="/logo/gemtech-logo.webp"
              alt="Gemtech International Laboratories"
              className="h-14"
            />
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-center font-bold text-lg tracking-wide mb-4">
          INVOICE
        </h1>

        {/* META INFO */}
        <div className="flex justify-between mb-4">
          <div className="space-y-1">
            <p>
              <strong>Invoice No :</strong> INV/25-26/GILCNF1105
            </p>
            <p>
              <strong>Invoice To :</strong> Rajdeep Jewellers
            </p>
            <p className="text-gray-700">Abids, Mayurkhusal Complex</p>
          </div>

          <div className="text-right space-y-1">
            <p>
              <strong>Date :</strong> 01-Jan-1970
            </p>
          </div>
        </div>

        {/* TABLE */}
        <table className="w-full border-t border-b text-sm mb-6">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Sr No.</th>
              <th className="py-2 text-left">Dia / Caratage</th>
              <th className="py-2 text-left">Services</th>
              <th className="py-2 text-right">Rates</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Carat</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {/* EMPTY STATE (LIKE YOUR EXISTING PRINT) */}
            <tr>
              <td colSpan="7" className="py-6 text-center text-gray-500">
                —
              </td>
            </tr>
          </tbody>

          <tfoot>
            <tr className="border-t">
              <td colSpan="4"></td>
              <td className="py-2 font-semibold text-right">SUB TOTAL</td>
              <td className="py-2 text-right">0.00</td>
              <td className="py-2 text-right">0.00</td>
            </tr>
          </tfoot>
        </table>

        {/* FOOTER NOTE */}
        <div className="text-xs text-gray-600 mt-16">
          <p>This is a computer generated invoice. No signature required.</p>
        </div>
      </div>
    </div>
  );
}
