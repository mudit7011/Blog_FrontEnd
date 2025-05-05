import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// import { Select } from "@mui/material";

const MyDropzone = ({ onFilesSelected }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => onFilesSelected(acceptedFiles),
  });

  return (
    <div {...getRootProps()} className="border p-4">
      <input {...getInputProps()} />
      <p>Drag & drop files here, or click to select</p>
    </div>
  );
};

const baseurl = "http://localhost:4000";

function CreatePage() {
  const quillRef = useRef(null);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, false] }],
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"], // remove formatting
    ],
  };

  const quillFormats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "align",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  const [formData, setFormData] = useState({
    title: "",
    images: [],
    banner: [],
    categoryId: [],
    subdescription: "",
    author: "",
    designation: "",
    domain: "",
    time: "",
  });

  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [content, setContent] = useState("<p><br></p>"); 

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${baseurl}/api/v1/auth/categories`);
        setCategories(response.data.categories); // ✅ Corrected here
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setSelected((prevSelected) =>
      checked
        ? [...prevSelected, value]
        : prevSelected.filter((item) => item !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.categoryId) {
      alert("Title and Category are required!");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", content);
    data.append("subdescription", formData.subdescription);
    formData.categoryId.forEach((catId) => data.append("category", catId));
    data.append("domain", selected);
    data.append("author", formData.author);
    data.append("designation", formData.designation);
    data.append("time", formData.time);
    formData.images.forEach((image) => data.append("images", image));
    formData.banner.forEach((image) => data.append("banner", image));

    try {
      const response = await axios.post(
        `${baseurl}/api/v1/auth/createBlog`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data.status) {
        alert("Blog created successfully!");
        setFormData({
          title: "",
          subdescription: "",
          author: "",
          designation: "",
          domain: "",
          time: "",
          images: [],
          banner: [],
          categoryId: [],
        });
        setContent("");
        navigate("/allBlog");
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      alert("Failed to create blog");
    }
  };

  return (
    <section className="App">
      <h2>Create Blog</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Title</p>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          <p>Sub Description</p>
          <input
            type="text"
            name="subdescription"
            value={formData.subdescription}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          <p>Author Name</p>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          <p>Designation</p>
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          <p>Reading Time</p>
          <input
            type="text"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          <p>Content</p>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={quillModules}
            formats={quillFormats}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData("text/plain");
              const quill = quillRef.current.getEditor();
              const range = quill.getSelection();
              quill.insertText(range?.index || 0, text);
            }}
          />
        </label>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "1.25rem",
            marginBottom: "1.5rem",
            backgroundColor: "#f9fafb",
          }}
        >
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Choose Categories
          </p>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <label
                key={cat._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  value={cat._id}
                  onChange={(e) => {
                    const { checked, value } = e.target;
                    setFormData((prevData) => ({
                      ...prevData,
                      categoryId: checked
                        ? [...prevData.categoryId, value]
                        : prevData.categoryId.filter((id) => id !== value),
                    }));
                  }}
                  checked={formData.categoryId.includes(cat._id)}
                  style={{ width: "16px", height: "16px" }}
                />
                <span>{cat.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "1.25rem",
            marginBottom: "1.5rem",
            backgroundColor: "#f9fafb",
          }}
        >
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Choose Domain
          </p>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {["KushelDigi.com", "KushelDigi.us"].map((domain) => (
              <label
                key={domain}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  value={domain}
                  onChange={handleCheckboxChange}
                  checked={selected.includes(domain)}
                  style={{ width: "16px", height: "16px" }}
                />
                <span>{domain}</span>
              </label>
            ))}
          </div>
        </div>

        <label>
          <p>Image</p>
          <MyDropzone
            onFilesSelected={(files) =>
              setFormData((prevData) => ({ ...prevData, images: files }))
            }
          />
        </label>

        <label>
          <p>Banner</p>
          <MyDropzone
            onFilesSelected={(files) =>
              setFormData((prevData) => ({ ...prevData, banner: files }))
            }
          />
        </label>

        <button type="button" onClick={() => setShowPreview(true)}>
          Preview Blog
        </button>

        {showPreview && (
          <div
            className="ql-editor"
            style={{
              padding: "1rem",
              border: "1px solid #ccc",
              marginBottom: "1rem",
            }}
          >
            <h2>{formData.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: content }} />
            <button type="button" onClick={() => setShowPreview(false)}>
              Close Preview
            </button>
          </div>
        )}

        <button type="submit">Create Blog</button>
        <button type="button" onClick={() => navigate("/allBlog")}>
          Go to All Blogs
        </button>
        <button type="button" onClick={() => navigate("/category")}>
          Create Category
        </button>
        <button type="button" onClick={() => navigate("/allCategory")}>
          All Categories
        </button>
      </form>
    </section>
  );
}

export default CreatePage;
