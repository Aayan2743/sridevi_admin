// // import { useState } from "react";

// // const steps = [
// //   "Basic Info",
// //   "Gallery",
// //   "Variation",
// //   "Meta Info",
// //   "GST & Affinity",
// // ];

// // export default function AddProductModal({ onClose }) {
// //   const [step, setStep] = useState(0);

// //   return (
// //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
// //       <div className="bg-white rounded-xl w-full max-w-3xl shadow-lg">
// //         {/* HEADER */}
// //         <div className="p-4 border-b flex justify-between items-center">
// //           <h2 className="font-semibold text-lg">Add Product</h2>
// //           <button onClick={onClose}>✕</button>
// //         </div>

// //         {/* STEPS */}
// //         <div className="flex justify-between px-6 py-3 text-xs text-gray-500">
// //           {steps.map((s, i) => (
// //             <span
// //               key={i}
// //               className={`${step === i ? "text-blue-600 font-semibold" : ""}`}
// //             >
// //               {i + 1}. {s}
// //             </span>
// //           ))}
// //         </div>

// //         {/* BODY */}
// //         <div className="p-6 space-y-4">
// //           {step === 0 && <StepOne />}
// //           {step === 1 && <StepTwo />}
// //           {step === 2 && <StepThree />}
// //           {step === 3 && <StepFour />}
// //           {step === 4 && <StepFive />}
// //         </div>

// //         {/* FOOTER */}
// //         <div className="p-4 border-t flex justify-between">
// //           <button
// //             disabled={step === 0}
// //             onClick={() => setStep(step - 1)}
// //             className="px-4 py-2 border rounded disabled:opacity-50"
// //           >
// //             Back
// //           </button>

// //           {step < 4 ? (
// //             <button
// //               onClick={() => setStep(step + 1)}
// //               className="px-4 py-2 bg-blue-600 text-white rounded"
// //             >
// //               Next
// //             </button>
// //           ) : (
// //             <button className="px-4 py-2 bg-green-600 text-white rounded">
// //               Save Product
// //             </button>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // /* ================== STEPS ================== */

// // function StepOne() {
// //   return (
// //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //       <Input label="Product Name" />
// //       <Select label="Category" />
// //       <Select label="Brand" />
// //       <Input label="Amount" type="number" />
// //       <Textarea label="Description" />
// //     </div>
// //   );
// // }

// // function StepTwo() {
// //   return (
// //     <div className="space-y-4">
// //       <Input label="Upload Images" type="file" />
// //       <Input label="Video Link" />
// //     </div>
// //   );
// // }

// // function StepThree() {
// //   return (
// //     <div>
// //       <p className="text-sm text-gray-500">
// //         Add product variations (size, color, etc.)
// //       </p>
// //     </div>
// //   );
// // }

// // function StepFour() {
// //   return (
// //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //       <Input label="Meta Title" />
// //       <Textarea label="Meta Description" />
// //       <Input label="Tags" />
// //     </div>
// //   );
// // }

// // function StepFive() {
// //   return (
// //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //       <Input label="GST (%)" type="number" />
// //       <Select label="Affinity" options={["Yes", "No"]} />
// //       <Input label="Affinity Percentage" type="number" />
// //     </div>
// //   );
// // }

// // /* ================== FORM CONTROLS ================== */

// // function Input({ label, type = "text" }) {
// //   return (
// //     <div>
// //       <label className="text-sm text-gray-600">{label}</label>
// //       <input type={type} className="w-full mt-1 px-3 py-2 border rounded-lg" />
// //     </div>
// //   );
// // }

// // function Textarea({ label }) {
// //   return (
// //     <div className="md:col-span-2">
// //       <label className="text-sm text-gray-600">{label}</label>
// //       <textarea className="w-full mt-1 px-3 py-2 border rounded-lg" />
// //     </div>
// //   );
// // }

// // function Select({ label, options = ["Option 1", "Option 2"] }) {
// //   return (
// //     <div>
// //       <label className="text-sm text-gray-600">{label}</label>
// //       <select className="w-full mt-1 px-3 py-2 border rounded-lg">
// //         {options.map((o) => (
// //           <option key={o}>{o}</option>
// //         ))}
// //       </select>
// //     </div>
// //   );
// // }

// import { useEffect, useRef, useState } from "react";
// import WizardHeader from "./WizardHeader";
// const steps = [
//   "Basic Information",
//   "Gallery",
//   "Variation",
//   "SEO",
//   "Tax & Affinity",
// ];
// export default function AddProductModal({ onClose }) {
//   const [step, setStep] = useState(0);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//       <div className="bg-white rounded-xl w-full max-w-4xl shadow-lg overflow-hidden">
//         {/* TOP HEADER */}
//         <div className="px-6 py-4 border-b flex justify-between items-start">
//           <div>
//             <h2 className="text-lg font-semibold">Add Product — Wizard</h2>
//             <p className="text-sm text-gray-500">Step {step + 1} of 5</p>
//           </div>

//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600"
//           >
//             ✕
//           </button>
//         </div>

//         {/* STEP TABS */}
//         <WizardHeader currentStep={step} onStepChange={setStep} />

//         {/* BODY */}
//         <div className="p-6">
//           {step === 0 && <StepOne />}
//           {step === 1 && <StepTwo />}
//           {step === 2 && <StepThree />}
//           {step === 3 && <StepFour />}
//           {step === 4 && <StepFive />}
//         </div>

//         {/* FOOTER */}
//         <div className="border-t px-6 py-4 flex justify-between">
//           <button
//             disabled={step === 0}
//             onClick={() => setStep(step - 1)}
//             className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50"
//           >
//             Back
//           </button>

//           {step < 4 ? (
//             <button
//               onClick={() => setStep(step + 1)}
//               className="px-5 py-2 rounded-lg bg-indigo-600 text-white"
//             >
//               Next
//             </button>
//           ) : (
//             <button className="px-5 py-2 rounded-lg bg-green-600 text-white">
//               Save Product
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function StepOne() {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <Input label="Product Name" />
//       <Select label="Category" />
//       <Select label="Brand" />
//       <Input label="Amount" type="number" />
//       <Textarea label="Description" />
//     </div>
//   );
// }

// function StepTwo() {
//   return (
//     <div className="space-y-4">
//       <Input label="Upload Images" type="file" />
//       <Input label="Video Link" />
//     </div>
//   );
// }

// function StepThree() {
//   return (
//     <div>
//       <p className="text-sm text-gray-500">
//         Add product variations (size, color, etc.)
//       </p>
//     </div>
//   );
// }

// function StepFour() {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <Input label="Meta Title" />
//       <Textarea label="Meta Description" />
//       <Input label="Tags" />
//     </div>
//   );
// }

// function StepFive() {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <Input label="GST (%)" type="number" />
//       <Select label="Affinity" options={["Yes", "No"]} />
//       <Input label="Affinity Percentage" type="number" />
//     </div>
//   );
// }

// /* ================== FORM CONTROLS ================== */

// function Input({ label, type = "text" }) {
//   return (
//     <div>
//       <label className="text-sm text-gray-600">{label}</label>
//       <input type={type} className="w-full mt-1 px-3 py-2 border rounded-lg" />
//     </div>
//   );
// }

// function Textarea({ label }) {
//   return (
//     <div className="md:col-span-2">
//       <label className="text-sm text-gray-600">{label}</label>
//       <textarea className="w-full mt-1 px-3 py-2 border rounded-lg" />
//     </div>
//   );
// }

// function Select({ label, options = ["Option 1", "Option 2"] }) {
//   return (
//     <div>
//       <label className="text-sm text-gray-600">{label}</label>
//       <select className="w-full mt-1 px-3 py-2 border rounded-lg">
//         {options.map((o) => (
//           <option key={o}>{o}</option>
//         ))}
//       </select>
//     </div>
//   );
// }
