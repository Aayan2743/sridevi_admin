import { useEffect, useState } from "react";
import api from "../api/axios_whats";
import { useAuth } from "../auth/AuthContext";
import AccessDenied from "./components/AccessDenied";

export default function WhatsappChat() {

    const { can,permissions } = useAuth();
  console.log("User Permissions dfdfdfdf:",can);
  console.log("User Permissions array:",permissions);


    const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);


  const formatNumber = (num) => {
  if (!num) return "";

  // remove spaces, + etc
  num = num.replace(/\D/g, "");

  // remove country code (91)
  if (num.length > 10) {
    return num.slice(-10);
  }

  return num;
};
  // ✅ Fetch Messages

  const TOKEN = "ReFYASTZJlZ1Ga051lyKmCVg4EXxoGNfeEz";
//   const fetchMessages = async () => {
//   try {
//     const res = await api.get("/message/receivedMessages", {
//       headers: {
//         Authorization: `Bearer ${TOKEN}`,
//       },
//     });

//     console.log("API SUCCESS:", res.data);

//     const messages = res?.data?.data?.data || [];
//     setMessages(messages);

//   } catch (err) {
//     console.error("API ERROR:", err.response?.data || err.message);
//   }
// };


const sendMessage = async () => {
  if (!text || !selectedUser) return;

  try {
    const formData = new FormData();

    formData.append("phonenumber", selectedUser);
    formData.append("text", text);

    // optional
    // formData.append("url", "https://...");

    await api.post("/sendMessage", formData, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "multipart/form-data",
      },
    });

    // ✅ instant UI update
    const newMsg = {
      id: Date.now(),
      user: selectedUser,
      text: text,
      createdAt: new Date().toISOString(),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);

    setText("");

  } catch (err) {
    console.error("SEND ERROR:", err.response?.data || err.message);
  }
};


const fetchMessages = async () => {
  try {
    const [receivedRes, sentRes] = await Promise.all([
      api.get("/message/receivedMessages", {
        params: { page: 1 },
        headers: { Authorization:`Bearer ${TOKEN}`},
      }),
      api.get("/message/sentMessages", {
        params: { page: 1 },
        headers: { Authorization:`Bearer ${TOKEN}` },
      }),
    ]);

    const received = receivedRes?.data?.data?.data || [];
    const sent = sentRes?.data?.data?.data || [];

    // ✅ normalize received
    const formattedReceived = received.map((msg) => ({
      id: msg.id,
     user: formatNumber(msg.from),  
      text: msg.chat,
      type: msg.type,
      url: msg.url,
      createdAt: msg.createdAt,
      isMe: false,
    }));

    // ✅ normalize sent
    const formattedSent = sent.map((msg) => ({
      id: msg.id,
       user: formatNumber(msg.phonenumber),
      text: msg.text,
      type: msg.type,
      url: msg.url,
      createdAt: msg.createdAt,
      isMe: true,
    }));

    // ✅ merge + sort
    const allMessages = [...formattedReceived, ...formattedSent].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    setMessages(allMessages);

  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

  useEffect(() => {
    fetchMessages();
  }, []);

  // ✅ Group by user (from number)
//   const users = Object.values(
//     messages.reduce((acc, msg) => {
//       if (!acc[msg.from]) {
//         acc[msg.from] = {
//           number: msg.from,
//           lastMessage: msg.chat,
//           time: msg.createdAt,
//         };
//       }
//       return acc;
//     }, {})
//   );

const users = Object.values(
  messages.reduce((acc, msg) => {
    if (
      !acc[msg.user] ||
      new Date(msg.createdAt) > new Date(acc[msg.user].time)
    ) {
      acc[msg.user] = {
        number: msg.user,
        lastMessage: msg.text,
        time: msg.createdAt,
      };
    }
    return acc;
  }, {})
).sort((a, b) => new Date(b.time) - new Date(a.time));

  // ✅ Filter messages for selected user
//   const chatMessages = messages.filter(
//     (m) => m.from === selectedUser
//   );


const chatMessages = messages.filter(
  (m) => m.user === selectedUser
);


   if (!can("whatsapp_agent.view")) {
    return (
      
        //  <SettingsLayout>
      <>
        <AccessDenied />
      </>
      // </SettingsLayout>
    );
  }

  return (
    <div className="flex h-[85vh] bg-[#f0f2f5] rounded-xl overflow-hidden">

      {/* LEFT SIDEBAR */}
      <div className="w-[320px] bg-white border-r overflow-y-auto">

        <div className="p-4 font-semibold border-b">Chats</div>

        {users.map((user) => (
          <div
            key={user.number}
            onClick={() => setSelectedUser(user.number)}
            className={`p-3 cursor-pointer border-b hover:bg-gray-100 ${
              selectedUser === user.number ? "bg-gray-100" : ""
            }`}
          >
            <div className="font-medium">{user.number}</div>
            <div className="text-xs text-gray-500 truncate">
              {user.lastMessage}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT CHAT AREA */}
        {/* RIGHT CHAT AREA */}
<div className="flex-1 flex flex-col">

  {/* HEADER */}
  <div className="p-4 border-b bg-white">
    {selectedUser || "Select a chat"}
  </div>

  {/* MESSAGES */}
  <div className="flex-1 p-5 overflow-y-auto bg-[#efeae2]">
    {chatMessages.map((msg) => (
      <div
        key={msg.id}
        className={`mb-2 ${
          msg.isMe ? "text-right" : "text-left"
        }`}
      >
        <div
          className={`inline-block px-3 py-2 rounded-lg text-sm ${
            msg.isMe
              ? "bg-[#d9fdd3]"  // sent
              : "bg-white"      // received
          }`}
        >
          {msg.text}
        </div>

        <div className="text-[10px] text-gray-500 mt-1">
          {msg.createdAt}
        </div>
      </div>
    ))}
  </div>

  {/* INPUT */}
  <div className="p-3 bg-white border-t flex">
   <input
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="Type a message"
  className="flex-1 px-3 py-2 rounded-full bg-gray-100 text-sm"
/>

<button
  onClick={sendMessage}
  className="ml-2 bg-green-500 text-white px-4 rounded-full"
>
  Send
</button>
  </div>

</div>
    </div>
  );
}