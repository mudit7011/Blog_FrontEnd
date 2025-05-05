import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./page.css";
import JoditEditor from "jodit-react";



// const baseurl = `https://blog-back-7jx6.onrender.com`;
const baseurl = `http://localhost:4000`
// const baseurl = `https://backblog.kusheldigi.com`
function EditPage() {

  const { blogId } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    subdescription: "",
    images: [],
    banner: [],
    category: "",
    designation: "",
    domain: "",
    author: "",
  });
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const editor = useRef(null);

  const [content, setContent] = useState("");
  const [selected, setSelected] = useState([])

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      const updated = [...selected, value];
      setSelected(updated);
      console.log("Selected Domains:", updated);
    } else {
      const updated = selected.filter((item) => item !== value);
      setSelected(updated);
      console.log("Selected Domains:", updated);
    }
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`${baseurl}/api/v1/auth/getBlog/${blogId}`);
        const { title, subdescription, images, category, description, banner, domain, author, designation } = response.data.blog;
        setContent(description);
        setFormData({ title, subdescription, images, category: category._id, banner, domain, author, designation });
        if (Array.isArray(domain)) {
          setSelected(domain);
          console.log("Initial selected domains:", domain);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${baseurl}/api/v1/auth/categories`);
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchBlog();
    fetchCategories();
  }, [blogId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: files });
  };
  const handleFileChange2 = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, banner: files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selected.length === 0) {
      alert("Domain is required")
      return
    }
    const data = new FormData();
    data.append("title", formData.title);
    data.append("subdescription", formData.subdescription);
    data.append("description", content);
    data.append("categoryId", formData.category);
    data.append("designation", formData.designation);
    data.append("domain", selected);
    data.append("author", formData.author)
    formData.images.forEach((image) => data.append("images", image));
    formData.banner.forEach((image) => data.append("banner", image));

    try {
      const response = await axios.post(`${baseurl}/api/v1/auth/editBlog/${blogId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status) {
        alert("Blog updated successfully!");
        navigate("/allBlog");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      alert("Failed to update blog");
    }
  };

  return (
    <section className="App">
      <h2>EDIT BLOG</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Title</p>
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
        </label>

        <label>
          <p>subdescription</p>
          <input type="text" name="subdescription" value={formData.subdescription} onChange={handleInputChange} required />
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
          <p>Description</p>
          <JoditEditor
            ref={editor}
            value={content}
            tabIndex={1}
            onBlur={(newContent) => setContent(newContent)}
            onChange={(newContent) => {
              setContent(newContent);
            }}

          />
        </label>

        <label>
          <p>Desigination</p>
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleInputChange}
            required
          />
        </label>


        <label>
          <p>Category</p>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.title}
              </option>
            ))}
          </select>
        </label>

        <label>
          <p>Domain</p>
          <div>
            <label required>
              <input
                type="checkbox"
                value="KushelDigi.com"
                onChange={handleCheckboxChange}
                checked={selected.includes("KushelDigi.com")}
              />
              KushelDigi.com
            </label>
            <label>
              <input
                type="checkbox"
                value="KushelDigi.us"
                onChange={handleCheckboxChange}
                checked={selected.includes("KushelDigi.us")}
              />
              KushelDigi.us
            </label>
          </div>
        </label>


        <label>
          <p>Image</p>
          <input type="file" multiple onChange={handleFileChange} />
        </label>
        <label>
          <p>Banner</p>
          <input type="file" multiple onChange={handleFileChange2} />
        </label>

        <button className="creabun" type="submit">Update Blog</button>
      </form>
    </section>
  );
}

export default EditPage;
