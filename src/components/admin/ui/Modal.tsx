import React from "react";

interface ModalProps {
  title: string;
  isOpen?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string;
  size?: "small" | "medium" | "large";
}

const Modal: React.FC<ModalProps> = ({
  title,
  isOpen = true,
  onClose,
  children,
  widthClass,
  size,
}) => {
  // Determine width class from size prop or use provided widthClass
  const getWidthClass = () => {
    if (widthClass) return widthClass;
    if (size === "large") return "max-w-4xl";
    if (size === "medium") return "max-w-2xl";
    return "max-w-xl";
  };

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg w-full ${getWidthClass()} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
