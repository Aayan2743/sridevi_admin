import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

import { useAuth } from "../auth/AuthContext";
import AccessDenied from "./components/AccessDenied";

export default function StaffAttendanceCalendar() {

  
  const { can,permissions } = useAuth();
  console.log("User Permissions dfdfdfdf:",can);
  console.log("User Permissions array:",permissions);

  /* ================= OT CALUCTION ================= */

  /* ================= TAB ================= */
  const [activeTab, setActiveTab] = useState("attendance");

  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    name: "",
    phone: "",
    email: "",
    role: "employee",
    status: "active",
  });

  /* ================= STAFF ================= */
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [selectedStaffForSalary, setSelectedStaffForSalary] = useState(null);

  const [salaryForm, setSalaryForm] = useState({
    currentSalary: "",
    newSalary: "",
    effective_from: "",
  });

  /* ================= ADD STAFF DRAWER ================= */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: "",
    phone: "",
    email: "",
    role: "Staff",
    salary: "",
    joining_date: "",
  });

  /* ================= ATTENDANCE ================= */
  const [attendance, setAttendance] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({
    status: "present",
    inTime: "",
    outTime: "",
    otAmount: "",
  });

  const attendanceData = attendance[selectedStaff] || {};

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let ot = 0;

    Object.values(attendanceData).forEach((record) => {
      if (record.status === "present") present++;
      if (record.status === "absent") absent++;
      if (record.status === "leave") leave++;
      if (record.status === "ot") ot++;
    });

    return {
      totalDays: present + absent + leave + ot,
      present,
      absent,
      leave,
      ot,
    };
  }, [attendanceData]);

  const totalOTAmount = useMemo(() => {
    return Object.values(attendanceData).reduce((total, record) => {
      return total + (Number(record.ot_amount) || 0);
    }, 0);
  }, [attendanceData]);

  /* ================= CALENDAR LOGIC ================= */
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [firstDay, daysInMonth]);

  const formatDate = (day) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
      2,
      "0",
    )}`;

  /* ================= FETCH STAFF ================= */
  const fetchStaff = async () => {
    try {
      const res = await api.get("/admin-dashboard/staff");
      setStaffList(res.data.data);

      if (res.data.data.length && !selectedStaff) {
        setSelectedStaff(res.data.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch staff", err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openSalaryModal = (staff) => {
    setSelectedStaffForSalary(staff);

    setSalaryForm({
      currentSalary: staff.current_salary?.salary || "",
      newSalary: "",
      effective_from: "",
    });

    setSalaryModalOpen(true);
  };

  const selectedStaffObj = staffList.find((s) => s.id === selectedStaff);

  const monthlySalary = selectedStaffObj?.current_salary?.salary || 0;

  // Per day based on total calendar days
  const perDaySalary =
    monthlySalary && daysInMonth ? monthlySalary / daysInMonth : 0;

  // Deduction for absent
  const deduction = perDaySalary * summary.absent;

  // Final amount = salary - deduction + OT
  const finalAmount = monthlySalary - deduction + totalOTAmount;

  /* ================= Edit STAFF ================= */
  const openEditDrawer = (staff) => {
    setEditForm({
      id: staff.id,
      name: staff.name,
      phone: staff.phone,
      email: staff.email,
      role: staff.role,
      status: staff.status || "active",
    });

    setEditDrawerOpen(true);
  };

  /* ================= ADD STAFF ================= */
  const addStaff = async () => {
    if (
      !staffForm.name ||
      !staffForm.phone ||
      !staffForm.email ||
      !staffForm.salary ||
      !staffForm.joining_date
    ) {
      toast.error("Please fill all required fields", {
        duration: 4000,
        position: "top-right",
        style: {
          background: "#ef4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
        },
        icon: "⚠️",
      });
      return;
    }

    try {
      const res = await api.post("/admin-dashboard/add-staff", {
        name: staffForm.name,
        phone: staffForm.phone,
        email: staffForm.email,
        password: "123123",
        role: staffForm.role === "Manager" ? "employeer" : "employee",
        salary: staffForm.salary,
        joining_date: staffForm.joining_date,
      });

      if (res.data.success) {
        toast.success("Staff added successfully!", {
          duration: 4000,
          position: "top-right",
          style: {
            background: "#10b981",
            color: "#fff",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
          },
          icon: "✓",
        });

        setDrawerOpen(false);
        setStaffForm({
          name: "",
          phone: "",
          email: "",
          role: "Staff",
          salary: "",
          joining_date: "",
        });
        fetchStaff();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to add staff";
      
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-right",
        style: {
          background: "#ef4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
        },
        icon: "✕",
      });
    }
  };

  /* ================= UPDATE EMPLOYEE ================= */
  const updateStaff = async () => {
    try {
      const res = await api.post(`/admin-dashboard/update-staff/${editForm.id}`, {
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
        role: editForm.role,
        status: editForm.status,
      });

      if (res.data.success) {
        toast.success("Staff updated successfully!", {
          duration: 4000,
          position: "top-right",
          style: {
            background: "#10b981",
            color: "#fff",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
          },
          icon: "✓",
        });

        setEditDrawerOpen(false);
        fetchStaff();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to update staff";
      
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-right",
        style: {
          background: "#ef4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
        },
        icon: "✕",
      });
    }
  };

  /* ================= UPDATE SALARY LOGIC ================= */
  const updateSalary = async () => {
    if (!salaryForm.newSalary || !salaryForm.effective_from) {
      toast.error("Please fill all required fields", {
        duration: 4000,
        position: "top-right",
        style: {
          background: "#ef4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
        },
        icon: "⚠️",
      });
      return;
    }

    try {
      const res = await api.post("/admin-dashboard/update-salary", {
        user_id: selectedStaffForSalary.id,
        salary: salaryForm.newSalary,
        effective_from: salaryForm.effective_from,
      });

      if (res.data.success) {
        toast.success("Salary updated successfully!", {
          duration: 4000,
          position: "top-right",
          style: {
            background: "#10b981",
            color: "#fff",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
          },
          icon: "✓",
        });

        setSalaryModalOpen(false);
        fetchStaff();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to update salary";
      
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-right",
        style: {
          background: "#ef4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
        },
        icon: "✕",
      });
    }
  };

  /* ================= FETCH ATTENDANCE ================= */
  useEffect(() => {
    if (!selectedStaff) return;

    const fetchAttendance = async () => {
      try {
        const res = await api.get("/admin-dashboard/attendance", {
          params: {
            user_id: selectedStaff,
            month: `${year}-${String(month + 1).padStart(2, "0")}`,
          },
        });

        setAttendance((prev) => ({
          ...prev,
          [selectedStaff]: res.data.data,
        }));
      } catch (err) {
        console.error("Failed to fetch attendance", err);
      }
    };

    fetchAttendance();
  }, [selectedStaff, currentMonth]);

  /* ================= ATTENDANCE POPUP ================= */
  const openPopup = (day) => {
    const existing = attendance[selectedStaff]?.[formatDate(day)];

    setSelectedDay(day);
    setAttendanceForm(
      existing
        ? {
            status: existing.status,
            inTime: existing.in_time || "",
            outTime: existing.out_time || "",
            otAmount: existing.ot_amount || "", // ✅ ADD THIS
          }
        : { status: "present", inTime: "", outTime: "", otAmount: "" },
    );
    setPopupOpen(true);
  };

  const saveAttendance = async () => {
    console.log("Selected Staff:", selectedStaff);
    console.log("Selected Day:", selectedDay);
    console.log("Formatted Date:", formatDate(selectedDay));
    console.log("Attendance Form:", attendanceForm);

    try {
      const res = await api.post("/admin-dashboard/attendance", {
        user_id: selectedStaff,
        date: formatDate(selectedDay),
        status: attendanceForm.status,
        in_time: attendanceForm.inTime,
        out_time: attendanceForm.outTime,
        ot_amount:
          attendanceForm.status === "ot" ? attendanceForm.otAmount : null,
      });

      if (res.data.success) {
        toast.success("Attendance saved successfully!", {
          duration: 4000,
          position: "top-right",
          style: {
            background: "#10b981",
            color: "#fff",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
          },
          icon: "✓",
        });

        console.log("API Success");

        setAttendance((prev) => ({
          ...prev,
          [selectedStaff]: {
            ...prev[selectedStaff],
            [formatDate(selectedDay)]: {
              status: attendanceForm.status,
              in_time: attendanceForm.inTime,
              out_time: attendanceForm.outTime,
              ot_amount: attendanceForm.otAmount,
            },
          },
        }));

        setPopupOpen(false);
      }
    } catch (err) {
      console.log("API ERROR:", err.response);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to save attendance";
      
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-right",
        style: {
          background: "#ef4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
        },
        icon: "✕",
      });
    }
  };

  const getStatusColor = (obj) => {
    if (!obj) return "";

    switch (obj.status) {
      case "present":
        return "bg-green-100 text-green-700";

      case "absent":
        return "bg-red-100 text-red-700";

      case "leave":
        return "bg-yellow-100 text-yellow-700";

      case "ot":
        return "bg-blue-100 text-blue-700"; // ✅ OT color

      case "c_off":
        return "bg-purple-100 text-purple-700"; // ✅ C-Off color

      default:
        return "";
    }
  };


     if (!can("staff_attendance.view")) {
    return (
      <AccessDenied />
    );
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-4 relative">
      {/* TABS */}
      <div className="flex gap-2 border-b">
        {["attendance", "staff"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab ? "border-b-2 border-black" : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ================= ATTENDANCE ================= */}

    
      

      {
      activeTab === "attendance" && (
        can("staff_attendance.attendance") ? (
          <>
              <div className="flex gap-3 items-center">
                <select
                  value={selectedStaff || ""}
                  onChange={(e) => setSelectedStaff(Number(e.target.value))}
                  className="border rounded px-3 py-2 text-sm"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                  className="px-3 py-1 border rounded"
                >
                  ◀
                </button>

                <span className="font-medium">
                  {currentMonth.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>

                <button
                  onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                  className="px-3 py-1 border rounded"
                >
                  ▶
                </button>
              </div>

              {/* ✅ ADD PAYROLL SUMMARY HERE */}
              <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow-sm text-sm mt-4">
                <div>
                  <p className="text-gray-500">Total Days</p>
                  <p className="font-semibold">{daysInMonth}</p>
                </div>

                <div>
                  <p className="text-gray-500">OT Amount</p>
                  <p className="font-semibold text-blue-600">
                    ₹ {totalOTAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Present</p>
                  <p className="font-semibold text-green-600">{summary.present}</p>
                </div>

                <div>
                  <p className="text-gray-500">Absent</p>
                  <p className="font-semibold text-red-600">{summary.absent}</p>
                </div>

                <div>
                  <p className="text-gray-500">Leave</p>
                  <p className="font-semibold text-yellow-600">{summary.leave}</p>
                </div>

                <div>
                  <p className="text-gray-500">OT</p>
                  <p className="font-semibold text-blue-600">{summary.ot}</p>
                </div>

                <div>
                  <p className="text-gray-500">Monthly Salary</p>
                  <p className="font-semibold">₹ {monthlySalary}</p>
                </div>

                <div>
                  <p className="text-gray-500">Deduction</p>
                  <p className="font-semibold text-red-600">
                    ₹ {deduction.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Final Payable</p>
                  <p className="font-semibold text-green-600">
                    ₹ {finalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="grid grid-cols-7 gap-2 text-center font-medium text-sm mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2 text-sm">
                  {days.map((day, i) =>
                    day ? (
                      <div
                        key={i}
                        onClick={() => openPopup(day)}
                        className={`h-20 border rounded cursor-pointer p-1 hover:bg-gray-50 ${getStatusColor(
                          attendance[selectedStaff]?.[formatDate(day)],
                        )}`}
                      >
                        <div className="text-right font-medium">{day}</div>
                        <div className="mt-2 text-xs space-y-1">
                          {/* Status */}
                          <div className="capitalize font-medium">
                            {attendance[selectedStaff]?.[formatDate(day)]?.status ||
                              ""}
                          </div>

                          {/* Timing */}
                          {attendance[selectedStaff]?.[formatDate(day)]?.in_time &&
                            attendance[selectedStaff]?.[formatDate(day)]
                              ?.out_time && (
                              <div className="text-[11px] text-gray-600">
                                {
                                  attendance[selectedStaff]?.[formatDate(day)]
                                    ?.in_time
                                }{" "}
                                -{" "}
                                {
                                  attendance[selectedStaff]?.[formatDate(day)]
                                    ?.out_time
                                }
                              </div>
                            )}

                          {/* OT Amount */}
                          {attendance[selectedStaff]?.[formatDate(day)]?.status ===
                            "ot" &&
                            attendance[selectedStaff]?.[formatDate(day)]
                              ?.ot_amount && (
                              <div className="text-[11px] text-blue-600 font-semibold">
                                ₹{" "}
                                {
                                  attendance[selectedStaff]?.[formatDate(day)]
                                    ?.ot_amount
                                }
                              </div>
                            )}
                        </div>
                      </div>
                    ) : (
                      <div key={i}></div>
                    ),
                  )}
                </div>
              </div>
            </>
        ) : (
          <div className="flex justify-center items-center h-64">
            <AccessDenied />
          </div>
        )
      )
    }

      {/* ================= STAFF ================= */}
      {activeTab === "staff" && (
        can("staff_attendance.staff") ? (
          <>
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Staff List</h2>



  {
    can("staff_attendance.add") && (

          <button
              onClick={() => setDrawerOpen(true)}
              className="bg-black text-white px-4 py-2 rounded"
            >
              + Add Staff
            </button>

            )
}
  


          </div>

          <div className="bg-white rounded-xl shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Salary</th>
                  <th className="p-3 text-left">Status</th>

                       {
                can("staff_attendance.update_salary") && (
                  <th className="p-3 text-left">Action</th>
                )}
                    {
                can("staff_attendance.edit") && (
                  <th className="p-3 text-left">Edit</th>
                    )
                    } 
                </tr>
              </thead>
              <tbody>
                {staffList.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3">{s.name}</td>
                    <td className="p-3">{s.phone}</td>
                    <td className="p-3">{s.email}</td>
                    <td className="p-3">{s.role}</td>
                    <td className="p-3">₹{s.current_salary?.salary ?? "—"}</td>
                    <td className="p-3">
                      {s.status ? (
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            s.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                            {
                can("staff_attendance.update_salary") && (
                    <td className="p-3">
                      <button
                        onClick={() => openSalaryModal(s)}
                        className="text-sm bg-black text-white px-3 py-1 rounded hover:opacity-90"
                      >
                        Update Salary
                      </button>
                    </td>
                )}


                                {
                    can("staff_attendance.edit") && (
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => openEditDrawer(s)}
                        className="text-sm border px-3 py-1 rounded hover:bg-gray-50"
                      >
                        Edit
                      </button>
                 
                    </td>
                         )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
        ) : (
          <div className="flex justify-center items-center h-64">
            <AccessDenied />
          </div>
        )
      )}


     

      {/* ================= POPUP ================= */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-96 rounded-2xl p-6 space-y-5 shadow-xl">
            {/* HEADER */}
            <div className="text-center">
              <h3 className="text-lg font-semibold">
                {new Date(formatDate(selectedDay)).toLocaleDateString("en-US", {
                  weekday: "long",
                })}
              </h3>
              <p className="text-sm text-gray-500">{formatDate(selectedDay)}</p>
            </div>

            {/* STATUS */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Attendance Status
              </label>
              <select
                value={attendanceForm.status}
                onChange={(e) => {
                  const status = e.target.value;

                  setAttendanceForm({
                    ...attendanceForm,
                    status,
                    inTime:
                      status === "present" || status === "ot"
                        ? attendanceForm.inTime
                        : "",
                    outTime:
                      status === "present" || status === "ot"
                        ? attendanceForm.outTime
                        : "",
                    otAmount: status === "ot" ? attendanceForm.otAmount : "",
                  });
                }}
                className="border px-3 py-2 rounded-lg w-full"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
                <option value="ot">OT</option>
                <option value="c_off">C-Off</option>
              </select>
            </div>

            {/* IN TIME */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                In Time
              </label>
              <input
                type="time"
                value={attendanceForm.inTime}
                //disabled={attendanceForm.status !== "present"}

                disabled={
                  attendanceForm.status !== "present" &&
                  attendanceForm.status !== "ot"
                }
                onChange={(e) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    inTime: e.target.value,
                  })
                }
                className={`border px-3 py-2 rounded-lg w-full ${
                  attendanceForm.status !== "present"
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
              />
            </div>

            {/* OUT TIME */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Out Time
              </label>
              <input
                type="time"
                value={attendanceForm.outTime}
                disabled={
                  attendanceForm.status !== "present" &&
                  attendanceForm.status !== "ot"
                }
                onChange={(e) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    outTime: e.target.value,
                  })
                }
                className={`border px-3 py-2 rounded-lg w-full ${
                  attendanceForm.status !== "present" &&
                  attendanceForm.status !== "ot"
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
              />
            </div>

            {/* ✅ ADD HERE — OT EXTRA AMOUNT */}
            {attendanceForm.status === "ot" && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  OT Extra Amount
                </label>
                <input
                  type="number"
                  placeholder="Enter OT amount"
                  value={attendanceForm.otAmount}
                  onChange={(e) =>
                    setAttendanceForm({
                      ...attendanceForm,
                      otAmount: e.target.value,
                    })
                  }
                  className="border px-3 py-2 rounded-lg w-full"
                />
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex gap-3 pt-3">
              <button
                onClick={saveAttendance}
                className="flex-1 bg-black text-white py-2 rounded-lg font-medium hover:opacity-90"
              >
                Save
              </button>
              <button
                onClick={() => setPopupOpen(false)}
                className="flex-1 border py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DRAWER ================= */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* OVERLAY */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />

          {/* DRAWER */}
          <div className="w-96 bg-white h-full shadow-2xl p-6 space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Staff</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* NAME */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                placeholder="Enter staff name"
                value={staffForm.name}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, name: e.target.value })
                }
                className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            {/* PHONE */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                placeholder="Enter phone number"
                value={staffForm.phone}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, phone: e.target.value })
                }
                className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            {/* EMAIL */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                placeholder="Enter email address"
                value={staffForm.email}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, email: e.target.value })
                }
                className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            {/* ROLE */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <select
                value={staffForm.role}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, role: e.target.value })
                }
                className="border px-3 py-2 rounded-lg w-full bg-white focus:ring-2 focus:ring-black outline-none"
              >
                <option>Staff</option>
                {/* <option>Manager</option> */}
              </select>
            </div>

            {/* SALARY */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Salary
              </label>
              <input
                type="number"
                placeholder="Enter salary"
                value={staffForm.salary}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, salary: e.target.value })
                }
                className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            {/* JOINING DATE */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Joining Date
              </label>
              <input
                type="date"
                value={staffForm.joining_date}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, joining_date: e.target.value })
                }
                className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={addStaff}
                className="flex-1 bg-black text-white py-2 rounded-lg font-medium hover:opacity-90"
              >
                Save
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-1 border py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= SALARY UPDATE ================= */}
      {salaryModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-96 rounded-2xl p-6 space-y-5 shadow-xl">
            <h3 className="text-lg font-semibold text-center">Update Salary</h3>

            <p className="text-sm text-gray-500 text-center">
              {selectedStaffForSalary?.name}
            </p>

            {/* Current Salary */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Current Salary
              </label>
              <input
                type="text"
                value={`₹ ${salaryForm.currentSalary}`}
                disabled
                className="w-full border px-3 py-2 rounded-lg bg-gray-100"
              />
            </div>

            {/* New Salary */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                New Salary
              </label>
              <input
                type="number"
                placeholder="Enter new salary"
                value={salaryForm.newSalary}
                onChange={(e) =>
                  setSalaryForm({
                    ...salaryForm,
                    newSalary: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            {/* Effective From */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Effective From
              </label>
              <input
                type="date"
                value={salaryForm.effective_from}
                onChange={(e) =>
                  setSalaryForm({
                    ...salaryForm,
                    effective_from: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <button
                onClick={updateSalary}
                className="flex-1 bg-black text-white py-2 rounded-lg font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setSalaryModalOpen(false)}
                className="flex-1 border py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT EMPLOYEES ================= */}
      {editDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setEditDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="w-96 bg-white h-full shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Edit Staff</h3>
              <button
                onClick={() => setEditDrawerOpen(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-medium">Role</label>
              <select
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              >
                <option value="employee">Staff</option>
                {/* <option value="employeer">Manager</option> */}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={updateStaff}
                className="flex-1 bg-black text-white py-2 rounded-lg"
              >
                Update
              </button>
              <button
                onClick={() => setEditDrawerOpen(false)}
                className="flex-1 border py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
