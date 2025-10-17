from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os
import csv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🧱 Modelo del JSON
class Incidencia(BaseModel):
    id: Optional[int] = None
    usuario: str
    clase: str
    tipo: int
    incidencia: str
    prioridad: int
    estado: Optional[int] = 0


# 📂 Ruta del archivo CSV
CSV_FILE = "resources//incidencias.csv"


# 🧠 Asegura que el CSV exista y tenga encabezados
def ensure_csv_exists():
    folder = os.path.dirname(CSV_FILE)
    if folder and not os.path.exists(folder):
        os.makedirs(folder)

    file_exists = os.path.exists(CSV_FILE)

    if not file_exists:
        with open(CSV_FILE, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["id", "usuario", "clase", "tipo", "incidencia", "prioridad", "estado"])

    return file_exists


# 🧩 Carga los datos existentes del CSV en memoria
def load_csv_to_memory():
    ensure_csv_exists()
    data = {}
    next_id = 1

    with open(CSV_FILE, mode="r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                id_ = int(row["id"])
                data[id_] = {
                    "usuario": row["usuario"],
                    "clase": row["clase"],
                    "tipo": int(row["tipo"]),
                    "incidencia": row["incidencia"],
                    "prioridad": int(row["prioridad"]),
                    "estado": int(row["estado"])
                }
                next_id = max(next_id, id_ + 1)
            except (ValueError, KeyError):
                continue

    return data, next_id


# 🗂️ Cargar base de datos al iniciar la app
_db, _next_id = load_csv_to_memory()


# ✅ NUEVO ENDPOINT: obtener todas las incidencias
@app.get("/incidencias")
def get_all_incidencias():
    ensure_csv_exists()
    if not _db:
        raise HTTPException(status_code=404, detail="No hay incidencias registradas")
    return [{"id": id_, **data} for id_, data in _db.items()]


@app.get("/incidencias/{incidencia_id}")
def get_incidencia(incidencia_id: int):
    ensure_csv_exists()

    incidencia = _db.get(incidencia_id)
    if not incidencia:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")
    return {"id": incidencia_id, **incidencia}


@app.post("/incidencias", status_code=201)
def create_incidencia(incidencia: Incidencia):
    ensure_csv_exists()

    global _next_id
    incidencia.id = _next_id
    _db[_next_id] = incidencia.dict()

    # Guardar en CSV
    with open(CSV_FILE, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            incidencia.id,
            incidencia.usuario,
            incidencia.clase,
            incidencia.tipo,
            incidencia.incidencia,
            incidencia.prioridad,
            incidencia.estado
        ])

    created = {"id": _next_id, **_db[_next_id]}
    _next_id += 1
    return created


@app.put("/incidencias/{incidencia_id}")
def update_incidencia(incidencia_id: int, incidencia: Incidencia):
    ensure_csv_exists()

    if incidencia_id not in _db:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")

    incidencia.id = incidencia_id
    _db[incidencia_id] = incidencia.dict()

    # Reescribir CSV con todos los datos actualizados
    with open(CSV_FILE, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "usuario", "clase", "tipo", "incidencia", "prioridad", "estado"])
        for id_, data in _db.items():
            writer.writerow([
                id_,
                data["usuario"],
                data["clase"],
                data["tipo"],
                data["incidencia"],
                data["prioridad"],
                data["estado"]
            ])

    return {"id": incidencia_id, **_db[incidencia_id]}


if __name__ == "__main__":
    uvicorn.run("function:app", host="127.0.0.1", port=8000, reload=True)
# 🚀 Para ejecutar la aplicación, usa el comando: python function.py