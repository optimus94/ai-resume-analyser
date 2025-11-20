import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
  const { auth, isLoading, error, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);

  // Load all files
  const loadFiles = async () => {
    const files = (await fs.readDir("./")) as FSItem[];
    setFiles(files);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading]);

  // Delete all files
  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete ALL files? This action cannot be undone."
    );
    if (!confirmed) return;

    for (const file of files) {
      await fs.delete(file.path);
    }
    await kv.flush();
    loadFiles();
  };

  // Delete a single file
  const handleDeleteFile = async (filePath: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this file?"
    );
    if (!confirmed) return;

    await fs.delete(filePath);
    loadFiles();
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="mb-4">Authenticated as: {auth.user?.username}</div>

      <div className="mb-2 font-semibold">Existing files:</div>
      <div className="flex flex-col gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex flex-row justify-between items-center gap-4"
          >
            <p>{file.name}</p>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition"
              onClick={() => handleDeleteFile(file.path)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          onClick={handleDeleteAll}
        >
          Wipe App Data
        </button>
      </div>
    </div>
  );
};

export default WipeApp;
