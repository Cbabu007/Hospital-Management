import React, { useState } from "react";
import "./ImagePreview.css";

// Props: src (image url), alt, title, size, className, style
const ImagePreview = ({ src, alt = "", title = "", size = 80, className = "", style = {} }) => {
  const [open, setOpen] = useState(false);

  if (!src) return <span>No Image</span>;

  return (
    <>
      <img
        src={src}
        alt={alt}
        title={title}
        className={`image-preview-thumb ${className}`}
        style={{ cursor: "zoom-in", width: size, height: size, objectFit: "cover", ...style }}
        onClick={() => setOpen(true)}
      />
      {open && (
        <div className="image-preview-modal" onClick={() => setOpen(false)}>
          <img src={src} alt={alt} className="image-preview-zoom" />
          <span className="image-preview-close">&times;</span>
        </div>
      )}
    </>
  );
};

export default ImagePreview;

