import React, { useState, useEffect, useRef } from "react";
import { X, Search, Shield, Eye, Edit3, Loader2 } from "lucide-react";
import axios from "axios";

const ShareModal = ({ isOpen, onClose, onShare }) => {
  const [dbUsers, setDbUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("read");
  const dropdownRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await axios.get(`${apiUrl}/auth/allUsers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setDbUsers(response.data.users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, apiUrl]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const filteredUsers = dbUsers.filter((user) => {
    const nameMatch = user.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const emailMatch = user.email
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return nameMatch || emailMatch;
  });

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.name || user.email);
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    onShare({
      targetUserId: selectedUser._id,
      emailToShareWith: selectedUser.email,
      role: selectedRole,
    });

    setSelectedUser(null);
    setSearchQuery("");
    setSelectedRole("read");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-visible animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-100">
          <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Shield size={18} className="text-emerald-500" />
            Share Research Access
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-6 flex-1">
          {/* Searchable Dropdown */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Search Colleague</span>
              {isLoadingUsers && (
                <Loader2 size={12} className="animate-spin text-emerald-500" />
              )}
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedUser(null);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search by name or email..."
                disabled={isLoadingUsers}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-700 disabled:bg-slate-50"
              />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-50 max-h-48 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user._id || user.id} // MongoDB uses _id
                      onClick={() => handleSelectUser(user)}
                      className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                        {user.name ? user.name[0] : user.email[0]}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {user.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-500 text-center">
                    No colleagues found.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Access Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setSelectedRole("read")}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-1 ${
                  selectedRole === "read"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Eye
                    size={16}
                    className={
                      selectedRole === "read"
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }
                  />
                  <span
                    className={`text-sm font-bold ${selectedRole === "read" ? "text-emerald-900" : "text-slate-700"}`}
                  >
                    Viewer
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Can only read research.
                </p>
              </div>

              <div
                onClick={() => setSelectedRole("write")}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-1 ${
                  selectedRole === "write"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Edit3
                    size={16}
                    className={
                      selectedRole === "write"
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }
                  />
                  <span
                    className={`text-sm font-bold ${selectedRole === "write" ? "text-emerald-900" : "text-slate-700"}`}
                  >
                    Editor
                  </span>
                </div>
                <p className="text-xs text-slate-500">Can chat and modify.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedUser}
              className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-md transition-colors"
            >
              Grant Access
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;
