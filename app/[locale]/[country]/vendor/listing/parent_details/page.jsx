"use client";

import { useState } from "react";
import { Pencil, Save, Upload, Link2 ,ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ParentPagePremium() {
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("Beautiful venue for weddings");
  const [description, setDescription] = useState("Write about your venue...");
  const [videoFile, setVideoFile] = useState(null);
  const [youtubeLink, setYoutubeLink] = useState("");

  const handleSave = () => {
    setEditMode(false);
    toast.success("Updated successfully 🚀");
  };

  const router = useRouter();

  return (
    <div className="">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition"
    >
      <ArrowLeft size={18} />
      Back
    </button>

    <h1 className="text-2xl font-semibold">
       Parent Page Management
    </h1>
  </div>
        

        <button
          onClick={() => (editMode ? handleSave() : setEditMode(true))}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          {editMode ? <Save size={18} /> : <Pencil size={18} />}
          {editMode ? "Save Changes" : "Edit"}
        </button>
      </div>

      {/* About Section */}
      <div className="bg-white/60 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-md mb-6 transition hover:shadow-xl">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          About Us
        </h2>

        <input
          disabled={!editMode}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-3 px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-400 outline-none disabled:bg-gray-100"
          placeholder="Title"
        />

        <textarea
          disabled={!editMode}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border h-28 resize-none focus:ring-2 focus:ring-indigo-400 outline-none disabled:bg-gray-100"
        />
      </div>

      {/* Video Section */}
      <div className="bg-white/60 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-md mb-6 hover:shadow-xl transition">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Video Gallery
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Upload Video */}
          <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-400 transition">
            <Upload className="mb-2 text-gray-500" />
            <p className="text-sm text-gray-500 mb-2">
              Upload Video
            </p>

            <input
              type="file"
              disabled={!editMode}
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="text-sm"
            />

            {videoFile && (
              <p className="text-xs mt-2 text-green-600">
                {videoFile.name}
              </p>
            )}
          </div>

          {/* YouTube Link */}
          <div className="flex flex-col justify-center">
            <label className="text-sm mb-2 text-gray-600 flex items-center gap-2">
              <Link2 size={16} /> YouTube Link
            </label>
            <input
              disabled={!editMode}
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              placeholder="Paste YouTube URL"
              className="px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-400 outline-none disabled:bg-gray-100"
            />

            {youtubeLink && (
              <iframe
                className="mt-4 rounded-xl w-full h-40"
                src={youtubeLink.replace("watch?v=", "embed/")}
                allowFullScreen
              ></iframe>
            )}
          </div>
        </div>
      </div>

      {/* Smooth Cards Example */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Venues Published", value: 3 },
          { label: "Events Hosted", value: 500 },
          { label: "Happy Clients", value: 350 },
          { label: "Venue Capacity", value: 2000 },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <p className="text-gray-500 text-sm">{item.label}</p>
            <h3 className="text-xl font-bold text-indigo-600 mt-2">
              {item.value}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}