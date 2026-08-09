import { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import Heatmap from '../components/Heatmap';

const API_URL = 'http://localhost:5000'; 

function Main({ currentUser, onLogout }) {
  const [notes, setNotes] = useState([]); 
  const [title, setTitle] = useState(''); 
  const [content, setContent] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedDate, setSelectedDate] = useState(null); // ← ADD THIS

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

  // Fetch all notes for user - UPDATED to handle date filter
  const fetchNotes = async (dateFilter = null) => {
    setLoading(true);
    try {
      const params = { userId: currentUser._id };
      
      // Add date filter if provided
      if (dateFilter) {
        params.date = dateFilter;
      }
      
      const response = await axios.get(`${API_URL}/notes`, {
        params: params,
        ...getAuthHeader(),    
      }); 

      setNotes(response.data.notes || []); 
      
      if (dateFilter) {
        showToast(`Showing notes from ${dateFilter}`, 'success');
      } else {
        showToast("Notes retrieved successfully!");
      }
    } catch (err) {
      console.error("Error while fetching notes: ", err); 
      showToast(err.response?.data?.message || "Failed to fetch notes", "error");
    } finally {
      setLoading(false); 
    }
  };

  // ✅ ADD THIS: Handle day click from heatmap
  const handleHeatmapDayClick = (date) => {
    setSelectedDate(date);
    fetchNotes(date);
  };

  // ✅ ADD THIS: Clear date filter
  const clearDateFilter = () => {
    setSelectedDate(null);
    fetchNotes();
  };

  // Create a new note - UPDATED to respect date filter
  const handleCreateNote = async (e) => {
    e.preventDefault(); 

    if (!title.trim() || !content.trim()) {
      showToast("Title and Content are required", "error"); 
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

      // Refresh notes with current filter
      fetchNotes(selectedDate); 
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
  <div className="min-h-screen bg-slate-50">

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="relative overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm">

        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-100/60 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-64 h-64 bg-violet-100/40 rounded-full blur-3xl" />
        </div>

        <div className="relative p-6 sm:p-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            {/* Brand / Welcome */}

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white text-xl font-bold">
                  TIL
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    Developers
                    <span className="text-indigo-600">
                      {" "}TIL
                    </span>
                  </h1>

                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                    Beta
                  </span>

                </div>

                <p className="text-sm text-slate-500 mt-1">
                  Keep learning. Keep building. Keep shipping.
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Welcome back,{" "}
                  <span className="font-semibold text-slate-700">
                    {currentUser?.name}
                  </span>
                  {" "}@{currentUser?.username}
                </p>
              </div>

            </div>


            {/* User Controls */}

            <div className="flex items-center gap-3">

              <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">

                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-700 text-xs font-bold">
                    {currentUser?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {currentUser?.username}
                  </p>

                  <p className="text-[10px] text-slate-400 capitalize">
                    {currentUser?.role}
                  </p>
                </div>

              </div>

              <button
                onClick={onLogout}
                className="group px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-all flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>

                Log Out
              </button>

            </div>

          </div>

        </div>
      </header>


      {/* =====================================================
          TOAST
      ====================================================== */}

      {message.text && (
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm text-sm font-medium flex items-center justify-between ${
            message.type === "error"
              ? "bg-rose-50 text-rose-700 border border-rose-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >

          <div className="flex items-center gap-2">

            <span>
              {message.type === "error" ? "⚠️" : "✓"}
            </span>

            <span>
              {message.text}
            </span>

          </div>

          <button
            onClick={() =>
              setMessage({
                text: "",
                type: ""
              })
            }
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            ✕
          </button>

        </div>
      )}


      {/* =====================================================
          QUICK STATS
      ====================================================== */}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Total Notes */}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Notes
              </p>

              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {notes.length}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {selectedDate
                  ? "Notes for selected day"
                  : "Across your workspace"}
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                />
              </svg>
            </div>

          </div>

        </div>


        {/* Active Days */}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Activity
              </p>

              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {notes.length > 0 ? "Active" : "Start"}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Keep your learning streak alive
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-violet-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v18m9-9H3"
                />
              </svg>
            </div>

          </div>

        </div>


        {/* Current Filter */}

        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 shadow-sm text-white">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">
                Current View
              </p>

              <p className="text-lg font-bold mt-2">
                {selectedDate
                  ? selectedDate
                  : "All Notes"}
              </p>

              <p className="text-xs text-indigo-100 mt-1">
                {selectedDate
                  ? "Filtered by activity date"
                  : "Showing everything"}
              </p>

            </div>

            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              📅
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          DATE FILTER
      ====================================================== */}

      {selectedDate && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
              📅
            </div>

            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
                Date Filter
              </p>

              <p className="text-sm text-indigo-900 font-medium">
                Showing notes from{" "}
                <span className="font-bold">
                  {selectedDate}
                </span>
              </p>
            </div>

          </div>

          <button
            onClick={clearDateFilter}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition-all"
          >
            Clear filter
          </button>

        </div>
      )}


      {/* =====================================================
          HEATMAP
      ====================================================== */}

      <Heatmap
        userId={currentUser?._id}
        showToast={showToast}
        onDayClick={handleHeatmapDayClick}
      />


      {/* =====================================================
          CREATE NOTE
      ====================================================== */}

      <section className="relative overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm">

        {/* Decorative gradient */}

        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative p-6 sm:p-7">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-100">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Create a new note
              </h2>

              <p className="text-xs text-slate-400 mt-0.5">
                Capture something you learned today.
              </p>

            </div>

          </div>


          <form
            onSubmit={handleCreateNote}
            className="space-y-4"
          >

            <div>

              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Title
              </label>

              <input
                type="text"
                placeholder="e.g. Understanding JWT authentication"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-400"
              />

            </div>


            <div>

              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                What did you learn?
              </label>

              <textarea
                placeholder="Write your note, insight, code concept, or learning..."
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm resize-y placeholder:text-slate-400"
              />

            </div>


            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

              <p className="text-[11px] text-slate-400">
                💡 Keep it short, useful and searchable.
              </p>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 active:scale-[0.98] text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >

                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>

                Save Note

              </button>

            </div>

          </form>

        </div>

      </section>


      {/* =====================================================
          SAVED NOTES
      ====================================================== */}

      <section>

        {/* Section Header */}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">

          <div>

            <div className="flex items-center gap-2">

              <h2 className="text-xl font-bold text-slate-900">
                Your Notes
              </h2>

              {selectedDate && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase">
                  Filtered
                </span>
              )}

            </div>

            <p className="text-xs text-slate-400 mt-1">
              Your personal knowledge base
            </p>

          </div>


          <div className="flex items-center gap-2">

            <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600">
              {notes.length}{" "}
              {notes.length === 1 ? "note" : "notes"}
            </span>

          </div>

        </div>


        {/* Loading */}

        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">

            <div className="inline-flex items-center gap-2 text-sm text-slate-400">

              <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />

              Loading your notes...

            </div>

          </div>
        )}


        {/* Empty State */}

        {!loading && notes.length === 0 && (

          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 sm:p-16 text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <span className="text-2xl">
                📝
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-800">
              {selectedDate
                ? "No notes for this day"
                : "Your notebook is empty"}
            </h3>

            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              {selectedDate
                ? `There aren't any notes saved on ${selectedDate}.`
                : "Start documenting what you learn. Your future self will thank you."}
            </p>

            {selectedDate && (
              <button
                onClick={clearDateFilter}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all"
              >
                View all notes
              </button>
            )}

          </div>
        )}


        {/* Notes Grid */}

        {!loading && notes.length > 0 && (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {notes.map((note) => (

              <article
                key={note.noteId}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col"
              >

                {/* Top accent */}

                <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400" />


                <div className="p-5 flex flex-col flex-1">

                  {/* Note header */}

                  <div className="flex items-start justify-between gap-3 mb-3">

                    <h3 className="font-bold text-slate-900 text-sm leading-5 line-clamp-2">
                      {note.title}
                    </h3>

                    <span className="shrink-0 px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-bold">
                      v{note.version || 1}
                    </span>

                  </div>


                  {/* Content */}

                  <p className="text-slate-500 text-sm leading-6 whitespace-pre-line line-clamp-5 flex-1">
                    {note.content}
                  </p>


                  {/* Footer */}

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">

                    <div className="min-w-0">

                      <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-300">
                        Note ID
                      </p>

                      <p className="font-mono text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">
                        {note.noteId}
                      </p>

                    </div>


                    <button
                      onClick={() =>
                        handleDeleteNote(note.noteId)
                      }
                      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:text-white hover:bg-rose-500 transition-all"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="pt-4 pb-6 text-center">

        <p className="text-[11px] text-slate-400">
          Developers TIL · Build your knowledge one note at a time.
        </p>

      </footer>

    </div>

  </div>
);
}

export default Main;