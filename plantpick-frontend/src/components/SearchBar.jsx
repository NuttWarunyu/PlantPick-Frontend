import { useState } from "react";
import { uploadImage } from "../api/upload";
import { searchShopeePlants } from "../api/shopee";

const SearchBar = ({ onSearch }) => {
  const [file, setFile] = useState(null);

  const handleFileUpload = async (event) => {
    setFile(event.target.files[0]);
    const result = await uploadImage(event.target.files[0]);

    if (result?.plant_name) {
      onSearch(result.plant_name);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} accept="image/*" />
    </div>
  );
};

export default SearchBar;
