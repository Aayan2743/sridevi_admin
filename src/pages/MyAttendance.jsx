import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

export default function MyAttendance() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [attendance, setAttendance] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
      "0"
    )}`;

  /* ================= FETCH MY ATTENDANCE ================= */
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get("/admin-dashboard/attendance", {
          params: {
            user_id: userId,
            month: `${year}-${String(month + 1).padStart(2, "0")}`,
          },
        });

        setAttendance(res.data.data);
      } catch (err) {
        console.error("Failed to fetch attendance", err);
      }
    };

    if (userId) {
      fetchAttendance();
    }
  }, [currentMonth]);

  /* ================= SUMMARY ================= */
  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let ot = 0;
    let otAmount = 0;

    Object.values(attendance).forEach((record) => {
      if (record.status === "present") present++;
      if (record.status === "absent") absent++;
      if (record.status === "leave") leave++;
      if (record.status === "ot") {
        ot++;
        otAmount += Number(record.ot_amount) || 0;
      }
    });

    return { present, absent, leave, ot, otAmount };
  }, [attendance]);

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
        return "bg-blue-100 text-blue-700";
      case "c_off":
        return "bg-purple-100 text-purple-700";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">My Attendance</h2>

        <div className="flex gap-3 items-center">
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
      </div>

      {/* SUMMARY BOX */}
      <div className="grid grid-cols-5 gap-4 bg-white p-4 rounded-xl shadow-sm text-sm">
        <div>
          <p className="text-gray-500">Total Days</p>
          <p className="font-semibold">{daysInMonth}</p>
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
          <p className="text-gray-500">OT Amount</p>
          <p className="font-semibold text-blue-600">
            ₹ {summary.otAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* CALENDAR */}
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
                className={`h-20 border rounded p-1 ${getStatusColor(
                  attendance?.[formatDate(day)]
                )}`}
              >
                <div className="text-right font-medium">{day}</div>

                <div className="mt-2 text-xs space-y-1">
                  <div className="capitalize font-medium">
                    {attendance?.[formatDate(day)]?.status || ""}
                  </div>

                  {attendance?.[formatDate(day)]?.in_time &&
                    attendance?.[formatDate(day)]?.out_time && (
                      <div className="text-[11px] text-gray-600">
                        {attendance?.[formatDate(day)]?.in_time} -{" "}
                        {attendance?.[formatDate(day)]?.out_time}
                      </div>
                    )}

                  {attendance?.[formatDate(day)]?.status === "ot" &&
                    attendance?.[formatDate(day)]?.ot_amount && (
                      <div className="text-[11px] text-blue-600 font-semibold">
                        ₹ {attendance?.[formatDate(day)]?.ot_amount}
                      </div>
                    )}
                </div>
              </div>
            ) : (
              <div key={i}></div>
            )
          )}
        </div>
      </div>
    </div>
  );
}