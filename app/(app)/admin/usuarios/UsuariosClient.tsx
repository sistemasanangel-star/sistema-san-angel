"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

type User = {
  id: string;
  username: string;
  name: string;
  role: string;
  active: boolean;
};

export default function UsuariosClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  async function toggleActive(u: User) {
    setError("");
    const res = await fetch(`/api/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !u.active }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "No se pudo actualizar el usuario");
      return;
    }
    load();
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="card p-3 text-sm text-brand-red bg-red-50">{error}</div>
      )}

      <button
        onClick={() => {
          setEditing(null);
          setShowForm(true);
        }}
        className="btn-primary px-4 py-2 text-sm self-start"
      >
        + Nuevo usuario
      </button>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {users.map((u) => (
            <div key={u.id} className="card p-3 sm:p-4 flex flex-col gap-2 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-brand-black text-sm sm:text-base truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    @{u.username} · {u.role === "ADMIN" ? "Admin" : "Visitadora"}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                    u.active ? "badge-ok" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {u.active ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-1">
                <button
                  onClick={() => {
                    setEditing(u);
                    setShowForm(true);
                  }}
                  className="flex-1 text-xs sm:text-sm px-3 py-1.5 rounded-lg border btn-outline btn-outline-blue"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(u)}
                  className="flex-1 text-xs sm:text-sm px-3 py-1.5 rounded-lg border btn-outline btn-outline-red"
                >
                  {u.active ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <UserFormModal
          user={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function UserFormModal({
  user,
  onClose,
  onSaved,
}: {
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [username, setUsername] = useState(user?.username ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [role, setRole] = useState(user?.role ?? "VISITADORA");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name || (!user && (!username || !password))) {
      setError("Completa los campos obligatorios");
      return;
    }
    setSaving(true);
    const res = await fetch(user ? `/api/users/${user.id}` : "/api/users", {
      method: user ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        user ? { name, role, ...(password ? { password } : {}) } : { username, name, role, password }
      ),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al guardar");
      return;
    }
    onSaved();
  }

  return (
    <Modal title={user ? "Editar usuario" : "Nuevo usuario"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-sm font-medium">Nombre completo *</label>
          <input className="input-field mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Usuario (para iniciar sesión) *</label>
          <input
            className="input-field mt-1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!!user}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Rol</label>
          <select className="input-field mt-1" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="VISITADORA">Visitadora</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">
            {user ? "Nueva contraseña (opcional)" : "Contraseña *"}
          </label>
          <input
            type="password"
            className="input-field mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-brand-red">{error}</p>}

        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border border-gray-300"
          >
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-sm">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
