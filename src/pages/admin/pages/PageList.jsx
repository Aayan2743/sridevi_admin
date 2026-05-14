

// export default PageList;


import { useEffect, useState } from "react";
import api from "../../../api/axios";
import Pagination from "../../components/Pagination";
import SettingsLayout from "../../settings/SettingsLayout";
import RichTextEditorNew from "../../components/RichTextEditorNew";
import { toast } from "react-hot-toast";

const PageList = () => {
  const [pages, setPages] = useState([]);
  const [sections, setSections] = useState([]);
  const [pagination, setPagination] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);

  const [formData, setFormData] = useState({
    section_id: "",
    title: "",
    header: "",
    sub_header: "",
    type: "content",
    external_url: "",
    contents: "",
    status: 1,
     header: "",
  sub_header: "",

    // event
    name: "",
    short_description: "",
    description: "",
    start_date: "",
    end_date: "",
    image: null,

    // blog
    blog_title: "",
    blog_short_description: "",
    blog_description: "",
    publish_date: "",
    blog_image: null,

    // faq
    faqs: []
  });

  /* ================= FETCH ================= */

  const fetchPages = async (page = 1) => {
    try {
      const res = await api.get(`/admin-dashboard/pages?page=${page}`);
      setPages(res.data.data.data);
      setPagination(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load pages");
    }
  };

  const fetchSections = async () => {
    const res = await api.get(`/admin-dashboard/get-footer-sections`);
    setSections(res.data.data || res.data);
  };

  useEffect(() => {
    fetchPages();
    fetchSections();
  }, []);

  /* ================= DELETE ================= */

  const deletePage = async (id) => {
    if (!window.confirm("Delete this page?")) return;

    await api.delete(`/admin-dashboard/pages/${id}`);
    toast.success("Deleted");
    fetchPages();
  };

  /* ================= OPEN DRAWER ================= */

  const openDrawer = (page = null) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        ...formData,
        section_id: page.section_id,
        title: page.title,
        header: page.header || "",
        sub_header: page.sub_header || "",
        type: page.type,
        contents: page.content || "",
        status: page.status
      });
    } else {
      setEditingPage(null);
      setFormData({
        section_id: "",
        title: "",
        header: "",
        sub_header: "",
        type: "content",
        external_url: "",
        contents: "",
        status: 1,
        faqs: []
      });
    }

    setDrawerOpen(true);
  };

  /* ================= FAQ ADD ================= */

  const addFaq = () => {
    setFormData({
      ...formData,
      faqs: [...formData.faqs, { question: "", answer: "" }]
    });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "faqs") {
        formData.faqs.forEach((faq, index) => {
          form.append(`faqs[${index}][question]`, faq.question);
          form.append(`faqs[${index}][answer]`, faq.answer);
        });
      } else {
        form.append(key, formData[key] ?? "");
      }
    });

    try {
      if (editingPage) {
        await api.post(
          `/admin-dashboard/pages/${editingPage.id}`,
          form
        );
        toast.success("Updated successfully");
      } else {
        await api.post(`/admin-dashboard/pages`, form);
        toast.success("Created successfully");
      }

      setDrawerOpen(false);
      fetchPages();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <SettingsLayout>
      <div className="p-6">
        <div className="flex justify-between mb-5">
          <h2 className="text-2xl font-bold">Pages</h2>
          <button
            onClick={() => openDrawer()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Page
          </button>
        </div>

        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-t">
                  <td className="p-3">{page.title}</td>
                  <td>{page.type}</td>
                  <td>{page.status ? "Active" : "Inactive"}</td>
                  <td>
                    <button onClick={() => openDrawer(page)}>Edit</button>
                    <button onClick={() => deletePage(page.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination pagination={pagination} onPageChange={fetchPages} />
        </div>
      </div>

      {/* ================= DRAWER ================= */}

      <div
        className={`fixed top-0 right-0 h-full w-[520px] bg-white shadow-xl transform transition-transform duration-300 z-50 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">
            {editingPage ? "Edit Page" : "Add Page"}
          </h3>
          <button onClick={() => setDrawerOpen(false)}>✕</button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto h-full"
        >
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          >
            <option value="content">Content</option>
            <option value="external">External</option>
            <option value="event">Event</option>
            <option value="blog">Blog</option>
            <option value="faq">FAQ</option>
          </select>


          <div>
                <label className="block mb-1 font-medium">
                  Section <span className="text-red-500">*</span>
                </label>

                <select
                  value={formData.section_id}
                  onChange={(e) =>
                    setFormData({ ...formData, section_id: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                  required
                >
                  <option value="">Select Section</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>

          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />

          {/* Header */}
            <div>
              <label className="block mb-1 font-medium">
                Header <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.header}
                onChange={(e) =>
                  setFormData({ ...formData, header: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>

            {/* Sub Header */}
            <div>
              <label className="block mb-1 font-medium">
                Sub Header <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.sub_header}
                onChange={(e) =>
                  setFormData({ ...formData, sub_header: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>

          {formData.type === "external" && (
            <input
              type="text"
              placeholder="External URL"
              className="w-full border px-3 py-2 rounded"
              onChange={(e) =>
                setFormData({ ...formData, external_url: e.target.value })
              }
            />
          )}

          {formData.type === "content" && (
            <>
            <RichTextEditorNew
              value={formData.contents}
              onChange={(html) =>
                setFormData({ ...formData, contents: html })
              }
            />

                      <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormData({
                ...formData,
                contents_images: e.target.files[0]
              })
            }
          />
          </>
            
          )}

          {formData.type === "faq" && (
            <>
              {formData.faqs.map((faq, index) => (
                <div key={index} className="border p-3">
                  <input
                    type="text"
                    placeholder="Question"
                    className="w-full border px-2 py-1 mb-2"
                    value={faq.question}
                    onChange={(e) => {
                      const updated = [...formData.faqs];
                      updated[index].question = e.target.value;
                      setFormData({ ...formData, faqs: updated });
                    }}
                  />
                  <textarea
                    placeholder="Answer"
                    className="w-full border px-2 py-1"
                    value={faq.answer}
                    onChange={(e) => {
                      const updated = [...formData.faqs];
                      updated[index].answer = e.target.value;
                      setFormData({ ...formData, faqs: updated });
                    }}
                  />
                </div>
              ))}

              <button type="button" onClick={addFaq}>
                + Add FAQ
              </button>
            </>
          )}

          {formData.type === "event" && (
  <>
    {/* Event Name */}
    <input
      type="text"
      placeholder="Event Name"
      className="w-full border px-3 py-2 rounded"
      value={formData.name}
      onChange={(e) =>
        setFormData({ ...formData, name: e.target.value })
      }
    />

    {/* Short Description */}
    <input
      type="text"
      placeholder="Short Description"
      className="w-full border px-3 py-2 rounded"
      value={formData.short_description}
      onChange={(e) =>
        setFormData({ ...formData, short_description: e.target.value })
      }
    />

    {/* Full Description */}
    <textarea
      placeholder="Description"
      className="w-full border px-3 py-2 rounded"
      value={formData.description}
      onChange={(e) =>
        setFormData({ ...formData, description: e.target.value })
      }
    />

    {/* Start Date */}
    <input
      type="date"
      className="w-full border px-3 py-2 rounded"
      value={formData.start_date}
      onChange={(e) =>
        setFormData({ ...formData, start_date: e.target.value })
      }
    />

    {/* End Date */}
    <input
      type="date"
      className="w-full border px-3 py-2 rounded"
      value={formData.end_date}
      onChange={(e) =>
        setFormData({ ...formData, end_date: e.target.value })
      }
    />

    {/* Event Image */}
    <input
      type="file"
      accept="image/*"
      className="w-full border px-3 py-2 rounded"
      onChange={(e) =>
        setFormData({
          ...formData,
          image: e.target.files[0]
        })
      }
    />
  </>
        )}

        {formData.type === "blog" && (
  <>
    {/* Blog Title */}
    <input
      type="text"
      placeholder="Blog Title"
      className="w-full border px-3 py-2 rounded"
      value={formData.blog_title}
      onChange={(e) =>
        setFormData({ ...formData, blog_title: e.target.value })
      }
    />

    {/* Short Description */}
    <input
      type="text"
      placeholder="Short Description"
      className="w-full border px-3 py-2 rounded"
      value={formData.blog_short_description}
      onChange={(e) =>
        setFormData({
          ...formData,
          blog_short_description: e.target.value
        })
      }
    />

    {/* Blog Description */}
    <RichTextEditorNew
      value={formData.blog_description}
      onChange={(html) =>
        setFormData({
          ...formData,
          blog_description: html
        })
      }
    />

    {/* Publish Date */}
    <input
      type="date"
      className="w-full border px-3 py-2 rounded"
      value={formData.publish_date}
      onChange={(e) =>
        setFormData({
          ...formData,
          publish_date: e.target.value
        })
      }
    />

    {/* Blog Image */}
    <input
      type="file"
      accept="image/*"
      className="w-full border px-3 py-2 rounded"
      onChange={(e) =>
        setFormData({
          ...formData,
          blog_image: e.target.files[0]
        })
      }
    />
  </>
)}

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            {editingPage ? "Update" : "Save"}
          </button>
        </form>
      </div>
    </SettingsLayout>
  );
};

export default PageList;