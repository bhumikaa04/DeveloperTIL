import { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';

const API_URL = 'http://localhost:5000';

function Main({ currentUser, onLogout }) {
  const [notes, setNotes] = useState([]); 
  const [title, setTitle] = useState(''); 
  const [content, setContent] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [message, setMessage] = useState({ text: '', type: '' }); 

  //Helper function to attach JWT bearer Header
  const getAuthHeader = () => {
    const token = localStorage.getItem('token'); 
    return {
        headers : {
            Authorization : `Bearer ${token}`, 
        }, 
    }; 
  }; 

  // Helper for status messages
  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // Automatically fetch notes
  useEffect(()=> {
    if(currentUser?.userId) fetchNotes(); 
  }, [currentUser]); 

  // Fetch all notes for user
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/notes`, {
        params: { userId: currentUser._id},
        ...getAuthHeader(),    
      }); 

      setNotes(response.data.notes || []); 
      showToast("Notes retrieved successfully!");
    } catch (err) {
      console.error("Error while fetching notes: ", err); 
      showToast(err.response?.data?.message || "Failed to fetch notes", "error");
    } finally {
      setLoading(false); 
    }
  };

  // Create a new note
  const handleCreateNote = async (e) => {
    e.preventDefault(); 

    if (!title.trim() || !content.trim()) {
      showToast("Title and Content, are required", "error"); 
      return; 
    }

    try {
      await axios.post(`${API_URL}/notes`, {
        title, 
        content, 
        userId: currentUser._id, 
        categories: ['General']
      }, 
      getAuthHeader()
    ); 

      showToast("Note created successfully!"); 
      setTitle(''); 
      setContent(''); 

      fetchNotes(); 
    } catch (err) {
      console.error("Error creating note: ", err); 
      showToast("Failed to create note", "error");
    }
  }; 

  // Delete a note
  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(`${API_URL}/notes/${noteId}`, getAuthHeader()); 

      showToast("Note deleted"); 
      setNotes(notes.filter(note => note.noteId !== noteId)); 
    } catch (err) {
      console.error("Error deleting note: ", err); 
      showToast("Failed to delete note", "error");
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER & USER PROFILE BAR */}
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Developers <span className="text-indigo-600">TIL</span>
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Welcome back, <span className="font-semibold text-slate-800">{currentUser?.name}</span> (@{currentUser?.username})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 uppercase tracking-wider">
              Role: {currentUser?.role}
            </span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium rounded-lg text-xs transition-all"
            >
              Log Out
            </button>
          </div>
        </header>

        {/* TOAST NOTIFICATION */}
        {message.text && (
          <div
            className={`p-4 rounded-xl shadow-md text-sm font-medium transition-all duration-300 flex items-center justify-between ${
              message.type === 'error'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <span>{message.text}</span>
            <button
              onClick={() => setMessage({ text: '', type: '' })}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* CREATE NOTE FORM */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>✨</span> Create New Note
          </h2>
          <form onSubmit={handleCreateNote} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Note Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm"
              />
            </div>
            <div>
              <textarea
                placeholder="Write your note content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm resize-y"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-medium rounded-lg text-sm transition-all shadow-sm"
            >
              Add Note
            </button>
          </form>
        </section>

        {/* DISPLAY NOTES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-slate-900">Your Saved Notes</h2>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {notes.length} Total
            </span>
          </div>

          {loading && (
            <div className="text-center py-12 text-slate-400 text-sm">
              Loading notes from database...
            </div>
          )}

          {!loading && notes.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
              <p className="text-slate-400 text-sm">No notes found for your account.</p>
              <p className="text-slate-400 text-xs mt-1">Start by creating your first note above!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div
                key={note.noteId}
                className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 line-clamp-1">
                      {note.title}
                    </h3>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
                      v{note.version || 1}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm whitespace-pre-line mb-4">
                    {note.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px] truncate max-w-[150px]">
                    {note.noteId}
                  </span>
                  <button
                    onClick={() => handleDeleteNote(note.noteId)}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded transition-all font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Main;