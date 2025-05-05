import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Category() {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  // const [refreshFlag,setRefreshFlag] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('https://backblog.kusheldigi.com/api/v1/auth/categories');
      setBlogs(response?.data?.categories);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const deleteBlog = async (categoryId) => {
    try {
      const response = await axios.delete(`https://backblog.kusheldigi.com/api/v1/auth/categories/${categoryId}`);
     
        alert("Blog deleted successfully");
        // setBlogs(blogs.filter((blog) => blog._id !== categoryId));
        fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Failed to delete blog");
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>All Category</h2>
      <div className="blogs-container">
        {blogs?.map((blog) => (
          <div key={blog._id} className="blog-box">
            <h3 className="blog-title">{blog?.title}</h3>
           
            <div className="button-container">
              <button onClick={() => deleteBlog(blog._id)}>Delete</button>
              <button onClick={() => navigate(`/editCatgory/${blog?._id}`)}>Edit</button> 
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Category;
